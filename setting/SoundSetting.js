import { settingsManager } from './utils'
import { Audio } from '@zos/sensor'
import { log } from '@zos/utils'

Page({
  state: {
    initialized: false,
    soundVolume: 50,
    soundTheme: 'default',
    soundEffects: true
  },

  data: {
    soundVolume: 1,
    soundTheme: 'default',
    soundEffects: true
  },

  async onInit() {
    try {
      const { success, capabilities } = await settingsManager.validateDevice(['audio'])
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
      if (!SettingsUtils.validateNumericRange(value, 0, 100)) {
        throw new Error('Invalid volume level')
      }

      const success = await SettingsUtils.handleSettingChange(
        () => Audio.setVolume(value),
        value,
        'volume'
      )
      
      if (success) {
        this.setState({ soundVolume: value })
      }
    } catch (error) {
      SettingsUtils.handleError(error, 'sound_volume')
    }
  },

  changeSoundTheme: async function(e) {
    try {
      const newValue = e.newValue[0];
      if (!settingsUtils.validateInput.sound.themes.includes(newValue)) {
        logger.error('Invalid sound theme:', newValue);
        return;
      }

      const success = await handleSettingChange(
        () => accessibility.setSoundTheme({ theme: newValue }),
        newValue,
        'soundTheme'
      );

      if (success) {
        this.setData({ soundTheme: newValue });
      }
    } catch (error) {
      logger.error('Sound theme change error:', error);
    }
  },

  async toggleSoundEffects() {
    try {
      const currentValue = this.data.soundEffects;
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
        this.setData({ soundEffects: newValue });
      }
    } catch (error) {
      logger.error('Sound effects toggle error:', error);
    }
  }
});
