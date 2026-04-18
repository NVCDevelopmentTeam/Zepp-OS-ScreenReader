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

      this.player.stop()
      this.player.setSource(this.player.source.FILE, { file: `audio/${soundFile}` })

      const onPrepare = (result) => {
        log.info('Sound prepare result:', result)
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
