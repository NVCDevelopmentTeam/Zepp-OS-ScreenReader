import { Vibrator } from '@zos/sensor'
import { log } from '@zos/utils'

export class VibrateFeedback {
  constructor() {
    this.PATTERNS = {
      notification: [50],
      success: [100],
      warning: [50, 100, 50],
      error: [100, 100, 100],
      alert: [200, 100, 200]
    }
  }

  async feedback(type, intensity = 50) {
    try {
      const pattern = this.PATTERNS[type]
      if (!pattern) throw new Error(`Invalid pattern: ${type}`)

      await Vibrator.start({
        pattern,
        intensity: Math.min(Math.max(intensity, 0), 100)
      })
      return true
    } catch (error) {
      log.error('Vibration failed:', error)
      return false
    }
  }
}