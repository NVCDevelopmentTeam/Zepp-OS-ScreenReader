import { SettingsUtils } from './utils'
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

  validateDisplayCapabilities() {
    const { capabilities } = SettingsUtils.init()
    if (!capabilities.display) {
      throw new Error('Display customization not supported')
    }
  },

  async changeBrightness(value) {
    try {
      const success = await SettingsUtils.handleSettingChange(
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
      if (!SettingsUtils.validateDisplay.contrast(value)) {
        throw new Error('Invalid contrast value')
      }
      
      const success = await SettingsUtils.handleSettingChange(
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
