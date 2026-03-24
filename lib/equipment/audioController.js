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
}

export default new AudioController()
