import { SettingsUtils } from './utils'
import { Text } from '@zos/ui'
import { log } from '@zos/utils'

// Import the accessibility module
const accessibility = require('@system.accessibility');

// Define the settings page
Page({
  data: {
    // The current values of the language settings
    preferredLanguage: 'en-US',
    fallbackLanguage: 'zh-CN',
    languageDetection: 'auto'
  },
  // The function to change the preferred language
  async changePreferredLanguage(e) {
    try {
      const newValue = e.newValue[0]
      if (!SettingsUtils.validateLanguage(newValue)) {
        throw new Error('Invalid language code')
      }

      const success = await SettingsUtils.handleSettingChange(
        () => Text.setLanguage(newValue),
        newValue,
        'preferredLanguage'
      )
      if (success) this.setState({ preferredLanguage: newValue })
    } catch (error) {
      log.error('Language change failed:', error)
    }
  },
  // The function to change the fallback language
  async changeFallbackLanguage(e) {
    try {
      const newValue = e.newValue[0]
      if (!SettingsUtils.validateLanguage(newValue)) {
        throw new Error('Invalid fallback language')
      }

      const success = await SettingsUtils.handleSettingChange(
        () => Text.setFallbackLanguage(newValue),
        newValue,
        'fallbackLanguage'
      )
      if (success) this.setState({ fallbackLanguage: newValue })
    } catch (error) {
      log.error('Fallback language change failed:', error)
    }
  },
  // The function to change the language detection mode
  async changeLanguageDetection(e) {
    try {
      const newValue = e.newValue[0]
      if (!SettingsUtils.validateSettings.mode(newValue)) {
        throw new Error('Invalid detection mode')
      }

      const success = await SettingsUtils.handleSettingChange(
        () => Text.setLanguageDetection(newValue),
        newValue,
        'languageDetection'
      )
      if (success) this.setState({ languageDetection: newValue })
    } catch (error) {
      log.error('Language detection change failed:', error)
    }
  }
});
