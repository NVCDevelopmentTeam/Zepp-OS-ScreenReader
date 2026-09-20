import { create, id } from '@zos/media'
import { log } from '@zos/utils'

class AudioController {
  constructor() {
    this.volume = 70
    this.enabled = true
    this.player = create(id.PLAYER)
    this.SOUNDS = {
      tap: 'tap.wav',
      success: 'success.wav',
      error: 'error.wav',
      warning: 'warning.wav',
      notification: 'notification.wav'
    }
  }

  async playSound(type) {
    if (!this.enabled || !this.player) return false

    try {
      const sound = this.SOUNDS[type]
      if (!sound) throw new Error('Invalid sound type')

      this.player.stop()
      this.player.setSource(this.player.source.FILE, { file: `audio/${sound}` })
      this.player.prepare()
      this.player.start()
      return true
    } catch (error) {
      log.error('Audio playback failed:', error)
      return false
    }
  }

  setVolume(level) {
    this.volume = Math.min(Math.max(level, 0), 100)
    if (this.player) this.player.setVolume(this.volume)
  }

  startDucking() {
    if (this.isDucked) return
    this.isDucked = true
    this.preDuckedVolume = this.volume
    const duckedVol = Math.max(5, Math.floor(this.volume * 0.25))
    if (this.player) {
      try {
        this.player.setVolume(duckedVol)
      } catch (_e) {
        // Safe fallback
      }
    }
  }

  stopDucking() {
    if (!this.isDucked) return
    this.isDucked = false
    if (this.player && this.preDuckedVolume !== undefined) {
      try {
        this.player.setVolume(this.preDuckedVolume)
      } catch (_e) {
        // Safe fallback
      }
    }
  }
}

export default new AudioController()
