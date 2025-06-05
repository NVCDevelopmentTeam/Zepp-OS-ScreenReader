import { SettingsUtils } from './utils'
import { OCR } from '@zos/sensor'
import { log } from '@zos/utils'

// Define the settings page
Page({
  state: {
    ocrMode: 'auto',
    ocrLanguage: 'en-US',
    ocrRegion: 'full'
  },

  onInit() {
    this.validateOCRCapability()
  },

  validateOCRCapability() {
    const { capabilities } = SettingsUtils.init()
    if (!capabilities.ocr) {
      throw new Error('OCR not supported on this device')
    }
  },

  validateOCR(type, value) {
    const validations = {
      mode: ['auto', 'manual'],
      language: SettingsUtils.validateLanguage,
      region: ['full', 'selection']
    }

    const validator = validations[type]
    return Array.isArray(validator) 
      ? validator.includes(value)
      : validator(value)
  },

  async changeOcrMode(e) {
    try {
      const newValue = e.newValue[0]
      if (!this.validateOCR('mode', newValue)) {
        throw new Error('Invalid OCR mode')
      }
      const success = await SettingsUtils.handleSettingChange(
        () => OCR.setMode(newValue),
        newValue,
        'ocrMode'
      )
      if (success) this.setState({ ocrMode: newValue })
    } catch (error) {
      log.error('OCR mode change failed:', error)
    }
  },

  async changeOcrLanguage(e) {
    try {
      const newValue = e.newValue[0]
      if (!this.validateOCR('language', newValue)) {
        throw new Error('Invalid OCR language')
      }
      const success = await SettingsUtils.handleSettingChange(
        () => OCR.setLanguage(newValue),
        newValue,
        'ocrLanguage'
      )
      if (success) this.setState({ ocrLanguage: newValue })
    } catch (error) {
      log.error('OCR language change failed:', error)
    }
  },

  async changeOcrRegion(e) {
    try {
      const newValue = e.newValue[0]
      if (!this.validateOCR('region', newValue)) {
        throw new Error('Invalid OCR region')
      }
      const success = await SettingsUtils.handleSettingChange(
        () => OCR.setRegion(newValue),
        newValue,
        'ocrRegion'
      )
      if (success) this.setState({ ocrRegion: newValue })
    } catch (error) {
      log.error('OCR region change failed:', error)
    }
  }
})
