// Import the accessibility module
const accessibility = require('@system.accessibility');

// Define the settings page
Page({
  data: {
    // The current values of the braille settings
    brailleDisplayMode: 'auto',
    brailleInputMode: 'auto',
    brailleKeyboardLayout: 'en-US'
  },
  // The function to change the braille display mode
  changeBrailleDisplayMode(e) {
    // Get the new value from the picker
    let newValue = e.newValue[0];
    // Update the data
    this.setData({
      brailleDisplayMode: newValue
    });
    // Call the accessibility API to set the braille display mode
    accessibility.setBrailleDisplayMode({
      mode: newValue
    });
  },
  // The function to change the braille input mode
  changeBrailleInputMode(e) {
    // Get the new value from the picker
    let newValue = e.newValue[0];
    // Update the data
    this.setData({
      brailleInputMode: newValue
    });
    // Call the accessibility API to set the braille input mode
    accessibility.setBrailleInputMode({
      mode: newValue
    });
  },
  // The function to change the braille keyboard layout
  changeBrailleKeyboardLayout(e) {
    // Get the new value from the picker
    let newValue = e.newValue[0];
    // Update the data
    this.setData({
      brailleKeyboardLayout: newValue
    });
    // Call the accessibility API to set the braille keyboard layout
    accessibility.setBrailleKeyboardLayout({
      layout: newValue
    });
  }
});
