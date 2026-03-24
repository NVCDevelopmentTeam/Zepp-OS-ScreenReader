import { accessibility } from '@zos/accessibility'
import { settingsManager } from './utils.js'
import { logger } from '../utils/logger.js'

// Define the settings page
Page({
  state: {
    // The current values of the braille settings
    brailleDisplayMode: 'auto',
    brailleInputMode: 'auto',
    brailleKeyboardLayout: 'en-US'
  },
  // The function to change the braille display mode
  changeBrailleDisplayMode: async function (e) {
    try {
      const newValue = e.newValue[0]
      if (!settingsManager.validateInput.braille.modes.includes(newValue)) {
        logger.error('Invalid braille display mode:', newValue)
        return
      }

      const [success] = await settingsManager.handleSettingChange(
        () => accessibility.setBrailleDisplayMode({ mode: newValue }),
        newValue,
        'brailleDisplayMode'
      )

      if (success) {
        this.setState({ brailleDisplayMode: newValue })
      }
    } catch (error) {
      logger.error('Braille display mode change error:', error)
    }
  },
  // The function to change the braille input mode
  changeBrailleInputMode: async function (e) {
    try {
      const newValue = e.newValue[0]
      if (!settingsManager.validateSettings.mode(newValue)) {
        logger.error('Invalid input mode:', newValue)
        return
      }

      const [success] = await settingsManager.handleSettingChange(
        () => accessibility.setBrailleInputMode({ mode: newValue }),
        newValue,
        'brailleInputMode'
      )

      if (success) {
        this.setState({ brailleInputMode: newValue })
      }
    } catch (error) {
      logger.error('Braille input mode change error:', error)
    }
  },
  // The function to change the braille keyboard layout
  changeBrailleKeyboardLayout: async function (e) {
    try {
      const newValue = e.newValue[0]
      if (!settingsManager.validateInput.braille.layouts.includes(newValue)) {
        logger.error('Invalid braille keyboard layout:', newValue)
        return
      }

      const [success] = await settingsManager.handleSettingChange(
        () => accessibility.setBrailleKeyboardLayout({ layout: newValue }),
        newValue,
        'brailleKeyboardLayout'
      )

      if (success) {
        this.setState({ brailleKeyboardLayout: newValue })
      }
    } catch (error) {
      logger.error('Braille keyboard layout change error:', error)
    }
  }
})
