import { Audio } from '@zos/sensor'
import { log } from '@zos/utils'

class SoundManager {
  static async initialize() {
    try {
      const initialized = await Audio.init()
      if (!initialized) {
        throw new Error('Audio initialization failed')
      }
      return true
    } catch (error) {
      log.error('Sound init failed:', error)
      return false
    }
  }

  static validateVolume(volume) {
    return Math.min(Math.max(parseFloat(volume) || 0, 0), 1)
  }

  static async playFeedback(type, volume = 0.7) {
    try {
      await Audio.play({
        type,
        volume: this.validateVolume(volume)
      })
      return true
    } catch (error) {
      log.error('Sound feedback failed:', error)
      return false
    }
  }
}

export default SoundManager
