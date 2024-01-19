// Import the accessibility module
const accessibility = require('@system.accessibility');

// Define the settings page
Page({
  data: {
    // The current values of the sound settings
    soundVolume: 1,
    soundTheme: 'default',
    soundEffects: true
  },
  // The function to change the sound volume
  changeSoundVolume(e) {
    // Get the new value from the slider
    let newValue = e.value;
    // Update the data
    this.setData({
      soundVolume: newValue
    });
    // Call the accessibility API to set the sound volume
    accessibility.setSoundVolume({
      volume: newValue
    });
  },
  // The function to change the sound theme
  changeSoundTheme(e) {
    // Get the new value from the picker
    let newValue = e.newValue[0];
    // Update the data
    this.setData({
      soundTheme: newValue
    });
    // Call the accessibility API to set the sound theme
    accessibility.setSoundTheme({
      theme: newValue
    });
  },
  // The function to toggle the sound effects
  toggleSoundEffects() {
    // Get the current value of the sound effects
    let currentValue = this.data.soundEffects;
    // Set the new value to the opposite of the current value
    let newValue = !currentValue;
    // Update the data
    this.setData({
      soundEffects: newValue
    });
    // Call the accessibility API to enable or disable the sound effects
    accessibility.setSoundEffects({
      enable: newValue
    });
  }
});
