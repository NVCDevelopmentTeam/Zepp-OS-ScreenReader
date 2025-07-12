import { Vibrator } from '@zos/sensor'
import { log } from '@zos/utils'

class VibrationController {
  constructor() {
    this.enabled = true
    this.intensity = 80
    this.PATTERNS = {
      tap: [30],
      selection: [50],
      error: [30, 50, 30],
      notification: [50, 100],
      warning: [100, 50, 100]
    }
  }

  async vibrate(pattern, repeat = 1) {
    if (!this.enabled) return false

    try {
      const duration = Array.isArray(pattern) ? pattern : this.PATTERNS[pattern]
      if (!duration) throw new Error('Invalid pattern')

      await Vibrator.stop()
      await Vibrator.vibrate({
        pattern: duration,
        repeat: Math.min(repeat, 3),
        intensity: this.intensity
      })
      return true
    } catch (error) {
      log.error('Vibration failed:', error)
      return false
    }
  }
}

export default new VibrationController()