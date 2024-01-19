// Import the accessibility module
const accessibility = require('@system.accessibility');

// Define the settings page
Page({
  data: {
    // The current value of the screen reader switch
    screenReader: false
  },
  // The function to toggle the screen reader on or off
  toggleScreenReader() {
    // Get the current value of the screen reader
    let currentValue = this.data.screenReader;
    // Set the new value to the opposite of the current value
    let newValue = !currentValue;
    // Update the data
    this.setData({
      screenReader: newValue
    });
    // Call the accessibility API to enable or disable the screen reader
    accessibility.setScreenReader({
      enable: newValue
    });
  }
});
