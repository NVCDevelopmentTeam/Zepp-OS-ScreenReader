import { Audio } from '@zos/sensor'
import { log } from '@zos/utils'

class AudioController {
  static SOUNDS = {
    tap: 'tap.wav',
    success: 'success.wav',
    error: 'error.wav',
    warning: 'warning.wav',
    notification: 'notification.wav'
  }

  constructor() {
    this.volume = 0.7
    this.enabled = true
  }

  async playSound(type) {
    if (!this.enabled) return false

    try {
      const sound = AudioController.SOUNDS[type]
      if (!sound) throw new Error('Invalid sound type')

      await Audio.play({
        filename: sound,
        volume: this.volume
      })
      return true
    } catch (error) {
      log.error('Audio playback failed:', error)
      return false
    }
  }

  setVolume(level) {
    this.volume = Math.min(Math.max(level, 0), 1)
  }
}

export default new AudioController()
