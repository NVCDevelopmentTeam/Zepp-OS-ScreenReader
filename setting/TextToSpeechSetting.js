import { accessibility } from '@zos/accessibility'

// Define the settings page
Page({
  state: {
    // The current values of the TTS settings
    ttsEngine: 'default',
    ttsVoice: 'en-US',
    ttsQuality: 'high'
  },
  // The function to change the TTS engine
  changeTtsEngine(e) {
    // Get the new value from the picker
    let newValue = e.newValue[0];
    // Update the data
    this.setState({
      ttsEngine: newValue
    });
    // Call the accessibility API to set the TTS engine
    accessibility.setTtsEngine({
      engine: newValue
    });
  },
  // The function to change the TTS voice
  changeTtsVoice(e) {
    // Get the new value from the picker
    let newValue = e.newValue[0];
    // Update the data
    this.setState({
      ttsVoice: newValue
    });
    // Call the accessibility API to set the TTS voice
    accessibility.setTtsVoice({
      voice: newValue
    });
  },
  // The function to change the TTS quality
  changeTtsQuality(e) {
    // Get the new value from the picker
    let newValue = e.newValue[0];
    // Update the data
    this.setState({
      ttsQuality: newValue
    });
    // Call the accessibility API to set the TTS quality
    accessibility.setTtsQuality({
      quality: newValue
    });
  }
});
