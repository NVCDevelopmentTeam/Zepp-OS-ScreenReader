// Import the accessibility module
import { accessibility } from '@system.accessibility';
import settingsUtils, { handleSettingChange } from './utils';
import { logger } from '../utils/logger';

// Define the settings page
Page({
  data: {
    // The current values of the braille settings
    brailleDisplayMode: 'auto',
    brailleInputMode: 'auto',
    brailleKeyboardLayout: 'en-US'
  },
  // The function to change the braille display mode
  changeBrailleDisplayMode: async function(e) {
    try {
      const newValue = e.newValue[0];
      if (!settingsUtils.validateInput.braille.modes.includes(newValue)) {
        logger.error('Invalid braille display mode:', newValue);
        return;
      }

      const success = await handleSettingChange(
        () => accessibility.setBrailleDisplayMode({ mode: newValue }),
        newValue,
        'brailleDisplayMode'
      );

      if (success) {
        this.setData({ brailleDisplayMode: newValue });
      }
    } catch (error) {
      logger.error('Braille display mode change error:', error);
    }
  },
  // The function to change the braille input mode
  changeBrailleInputMode: async function(e) {
    try {
      const newValue = e.newValue[0];
      if (!settingsUtils.validateSettings.mode(newValue)) {
        logger.error('Invalid input mode:', newValue);
        return;
      }

      const success = await handleSettingChange(
        () => accessibility.setBrailleInputMode({ mode: newValue }),
        newValue,
        'brailleInputMode'
      );

      if (success) {
        this.setData({ brailleInputMode: newValue });
      }
    } catch (error) {
      logger.error('Braille input mode change error:', error);
    }
  },
  // The function to change the braille keyboard layout
  changeBrailleKeyboardLayout: async function(e) {
    try {
      const newValue = e.newValue[0];
      if (!settingsUtils.validateInput.braille.layouts.includes(newValue)) {
        logger.error('Invalid braille keyboard layout:', newValue);
        return;
      }

      const success = await handleSettingChange(
        () => accessibility.setBrailleKeyboardLayout({ layout: newValue }),
        newValue,
        'brailleKeyboardLayout'
      );

      if (success) {
        this.setData({ brailleKeyboardLayout: newValue });
      }
    } catch (error) {
      logger.error('Braille keyboard layout change error:', error);
    }
  }
});
