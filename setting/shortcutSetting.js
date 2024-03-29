// Import the accessibility module
const accessibility = require('@system.accessibility');

// Define the settings page
Page({
  data: {
    // The current values of the shortcut settings
    shortcutItems: ['Read', 'Pause', 'Next', 'Previous', 'Settings'],
    shortcutOrder: 'asc',
    shortcutActions: {
      'Read': accessibility.read,
      'Pause': accessibility.pause,
      'Next': accessibility.next,
      'Previous': accessibility.previous,
      'Settings': accessibility.settings
    }
  },
  // The function to change the shortcut items
  changeShortcutItems(e) {
    // Get the new value from the list
    let newValue = e.newValue;
    // Update the data
    this.setData({
      shortcutItems: newValue
    });
    // Call the accessibility API to set the shortcut items
    accessibility.setShortcutItems({
      items: newValue
    });
  },
  // The function to change the shortcut order
  changeShortcutOrder(e) {
    // Get the new value from the picker
    let newValue = e.newValue[0];
    // Update the data
    this.setData({
      shortcutOrder: newValue
    });
    // Call the accessibility API to set the shortcut order
    accessibility.setShortcutOrder({
      order: newValue
    });
  },
  // The function to change the shortcut actions
  changeShortcutActions(e) {
    // Get the new value from the map
    let newValue = e.newValue;
    // Update the data
    this.setData({
      shortcutActions: newValue
    });
    // Call the accessibility API to set the shortcut actions
    accessibility.setShortcutActions({
      actions: newValue
    });
  }
});
