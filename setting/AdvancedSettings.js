import { accessibility } from '@zos/accessibility'
import settingsUtils, { validateNumericRange, handleSettingChange } from './utils'
import { logger } from '../utils/logger'
import { log } from '@zos/utils'

Page({
  state: {
    speechRate: 1,
    speechPitch: 1,
    speechVolume: 1,
    speechLanguage: 'en-US',
    speechPunctuation: true
  },

  build() {
    const { capabilities } = settingsUtils.validateDevice()
    
    if (!capabilities.accessibility) {
      return this.showError('Device not supported')
    }

    this.createControls()
  },

  // The function to change the speech rate
  async changeSpeechRate(value) {
    try {
      const [success] = await settingsUtils.handleSettingChange(
        () => accessibility.setSpeechRate(value),
        value,
        'speechRate'
      )
      if (success) this.setState({ speechRate: value })
    } catch (error) {
      log.error(error)
    }
  },

  // The function to change the speech pitch
  async changeSpeechPitch(e) {
    try {
      const newValue = e.value;
      if (!validateNumericRange(newValue, 0.5, 2.0)) {
        logger.error('Invalid speech pitch:', newValue);
        return;
      }

      const success = await handleSettingChange(
        () => accessibility.setSpeechPitch({ pitch: newValue }),
        newValue,
        'speechPitch'
      );

      if (success) { this.setState({ speechPitch: newValue }); }
    } catch (error) {
      logger.error('Speech pitch change error:', error);
    }
  },
  // The function to change the speech volume
  changeSpeechVolume(e) {
    // Get the new value from the slider
    let newValue = e.value;
    // Update the data
    this.setState({
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
    this.setState({
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
    let currentValue = this.state.speechPunctuation;
    // Set the new value to the opposite of the current value
    let newValue = !currentValue;
    // Update the data
    this.setState({
      speechPunctuation: newValue
    });
    // Call the accessibility API to enable or disable the punctuation reading
    accessibility.setSpeechPunctuation({
      enable: newValue
    });
  }
});
