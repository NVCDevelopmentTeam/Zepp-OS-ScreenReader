import { log } from '@zos/utils'
import { VibrationManager } from '../feedback/vibrateFeedback.js'

/**
 * Switchable vibration for extensions. It drives the same vibration engine the reader uses
 * (VibrationManager), so named patterns and the user's intensity setting stay consistent.
 * Named patterns: 'notification', 'success', 'warning', 'error', 'alert', 'info'.
 */
class VibrationController {
  constructor() {
    this.enabled = true
    /** @type {VibrationManager | null} */
    this.fallback = null
  }

  /** @returns {VibrationManager} the reader's own engine, or a private one before it exists */
  engine() {
    const shared = globalThis.ScreenReaderInstance && globalThis.ScreenReaderInstance.vibration
    if (shared) return shared
    if (!this.fallback) this.fallback = new VibrationManager()
    return this.fallback
  }

  /**
   * @param {string | number} pattern named pattern, or a vibrator scene number
   * @returns {Promise<boolean>} false when disabled or the vibration failed
   */
  async vibrate(pattern) {
    if (!this.enabled) return false
    try {
      await this.engine().vibrate(pattern)
      return true
    } catch (/** @type {any} */ error) {
      log.warn('Vibration failed: ' + String(error))
      return false
    }
  }
}

export default new VibrationController()
