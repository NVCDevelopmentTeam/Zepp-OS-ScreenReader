import { setBrightness, setAutoBrightness } from '@zos/display'
import { log } from '@zos/utils'

/**
 * Display control using the official `@zos/display` functions
 * (`setBrightness`, `setAutoBrightness`). There is no public contrast API in
 * Zepp OS, so contrast changes are reported as unsupported instead of
 * pretending to succeed.
 */
class DisplayController {
  constructor() {
    this.brightness = 80
    this.autoAdjust = true
  }

  /** @param {number} level 0-100 */
  setBrightness(level) {
    try {
      const value = Math.round(Math.min(Math.max(Number(level) || 0, 0), 100))
      setBrightness({ brightness: value })
      this.brightness = value
      return true
    } catch (/** @type {any} */ error) {
      log.error('Brightness adjustment failed:', error)
      return false
    }
  }

  /** @returns {boolean} always false: no public contrast API exists. */
  setContrast(_level) {
    return false
  }

  toggleAutoAdjust() {
    this.autoAdjust = !this.autoAdjust
    try {
      setAutoBrightness({ autoBright: this.autoAdjust })
    } catch (/** @type {any} */ error) {
      log.warn('Auto brightness toggle failed:', error)
    }
    return this.autoAdjust
  }
}

export default new DisplayController()
