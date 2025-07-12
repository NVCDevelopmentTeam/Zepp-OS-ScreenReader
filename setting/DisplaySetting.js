import { settingsManager } from './utils'
import { Display } from '@zos/display'
import { log } from '@zos/utils'

Page({
  state: {
    brightness: 50,
    contrast: 1.0,
    fontScale: 1.0
  },

  onInit() {
    this.validateDisplayCapabilities()
  },

  async validateDisplayCapabilities() {
    const { capabilities } = await settingsManager.deviceManager.validate()
    if (!capabilities.display) {
      throw new Error('Display customization not supported')
    }
  },

  async changeBrightness(value) {
    try {
      const success = await settingsManager.handleSettingChange(
        () => Display.setBrightness(value),
        value,
        'brightness'
      )
      if (success) this.setState({ brightness: value })
    } catch (error) {
      log.error('Brightness change failed:', error)
    }
  },

  async changeContrast(value) {
    try {
      if (!settingsManager.validateDisplay.contrast(value)) {
        throw new Error('Invalid contrast value')
      }
      
      const success = await settingsManager.handleSettingChange(
        () => Display.setContrast(value),
        value,
        'contrast'
      )
      if (success) this.setState({ contrast: value })
    } catch (error) {
      log.error('Contrast change failed:', error)
    }
  }
})
