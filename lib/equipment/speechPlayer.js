import { writeFileSync, rmSync } from '@zos/fs'
import { localStorage } from '@zos/storage'
import { log } from '@zos/utils'
import { createPlayer, getMedia } from './mediaSupport.js'
import { decodeBase64 } from '../utils/base64.js'

/**
 * Plays synthesized speech on the watch.
 *
 * The Side Service returns each utterance as a small MP3; this class writes it
 * to the Mini Program's /data directory and plays it with the official media
 * player. The last CACHE_LIMIT utterances are kept, so repeated phrases (menus,
 * labels) are spoken instantly and keep working without the phone.
 */
const CACHE_LIMIT = 24
const CACHE_INDEX_KEY = 'zsrTtsCache'
const PLAY_TIMEOUT_MS = 20000

/** djb2 hash -> short, filename-safe key */
export function cacheKeyFor(voice, rate, pitch, text) {
  const input = `${voice}|${rate}|${pitch}|${text}`
  let h = 5381
  for (let i = 0; i < input.length; i++) {
    h = ((h << 5) + h + input.charCodeAt(i)) | 0
  }
  return (h >>> 0).toString(36) + input.length.toString(36)
}

class SpeechPlayer {
  constructor() {
    this.player = null
    this.cancelCurrent = null
    this.sequenceToken = 0
    /** @type {string[]} */
    this.index = this.loadIndex()
  }

  /** Audio playback exists on this firmware (API_LEVEL 3.0+). */
  get available() {
    return getMedia() !== null
  }

  loadIndex() {
    try {
      const raw = localStorage.getItem(CACHE_INDEX_KEY)
      const list = raw ? JSON.parse(raw) : []
      return Array.isArray(list) ? list : []
    } catch (_e) {
      return []
    }
  }

  saveIndex() {
    try {
      localStorage.setItem(CACHE_INDEX_KEY, JSON.stringify(this.index))
    } catch (_e) {
      /* cache is an optimization only */
    }
  }

  fileName(key) {
    return `zsr_tts_${key}.mp3`
  }

  has(key) {
    return this.index.indexOf(key) !== -1
  }

  /** Save MP3 bytes and mark the key most-recent, evicting the oldest. */
  store(key, mp3Base64) {
    const bytes = decodeBase64(mp3Base64)
    writeFileSync({ path: this.fileName(key), data: bytes.buffer })
    this.index = this.index.filter((k) => k !== key)
    this.index.push(key)
    while (this.index.length > CACHE_LIMIT) {
      const old = this.index.shift()
      try {
        rmSync({ path: this.fileName(old) })
      } catch (_e) {
        /* already gone */
      }
    }
    this.saveIndex()
  }

  touch(key) {
    this.index = this.index.filter((k) => k !== key)
    this.index.push(key)
    this.saveIndex()
  }

  ensurePlayer() {
    if (!this.player) this.player = createPlayer()
    return this.player
  }

  /**
   * Play a stored utterance.
   * @param {string} key
   * @returns {Promise<boolean>} true when playback finished
   */
  play(key) {
    return this.playFile(this.fileName(key))
  }

  /**
   * Write base64 audio into /data under `name`.
   * @param {string} name
   * @param {string} base64
   */
  writeBase64(name, base64) {
    const bytes = decodeBase64(base64)
    writeFileSync({ path: name, data: bytes.buffer })
  }

  /** @param {string} name */
  removeFile(name) {
    try {
      rmSync({ path: name })
    } catch (_e) {
      /* already gone */
    }
  }

  /**
   * Play several stored files back to back (offline voice speaks a sentence
   * as a sequence of word clips). Stops early if stop() is called.
   * @param {string[]} names
   * @returns {Promise<boolean>} true when every clip played
   */
  async playSequence(names) {
    this.stop()
    const token = ++this.sequenceToken
    for (const name of names) {
      if (token !== this.sequenceToken) return false
      const ok = await this.playFile(name, true)
      if (!ok) return false
    }
    return token === this.sequenceToken
  }

  /**
   * Play any file stored in /data by name.
   * @param {string} name
   * @param {boolean} [keepSequence] internal: do not cancel a running sequence
   * @returns {Promise<boolean>}
   */
  playFile(name, keepSequence = false) {
    const player = this.ensurePlayer()
    if (!player) return Promise.resolve(false)
    if (keepSequence) this.stopPlaybackOnly()
    else this.stop()
    // Files live in /data. Try the explicit data:// scheme first, then the
    // bare name, because firmware builds differ in how they resolve paths.
    const sources = [`data://${name}`, name]

    return new Promise((resolve) => {
      let done = false
      let timer = null
      const finish = (ok) => {
        if (done) return
        done = true
        if (timer) clearTimeout(timer)
        try {
          player.removeEventListener(player.event.PREPARE, onPrepare)
          player.removeEventListener(player.event.COMPLETE, onComplete)
        } catch (_e) {
          /* listener already removed */
        }
        this.cancelCurrent = null
        resolve(ok)
      }

      let attempt = 0
      const tryNext = () => {
        if (attempt >= sources.length) {
          log.warn('Speech file could not be prepared: ' + name)
          finish(false)
          return
        }
        try {
          player.stop()
          player.setSource(player.source.FILE, { file: sources[attempt++] })
          const cfg = globalThis.ScreenReaderConfig || {}
          if (typeof cfg.speechVolume === 'number') {
            player.setVolume(Math.round(Math.min(Math.max(cfg.speechVolume, 0), 1) * 100))
          }
          player.prepare()
        } catch (e) {
          log.warn('Speech playback setup failed: ' + String(e))
          tryNext()
        }
      }

      const onPrepare = (result) => {
        if (result) {
          try {
            player.start()
          } catch (e) {
            log.warn('Speech start failed: ' + String(e))
            finish(false)
          }
        } else {
          tryNext()
        }
      }
      const onComplete = () => {
        try {
          player.stop()
        } catch (_e) {
          /* ignore */
        }
        finish(true)
      }

      this.cancelCurrent = () => finish(false)
      timer = setTimeout(() => finish(false), PLAY_TIMEOUT_MS)
      player.addEventListener(player.event.PREPARE, onPrepare)
      player.addEventListener(player.event.COMPLETE, onComplete)
      tryNext()
    })
  }

  /** Stop playback and release the native player (call when the app exits). */
  dispose() {
    this.stop()
    if (this.player) {
      try {
        if (typeof this.player.release === 'function') this.player.release()
      } catch (_e) {
        /* already released */
      }
      this.player = null
    }
  }

  /** Stop the current clip without cancelling a running sequence. */
  stopPlaybackOnly() {
    if (this.cancelCurrent) this.cancelCurrent()
    if (this.player) {
      try {
        this.player.stop()
      } catch (_e) {
        /* nothing playing */
      }
    }
  }

  /** Interrupt whatever is being spoken (including a running sequence). */
  stop() {
    this.sequenceToken++
    if (this.cancelCurrent) this.cancelCurrent()
    if (this.player) {
      try {
        this.player.stop()
      } catch (_e) {
        /* nothing playing */
      }
    }
  }
}

export default new SpeechPlayer()
