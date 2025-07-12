import { accessibility } from '@zos/accessibility'
import { settingsManager, handleToggleSetting, handleSettingChange } from './utils'
import { logger } from '../utils/logger'

// Define the settings page
Page({
  state: {
    // The current values of the keyboard settings
    keyboardShortcuts: true,
    keyboardEcho: 'character',
    keyboardLayout: 'en-US'
  },
  // The function to toggle the keyboard shortcuts
  async toggleKeyboardShortcuts() {
    const [success, newValue] = await handleToggleSetting(
      (value) => accessibility.setKeyboardShortcuts({ enable: value }),
      this.data.keyboardShortcuts,
      'keyboardShortcuts'
    );

    if (success) {
      this.setState({ keyboardShortcuts: newValue });
    }
  },
  // The function to change the keyboard echo
  changeKeyboardEcho: async function(e) {
    try {
      const newValue = e.newValue[0];
      if (!settingsManager.validateInput.keyboard.echo.includes(newValue)) {
        logger.error('Invalid keyboard echo mode:', newValue);
        return;
      }

      const success = await handleSettingChange(
        () => accessibility.setKeyboardEcho({ mode: newValue }),
        newValue,
        'keyboardEcho'
      );

      if (success) {
        this.setState({ keyboardEcho: newValue });
      }
    } catch (error) {
      logger.error('Keyboard echo change error:', error);
    }
  },
  // The function to change the keyboard layout
  changeKeyboardLayout: async function(e) {
    try {
      const newValue = e.newValue[0];
      if (!settingsManager.validateInput.keyboard.layouts.includes(newValue)) {
        logger.error('Invalid keyboard layout:', newValue);
        return;
      }

      const success = await settingsManager.handleSettingChange(
        () => accessibility.setKeyboardLayout({ layout: newValue }),
        newValue,
        'keyboardLayout'
      );

      if (success) {
        this.setState({ keyboardLayout: newValue });
      }
    } catch (error) {
      logger.error('Keyboard layout change error:', error);
    }
  }
});
