import { Display } from '@zos/display'
import { log } from '@zos/utils'

class DisplayController {
  constructor() {
    this.brightness = 80
    this.contrast = 1.0
    this.autoAdjust = true
  }

  async setBrightness(level) {
    try {
      const brightness = Math.min(Math.max(level, 0), 100)
      await Display.setBrightness(brightness)
      this.brightness = brightness
      return true
    } catch (error) {
      log.error('Brightness adjustment failed:', error)
      return false
    }
  }

  async setContrast(level) {
    try {
      const contrast = Math.min(Math.max(level, 0.5), 2.0)
      await Display.setContrast(contrast)
      this.contrast = contrast
      return true
    } catch (error) {
      log.error('Contrast adjustment failed:', error)
      return false
    }
  }

  toggleAutoAdjust() {
    this.autoAdjust = !this.autoAdjust
    return this.autoAdjust
  }
}

export default new DisplayController()
