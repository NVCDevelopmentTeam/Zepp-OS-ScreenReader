// Import the accessibility module
const accessibility = require('@system.accessibility');
const settingsUtils = require('./utils');
const logger = require('../utils/logger');

// Define the settings page
Page({
  data: {
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
      this.setData({ keyboardShortcuts: newValue });
    }
  },
  // The function to change the keyboard echo
  changeKeyboardEcho: async function(e) {
    try {
      const newValue = e.newValue[0];
      if (!settingsUtils.validateInput.keyboard.echo.includes(newValue)) {
        logger.error('Invalid keyboard echo mode:', newValue);
        return;
      }

      const success = await handleSettingChange(
        () => accessibility.setKeyboardEcho({ mode: newValue }),
        newValue,
        'keyboardEcho'
      );

      if (success) {
        this.setData({ keyboardEcho: newValue });
      }
    } catch (error) {
      logger.error('Keyboard echo change error:', error);
    }
  },
  // The function to change the keyboard layout
  changeKeyboardLayout: async function(e) {
    try {
      const newValue = e.newValue[0];
      if (!settingsUtils.validateInput.keyboard.layouts.includes(newValue)) {
        logger.error('Invalid keyboard layout:', newValue);
        return;
      }

      const success = await settingsUtils.handleSettingChange(
        () => accessibility.setKeyboardLayout({ layout: newValue }),
        newValue,
        'keyboardLayout'
      );

      if (success) {
        this.setData({ keyboardLayout: newValue });
      }
    } catch (error) {
      logger.error('Keyboard layout change error:', error);
    }
  }
});
