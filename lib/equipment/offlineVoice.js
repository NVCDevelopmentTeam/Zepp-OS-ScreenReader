import { readFileSync, writeFileSync } from '@zos/fs'
import { log } from '@zos/utils'
import SpeechPlayer from './speechPlayer.js'
import { tokenizeForSpeech, baseTokens } from '../utils/speechTokens.js'
import { VOCABULARY } from '../utils/vocabulary.js'

/**
 * Offline voice: lets ZSR speak interface labels on the watch with NO phone
 * round trip, like the offline voices TalkBack downloads.
 *
 * While the phone is connected, ZSR downloads one tiny clip per word, letter
 * and number (synthesized by eSpeak NG on the phone) into the watch's /data
 * folder - about 0.8-1 MB per language, nothing bundled in the app package.
 * Afterwards any text made only of those units is spoken instantly by
 * playing the clips in sequence. Unknown words (names, message text) are
 * still synthesized through the phone.
 *
 * The download is resumable: progress is saved after every batch.
 */
const INDEX_FILE = 'zsr_voice_index.json'
const BATCH_SIZE = 8
/** Sentences longer than this go to the phone: composed speech suits labels. */
export const MAX_OFFLINE_TOKENS = 14

/** djb2 -> short file-name-safe string */
function hash(input) {
  let h = 5381
  for (let i = 0; i < input.length; i++) h = ((h << 5) + h + input.charCodeAt(i)) | 0
  return (h >>> 0).toString(36)
}

class OfflineVoice {
  constructor() {
    /** @type {{ v: number, packs: Record<string, { sig: string, files: Record<string, string> }> } | null} */
    this.index = null
    this.syncing = false
    /** @type {Record<string, string>} */
    this.state = {}
  }

  load() {
    if (this.index) return this.index
    try {
      const raw = readFileSync({ path: INDEX_FILE, options: { encoding: 'utf8' } })
      const parsed = raw ? JSON.parse(raw) : null
      this.index = parsed && parsed.v === 1 && parsed.packs ? parsed : { v: 1, packs: {} }
    } catch (_e) {
      this.index = { v: 1, packs: {} }
    }
    return this.index
  }

  save() {
    try {
      writeFileSync({
        path: INDEX_FILE,
        data: JSON.stringify(this.index),
        options: { encoding: 'utf8' }
      })
      return true
    } catch (e) {
      log.warn('Offline voice index could not be saved: ' + String(e))
      return false
    }
  }

  /** @param {string} voice e.g. 'vi', 'zh', 'en-US+f3' */
  langOf(voice) {
    const base = String(voice || 'en').toLowerCase()
    if (base.startsWith('vi')) return 'vi'
    if (base.startsWith('zh') || base.startsWith('cmn')) return 'zh'
    return 'en'
  }

  signature(voice, rate, pitch) {
    return `${voice}|${rate}|${pitch}`
  }

  unitsFor(lang) {
    return (VOCABULARY[lang] || []).concat(baseTokens())
  }

  /**
   * Clip files that speak `text`, or null if anything is missing.
   * @returns {string[] | null}
   */
  plan(text, voice, rate, pitch) {
    const tokens = tokenizeForSpeech(text)
    if (tokens.length === 0 || tokens.length > MAX_OFFLINE_TOKENS) return null
    const pack = this.load().packs[this.langOf(voice)]
    if (!pack || pack.sig !== this.signature(voice, rate, pitch)) return null
    const files = []
    for (const t of tokens) {
      const file = pack.files[t]
      if (!file) return null
      files.push(file)
    }
    return files
  }

  /**
   * Speak `text` from the downloaded clips.
   * @returns {Promise<boolean | null>} null = cannot be spoken offline
   */
  async speak(text, voice, rate, pitch) {
    if (!SpeechPlayer.available) return null
    const files = this.plan(text, voice, rate, pitch)
    if (!files) return null
    return SpeechPlayer.playSequence(files)
  }

  /** { have, total } for a language, for progress reporting. */
  progress(voice) {
    const lang = this.langOf(voice)
    const pack = this.load().packs[lang]
    const total = this.unitsFor(lang).length
    return { have: pack ? Object.keys(pack.files).length : 0, total }
  }

  /**
   * Download the missing clips for one language. Safe to call repeatedly:
   * resumes where it stopped and does nothing while already running.
   *
   * @param {(params: object) => Promise<any>} requestBatch sends TTS_BATCH to the phone
   * @param {{ voice: string, rate: number, pitch: number, isBusy?: () => boolean }} options
   * @returns {Promise<{ status: 'complete' | 'partial' | 'unavailable' | 'full', have: number, total: number }>}
   */
  async sync(requestBatch, options) {
    const { voice, rate, pitch } = options
    const lang = this.langOf(voice)
    const total = this.unitsFor(lang).length
    if (this.syncing || !SpeechPlayer.available) {
      return { status: 'unavailable', ...this.progress(voice) }
    }
    this.syncing = true
    try {
      const index = this.load()
      const sig = this.signature(voice, rate, pitch)
      let pack = index.packs[lang]
      if (pack && pack.sig !== sig) {
        // Voice / rate / pitch changed: old clips would sound wrong.
        Object.keys(pack.files).forEach((t) => SpeechPlayer.removeFile(pack.files[t]))
        pack = null
      }
      if (!pack) pack = index.packs[lang] = { sig, files: {} }

      const pending = this.unitsFor(lang).filter((t) => !pack.files[t])
      for (let i = 0; i < pending.length; i += BATCH_SIZE) {
        // Never compete with live speech: wait until the reader is idle.
        for (let wait = 0; wait < 20 && options.isBusy && options.isBusy(); wait++) {
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
        const items = pending.slice(i, i + BATCH_SIZE)
        let response
        try {
          response = await requestBatch({ items, voice, rate, pitch })
        } catch (e) {
          log.warn('Offline voice batch failed: ' + String(e))
          this.save()
          return { status: 'partial', ...this.progress(voice) }
        }
        if (!response || !Array.isArray(response.clips)) {
          this.save()
          return { status: 'partial', ...this.progress(voice) }
        }
        for (const clip of response.clips) {
          const name = `zsr_w_${lang}_${hash(clip.t)}.mp3`
          try {
            SpeechPlayer.writeBase64(name, clip.b)
            pack.files[clip.t] = name
          } catch (e) {
            log.warn('Offline voice: storage full or write failed: ' + String(e))
            this.save()
            return { status: 'full', ...this.progress(voice) }
          }
        }
        this.save()
        if (response.result !== 'OK') return { status: 'partial', ...this.progress(voice) }
      }
      this.save()
      const have = Object.keys(pack.files).length
      return { status: have >= total ? 'complete' : 'partial', have, total }
    } finally {
      this.syncing = false
    }
  }
}

export default new OfflineVoice()
