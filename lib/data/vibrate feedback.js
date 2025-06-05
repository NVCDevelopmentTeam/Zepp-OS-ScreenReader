import { Vibrator } from '@zos/sensor'
import { log } from '@zos/utils'

export class VibrationManager {
  static PATTERNS = {
    notification: [50],
    success: [100],
    warning: [50, 100, 50],
    error: [100, 100, 100],
    alert: [200, 100, 200]
  }

  static async validateHaptics() {
    try {
      return await Vibrator.hasHaptics()
    } catch {
      return false
    }
  }

  static async feedback(type = 'notification', options = {}) {
    try {
      const hasHaptics = await this.validateHaptics()
      if (!hasHaptics) {
        throw new Error('Haptics not supported')
      }

      const pattern = this.PATTERNS[type]
      if (!pattern) {
        throw new Error(`Invalid pattern: ${type}`)
      }

      await Vibrator.start({
        pattern,
        repeat: Math.min(options.repeat || 1, 3),
        intensity: this.getIntensityForType(type, options.intensity)
      })

      return true
    } catch (error) {
      log.error('Vibration failed:', error)
      return false
    }
  }

  static getIntensityForType(type, customIntensity) {
    if (customIntensity !== undefined) {
      return Math.min(Math.max(customIntensity, 0), 100)
    }
    return type === 'error' ? 100 : 50
  }

  static async stop() {
    try {
      await Vibrator.stop()
      return true
    } catch (error) {
      log.error('Failed to stop vibration:', error)
      return false
    }
  }
}