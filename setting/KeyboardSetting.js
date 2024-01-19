// Import the accessibility module
const accessibility = require('@system.accessibility');

// Define the settings page
Page({
  data: {
    // The current values of the keyboard settings
    keyboardShortcuts: true,
    keyboardEcho: 'character',
    keyboardLayout: 'en-US'
  },
  // The function to toggle the keyboard shortcuts
  toggleKeyboardShortcuts() {
    // Get the current value of the keyboard shortcuts
    let currentValue = this.data.keyboardShortcuts;
    // Set the new value to the opposite of the current value
    let newValue = !currentValue;
    // Update the data
    this.setData({
      keyboardShortcuts: newValue
    });
    // Call the accessibility API to enable or disable the keyboard shortcuts
    accessibility.setKeyboardShortcuts({
      enable: newValue
    });
  },
  // The function to change the keyboard echo
  changeKeyboardEcho(e) {
    // Get the new value from the picker
    let newValue = e.newValue[0];
    // Update the data
    this.setData({
      keyboardEcho: newValue
    });
    // Call the accessibility API to set the keyboard echo
    accessibility.setKeyboardEcho({
      mode: newValue
    });
  },
  // The function to change the keyboard layout
  changeKeyboardLayout(e) {
    // Get the new value from the picker
    let newValue = e.newValue[0];
    // Update the data
    this.setData({
      keyboardLayout: newValue
    });
    // Call the accessibility API to set the keyboard layout
    accessibility.setKeyboardLayout({
      layout: newValue
    });
  }
});
