// Import the accessibility module
const accessibility = require('@system.accessibility');

// Define the settings page
Page({
  data: {
    // The current values of the OCR settings
    ocrMode: 'auto',
    ocrLanguage: 'en-US',
    ocrRegion: 'full'
  },
  // The function to change the OCR mode
  changeOcrMode(e) {
    // Get the new value from the picker
    let newValue = e.newValue[0];
    // Update the data
    this.setData({
      ocrMode: newValue
    });
    // Call the accessibility API to set the OCR mode
    accessibility.setOcrMode({
      mode: newValue
    });
  },
  // The function to change the OCR language
  changeOcrLanguage(e) {
    // Get the new value from the picker
    let newValue = e.newValue[0];
    // Update the data
    this.setData({
      ocrLanguage: newValue
    });
    // Call the accessibility API to set the OCR language
    accessibility.setOcrLanguage({
      language: newValue
    });
  },
  // The function to change the OCR region
  changeOcrRegion(e) {
    // Get the new value from the picker
    let newValue = e.newValue[0];
    // Update the data
    this.setData({
      ocrRegion: newValue
    });
    // Call the accessibility API to set the OCR region
    accessibility.setOcrRegion({
      region: newValue
    });
  }
});
