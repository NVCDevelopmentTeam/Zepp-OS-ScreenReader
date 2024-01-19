// Import the accessibility module
const accessibility = require('@system.accessibility');

// Define the settings page
Page({
  data: {
    // The current values of the advanced settings
    speechRate: 1,
    speechPitch: 1,
    speechVolume: 1,
    speechLanguage: 'en-US',
    speechPunctuation: true
  },
  // The function to change the speech rate
  changeSpeechRate(e) {
    // Get the new value from the slider
    let newValue = e.value;
    // Update the data
    this.setData({
      speechRate: newValue
    });
    // Call the accessibility API to set the speech rate
    accessibility.setSpeechRate({
      rate: newValue
    });
  },
  // The function to change the speech pitch
  changeSpeechPitch(e) {
    // Get the new value from the slider
    let newValue = e.value;
    // Update the data
    this.setData({
      speechPitch: newValue
    });
    // Call the accessibility API to set the speech pitch
    accessibility.setSpeechPitch({
      pitch: newValue
    });
  },
  // The function to change the speech volume
  changeSpeechVolume(e) {
    // Get the new value from the slider
    let newValue = e.value;
    // Update the data
    this.setData({
      speechVolume: newValue
    });
    // Call the accessibility API to set the speech volume
    accessibility.setSpeechVolume({
      volume: newValue
    });
  },
  // The function to change the speech language
  changeSpeechLanguage(e) {
    // Get the new value from the picker
    let newValue = e.newValue[0];
    // Update the data
    this.setData({
      speechLanguage: newValue
    });
    // Call the accessibility API to set the speech language
    accessibility.setSpeechLanguage({
      language: newValue
    });
  },
  // The function to toggle the punctuation reading
  toggleSpeechPunctuation() {
    // Get the current value of the punctuation reading
    let currentValue = this.data.speechPunctuation;
    // Set the new value to the opposite of the current value
    let newValue = !currentValue;
    // Update the data
    this.setData({
      speechPunctuation: newValue
    });
    // Call the accessibility API to enable or disable the punctuation reading
    accessibility.setSpeechPunctuation({
      enable: newValue
    });
  }
});
