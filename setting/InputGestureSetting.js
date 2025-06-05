// Import the accessibility module
const accessibility = require('@system.accessibility');
import { Gesture, Vibrator } from '@zos/sensor'
import { SettingsUtils } from './utils'
import { log } from '@zos/utils'

// Define the settings page
Page({
  data: {
    // The current values of the input gesture settings
    swipeAction: 'read',
    tapAction: 'pause',
    doubleTapAction: 'next'
  },
  onInit() {
    this.validateDevice()
  },

  validateDevice() {
    const { capabilities } = SettingsUtils.init()
    if (!capabilities.gesture) {
      throw new Error('Gesture not supported')
    }
  },
  // The function to change the swipe action
  changeSwipeAction: async function(e) {
    try {
      const newValue = e.newValue[0]
      if (!SettingsUtils.validateInput.gesture.actions.includes(newValue)) {
        throw new Error('Invalid swipe action')
      }

      const success = await SettingsUtils.handleSettingChange(
        () => Gesture.setSwipeAction(newValue),
        newValue,
        'swipeAction'
      )

      if (success) {
        this.setData({ swipeAction: newValue })
      }
    } catch (error) {
      logger.error('Swipe action error:', error)
    }
  },
  // The function to change the tap action
  async changeTapAction(e) {
    try {
      const newValue = e.newValue[0]
      if (!SettingsUtils.validateGesture.actions.includes(newValue)) {
        throw new Error('Invalid tap action')
      }

      const success = await SettingsUtils.handleSettingChange(
        () => Gesture.setTapAction(newValue),
        newValue,
        'tapAction'
      )

      if (success) {
        this.setData({ tapAction: newValue })
      }
    } catch (error) {
      SettingsUtils.handleError(error, 'tap_action')
    }
  },
  // The function to change the double tap action
  async changeDoubleTapAction(e) {
    try {
      const newValue = e.newValue[0]
      if (!SettingsUtils.validateGesture.actions.includes(newValue)) {
        throw new Error('Invalid double tap action')
      }

      const success = await SettingsUtils.handleSettingChange(
        () => Gesture.setDoubleTapAction(newValue),
        newValue,
        'doubleTapAction'
      )

      if (success) {
        this.setData({ doubleTapAction: newValue })
        await Vibrator.vibrate({ mode: 'short' })
      }
    } catch (error) {
      log.error('Double tap action error:', error)
    }
  }
});
