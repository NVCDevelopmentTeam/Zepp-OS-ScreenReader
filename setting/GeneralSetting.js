import { accessibility } from '@zos/accessibility'
import { handleToggleSetting } from './utils'

Page({
  state: {
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
      this.setState({ vibrationFeedback: newValue });
    }
  },

  async toggleGestureNavigation() {
    const [success, newValue] = await handleToggleSetting(
      (value) => accessibility.setGestureNavigation({ enable: value }),
      this.data.gestureNavigation,
      'gestureNavigation'
    );

    if (success) {
      this.setState({ gestureNavigation: newValue });
    }
  },

  async toggleShortcutKeys() {
    const [success, newValue] = await handleToggleSetting(
      (value) => accessibility.setShortcutKeys({ enable: value }),
      this.data.shortcutKeys,
      'shortcutKeys'
    );

    if (success) {
      this.setState({ shortcutKeys: newValue });
    }
  }
});
