import { settingsManager, validateBoolean, handleSettingChange } from './utils'
import { Audio } from '@zos/sensor'
import { log } from '@zos/utils'
import { logger } from '../utils/logger'
import { accessibility } from '@zos/accessibility'

Page({
  state: {
    initialized: false,
    soundVolume: 50,
    soundTheme: 'default',
    soundEffects: true
  },

  async onInit() {
    try {
      const { success } = await settingsManager.validateDevice(['audio'])
      if (!success) {
        throw new Error('Audio not supported')
      }
      await Audio.init()
      this.setState({ initialized: true })
    } catch (error) {
      log.error('Sound initialization failed:', error.message)
    }
  },

  async changeSoundVolume(value) {
    try {
      if (!settingsManager.validateNumericRange(value, 0, 100)) {
        throw new Error('Invalid volume level')
      }

      const success = await settingsManager.handleSettingChange(
        () => Audio.setVolume(value),
        value,
        'volume'
      )
      
      if (success) {
        this.setState({ soundVolume: value })
      }
    } catch (error) {
      settingsManager.handleError(error, 'sound_volume')
    }
  },

  changeSoundTheme: async function(e) {
    try {
      const newValue = e.newValue[0];
      if (!settingsManager.validateInput.sound.themes.includes(newValue)) {
        logger.error('Invalid sound theme:', newValue);
        return;
      }

      const success = await settingsManager.handleSettingChange(
        () => accessibility.setSoundTheme({ theme: newValue }),
        newValue,
        'soundTheme'
      );

      if (success) {
        this.setState({ soundTheme: newValue });
      }
    } catch (error) {
      logger.error('Sound theme change error:', error);
    }
  },

  async toggleSoundEffects() {
    try {
      const currentValue = this.state.soundEffects;
      const newValue = !currentValue;

      if (!validateBoolean(newValue)) {
        logger.error('Invalid sound effects value:', newValue);
        return;
      }

      const success = await handleSettingChange(
        () => accessibility.setSoundEffects({ enable: newValue }),
        newValue,
        'soundEffects'
      );

      if (success) {
        this.setState({ soundEffects: newValue });
      }
    } catch (error) {
      logger.error('Sound effects toggle error:', error);
    }
  }
});
