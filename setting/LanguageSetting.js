// Import the accessibility module
const accessibility = require('@system.accessibility');

// Define the settings page
Page({
  data: {
    // The current values of the language settings
    preferredLanguage: 'en-US',
    fallbackLanguage: 'zh-CN',
    languageDetection: 'auto'
  },
  // The function to change the preferred language
  changePreferredLanguage(e) {
    // Get the new value from the picker
    let newValue = e.newValue[0];
    // Update the data
    this.setData({
      preferredLanguage: newValue
    });
    // Call the accessibility API to set the preferred language
    accessibility.setPreferredLanguage({
      language: newValue
    });
  },
  // The function to change the fallback language
  changeFallbackLanguage(e) {
    // Get the new value from the picker
    let newValue = e.newValue[0];
    // Update the data
    this.setData({
      fallbackLanguage: newValue
    });
    // Call the accessibility API to set the fallback language
    accessibility.setFallbackLanguage({
      language: newValue
    });
  },
  // The function to change the language detection mode
  changeLanguageDetection(e) {
    // Get the new value from the picker
    let newValue = e.newValue[0];
    // Update the data
    this.setData({
      languageDetection: newValue
    });
    // Call the accessibility API to set the language detection mode
    accessibility.setLanguageDetection({
      mode: newValue
    });
  }
});
