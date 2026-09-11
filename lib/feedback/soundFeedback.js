import { create, id } from '@zos/media'
import { log } from '@zos/utils'

// Module-level so the map isn't rebuilt on every play() call.
const SOUNDS = {
  success: 'success.wav',
  error: 'error.wav',
  warning: 'warning.wav',
  notification: 'notification.wav',
  info: 'info.wav',
  click: 'click.wav'
}

export class SoundFeedback {
  constructor(defaultVolume = 50) {
    this.volume = Math.min(Math.max(defaultVolume, 0), 100)
    this.player = null
    this.initialized = false
    this._prepareHandler = null
  }

  init() {
    if (this.initialized) return true
    try {
      this.player = create(id.PLAYER)
      this.initialized = true
      return true
    } catch (error) {
      log.error('Failed to create audio player:', error)
      return false
    }
  }

  setVolume(volume) {
    this.volume = Math.min(Math.max(volume, 0), 100)
    if (this.player) this.player.setVolume(this.volume)
  }

  async play(sound) {
    // Master on/off lives on the "Feedback" screen (settingsKey
    // 'soundFeedbackEnabled') since that's what this class already gates
    // event-driven confirmation/error sounds behind.
    const config = globalThis.ScreenReaderConfig || {}
    if (config.soundFeedbackEnabled === false) {
      return
    }

    if (!this.initialized && !this.init()) return
    if (!this.player) return

    try {
      const soundFile = SOUNDS[sound]
      if (!soundFile) {
        log.warn(`Invalid sound type: ${sound}`)
        return
      }

      // Detach any previous prepare handler to avoid leaking listeners
      // across back-to-back play() calls.
      if (this._prepareHandler) {
        try {
          this.player.removeEventListener(this.player.event.PREPARE, this._prepareHandler)
        } catch (_e) {
          // ignore — some SDKs throw when removing an inactive listener
        }
        this._prepareHandler = null
      }

      // "Master Volume" (settingsKey 'masterVolume', 0-100, from
      // setting/volumeSetting.js) applies here since this player is the
      // only place ZSR plays non-speech audio.
      if (typeof config.masterVolume === 'number') {
        this.setVolume(config.masterVolume)
      }

      // "Sound Theme" (settingsKey 'soundTheme', from
      // setting/SoundSetting.js) selects which asset subfolder to load
      // from - Jieshuo calls this concept "Sound Schemes". The 'default'
      // theme keeps the original flat assets/audio/*.wav layout so
      // existing installs need no new files; 'classic'/'minimal' expect
      // assets/audio/<theme>/*.wav. NOTE: assets/audio/ currently ships
      // empty - actual sound files still need to be added by whoever owns
      // audio assets. Until then, prepare() will fail and this logs a
      // warning instead of throwing (see the PREPARE handler below).
      const theme = config.soundTheme && config.soundTheme !== 'default' ? config.soundTheme : null
      const filePath = theme ? `audio/${theme}/${soundFile}` : `audio/${soundFile}`

      this.player.stop()
      this.player.setSource(this.player.source.FILE, { file: filePath })

      const onPrepare = (result) => {
        log.info('Sound prepare result:', result)
        if (!result) {
          log.warn(`SoundFeedback: could not prepare "${filePath}" (missing asset?)`)
        }
        if (result && this.player) {
          this.player.start()
        }
        if (this.player) {
          try {
            this.player.removeEventListener(this.player.event.PREPARE, onPrepare)
          } catch (_e) {
            // ignore
          }
        }
        this._prepareHandler = null
      }

      this._prepareHandler = onPrepare
      this.player.addEventListener(this.player.event.PREPARE, onPrepare)
      this.player.prepare()
    } catch (error) {
      log.error('Sound playback failed:', error)
    }
  }

  stop() {
    if (this.player) this.player.stop()
  }

  release() {
    if (this.player) {
      this.player.stop()
      this.player.release()
      this.player = null
      this.initialized = false
    }
  }
}

export default new SoundFeedback()
