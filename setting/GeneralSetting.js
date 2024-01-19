// Import the accessibility module
const accessibility = require('@system.accessibility');

// Define the settings page
Page({
  data: {
    // The current values of the general settings
    vibrationFeedback: true,
    gestureNavigation: true,
    shortcutKeys: true
  },
  // The function to toggle the vibration feedback
  toggleVibrationFeedback() {
    // Get the current value of the vibration feedback
    let currentValue = this.data.vibrationFeedback;
    // Set the new value to the opposite of the current value
    let newValue = !currentValue;
    // Update the data
    this.setData({
      vibrationFeedback: newValue
    });
    // Call the accessibility API to enable or disable the vibration feedback
    accessibility.setVibrationFeedback({
      enable: newValue
    });
  },
  // The function to toggle the gesture navigation
  toggleGestureNavigation() {
    // Get the current value of the gesture navigation
    let currentValue = this.data.gestureNavigation;
    // Set the new value to the opposite of the current value
    let newValue = !currentValue;
    // Update the data
    this.setData({
      gestureNavigation: newValue
    });
    // Call the accessibility API to enable or disable the gesture navigation
    accessibility.setGestureNavigation({
      enable: newValue
    });
  },
  // The function to toggle the shortcut keys
  toggleShortcutKeys() {
    // Get the current value of the shortcut keys
    let currentValue = this.data.shortcutKeys;
    // Set the new value to the opposite of the current value
    let newValue = !currentValue;
    // Update the data
    this.setData({
      shortcutKeys: newValue
    });
    // Call the accessibility API to enable or disable the shortcut keys
    accessibility.setShortcutKeys({
      enable: newValue
    });
  }
});
