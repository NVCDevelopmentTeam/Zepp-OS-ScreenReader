import { SettingsUtils } from './utils'
import { Vibrator, Sound } from '@zos/sensor'
import { log } from '@zos/utils'

Page({
  state: {
    hapticFeedback: true,
    soundFeedback: true,
    feedbackIntensity: 'medium'
  },

  async toggleHapticFeedback() {
    try {
      const currentValue = this.state.hapticFeedback
      const success = await SettingsUtils.handleToggleSetting(
        value => Vibrator.setEnabled(value),
        currentValue,
        'hapticFeedback'
      )
      if (success) this.setState({ hapticFeedback: !currentValue })
    } catch (error) {
      log.error('Haptic feedback toggle failed:', error)
    }
  },

  async changeFeedbackIntensity(value) {
    try {
      if (!SettingsUtils.validateFeedback.intensity.includes(value)) {
        throw new Error('Invalid feedback intensity')
      }
      
      const success = await SettingsUtils.handleSettingChange(
        () => Vibrator.setIntensity(value),
        value,
        'feedbackIntensity'
      )
      if (success) this.setState({ feedbackIntensity: value })
    } catch (error) {
      log.error('Feedback intensity change failed:', error)
    }
  }
})
