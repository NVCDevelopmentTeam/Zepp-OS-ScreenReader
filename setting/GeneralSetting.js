const accessibility = require('@system.accessibility');
const { handleToggleSetting } = require('./utils');
const logger = require('../utils/logger');

Page({
  data: {
    vibrationFeedback: true,
    gestureNavigation: true,
    shortcutKeys: true
  },

  async toggleVibrationFeedback() {
    const [success, newValue] = await handleToggleSetting(
      (value) => accessibility.setVibrationFeedback({ enable: value }),
      this.data.vibrationFeedback,
      'vibrationFeedback'
    );

    if (success) {
      this.setData({ vibrationFeedback: newValue });
    }
  },

  async toggleGestureNavigation() {
    const [success, newValue] = await handleToggleSetting(
      (value) => accessibility.setGestureNavigation({ enable: value }),
      this.data.gestureNavigation,
      'gestureNavigation'
    );

    if (success) {
      this.setData({ gestureNavigation: newValue });
    }
  },

  async toggleShortcutKeys() {
    const [success, newValue] = await handleToggleSetting(
      (value) => accessibility.setShortcutKeys({ enable: value }),
      this.data.shortcutKeys,
      'shortcutKeys'
    );

    if (success) {
      this.setData({ shortcutKeys: newValue });
    }
  }
});
