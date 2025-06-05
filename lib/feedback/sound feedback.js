import { Audio } from '@zos/sensor'
import { log } from '@zos/utils'

export class SoundFeedback {
  static SOUNDS = {
    success: 'success.wav',
    error: 'error.wav',
    warning: 'warning.wav',
    notification: 'notification.wav'
  }

  static async play(type = 'notification') {
    try {
      if (!this.SOUNDS[type]) {
        throw new Error(`Invalid sound type: ${type}`)
      }

      await Audio.play({
        filename: this.SOUNDS[type],
        volume: type === 'error' ? 1.0 : 0.7
      })
      return true
    } catch (error) {
      log.error('Sound playback failed:', error)
      return false
    }
  }
}
