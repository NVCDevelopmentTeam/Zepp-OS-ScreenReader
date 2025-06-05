import { SettingsUtils } from './utils'
import { createWidget, widget, text } from '@zos/ui' 
import { log } from '@zos/utils'
import { getDeviceInfo } from '@zos/device'

Page({
  state: {
    fontSize: 16,
    fontFamily: 'default',
    fontWeight: 'normal',
    fontScale: 1.0,
    supported: false
  },

  onInit() {
    this.checkFontSupport()
  },

  async checkFontSupport() {
    try {
      const deviceInfo = await getDeviceInfo()
      this.setState({ 
        supported: deviceInfo.capabilities?.text?.fonts || false 
      })
    } catch (error) {
      log.error('Font support check failed:', error)
    }
  },

  build() {
    if (!this.state.supported) {
      return this.showUnsupportedMessage()
    }

    this.createFontControls()
  },

  createFontControls() {
    const container = createWidget(widget.CONTAINER)

    createWidget(widget.SLIDER, {
      x: 0,
      y: 0,
      w: '100%',
      h: 50,
      min: 12,
      max: 32,
      value: this.state.fontSize,
      onChange: (value) => this.changeFontSize(value)
    })

    createWidget(widget.SELECT, {
      x: 0,
      y: 60,
      w: '100%',
      h: 50,
      options: ['default', 'system', 'monospace'],
      value: this.state.fontFamily,
      onChange: (value) => this.changeFontFamily(value) 
    })

    return container
  },

  async changeFontSize(value) {
    try {
      if (!SettingsUtils.validateNumericRange(value, 12, 32)) {
        throw new Error('Invalid font size') 
      }

      const success = await SettingsUtils.handleSettingChange(
        () => text.setFontSize(value),
        value,
        'fontSize'
      )

      if (success) {
        this.setState({ fontSize: value })
      }
    } catch (error) {
      log.error('Font size change failed:', error)
    }
  },

  async changeFontScale(value) {
    try {
      if (!SettingsUtils.validateDisplay.fontScale(value)) {
        throw new Error('Invalid font scale')
      }
      
      const success = await SettingsUtils.handleSettingChange(
        () => text.setFontScale(value),
        value, 
        'fontScale'
      )

      if (success) {
        this.setState({ fontScale: value })
      }
    } catch (error) {
      log.error('Font scale change failed:', error)
    }
  }
})