import {
  Vibrator,
  VIBRATOR_SCENE_SHORT_LIGHT,
  VIBRATOR_SCENE_SHORT_MIDDLE,
  VIBRATOR_SCENE_SHORT_STRONG,
  VIBRATOR_SCENE_NOTIFICATION,
  VIBRATOR_SCENE_STRONG_REMINDER,
  VIBRATOR_SCENE_TIMER
} from '@zos/sensor'
import { log } from '@zos/utils'

// Maps setting/FeedbackSetting.js's "Feedback Intensity" (settingsKey
// 'feedbackIntensity': low/medium/high) onto the closest real vibration
// motor constants for each named pattern.
const INTENSITY_PATTERNS = {
  low: {
    notification: VIBRATOR_SCENE_SHORT_LIGHT,
    success: VIBRATOR_SCENE_SHORT_LIGHT,
    warning: VIBRATOR_SCENE_SHORT_MIDDLE,
    error: VIBRATOR_SCENE_SHORT_MIDDLE,
    alert: VIBRATOR_SCENE_SHORT_MIDDLE,
    info: VIBRATOR_SCENE_SHORT_LIGHT
  },
  medium: {
    notification: VIBRATOR_SCENE_NOTIFICATION,
    success: VIBRATOR_SCENE_SHORT_MIDDLE,
    warning: VIBRATOR_SCENE_STRONG_REMINDER,
    error: VIBRATOR_SCENE_TIMER,
    alert: VIBRATOR_SCENE_STRONG_REMINDER,
    info: VIBRATOR_SCENE_SHORT_MIDDLE
  },
  high: {
    notification: VIBRATOR_SCENE_NOTIFICATION,
    success: VIBRATOR_SCENE_SHORT_STRONG,
    warning: VIBRATOR_SCENE_STRONG_REMINDER,
    error: VIBRATOR_SCENE_TIMER,
    alert: VIBRATOR_SCENE_STRONG_REMINDER,
    info: VIBRATOR_SCENE_SHORT_STRONG
  }
}

export class VibrationManager {
  constructor() {
    this.vibrator = new Vibrator()
    // Kept for callers that pass a raw numeric VIBRATOR_SCENE_* constant
    // directly instead of a named pattern.
    this.PATTERNS = INTENSITY_PATTERNS.medium
  }

  async vibrate(pattern) {
    try {
      // "Haptic Feedback" toggle from setting/FeedbackSetting.js
      // (settingsKey 'hapticFeedbackEnabled') - default on if unset.
      const config = globalThis.ScreenReaderConfig || {}
      if (config.hapticFeedbackEnabled === false) {
        return
      }

      if (!this.vibrator) {
        this.vibrator = new Vibrator()
      }

      const intensity = INTENSITY_PATTERNS[config.feedbackIntensity] || INTENSITY_PATTERNS.medium
      const mode =
        typeof pattern === 'number' ? pattern : intensity[pattern] || VIBRATOR_SCENE_SHORT_MIDDLE

      // Stop any current vibration
      try {
        this.vibrator.stop()
      } catch (e) {
        log.warn('Vibrator stop failed:', e)
      }

      // setMode() takes an Option object ({ mode }), not a bare number -
      // see https://docs.zepp.com/docs/reference/device-app-api/newAPI/sensor/Vibrator/
      // There is no setScene() method on this class; that was leftover
      // guesswork from an unrelated API and is removed here.
      if (typeof this.vibrator.setMode === 'function') {
        this.vibrator.setMode({ mode })
      }

      if (typeof this.vibrator.start === 'function') {
        this.vibrator.start()
      }
    } catch (error) {
      log.error('Vibration failed:', error)
    }
  }

  stop() {
    try {
      this.vibrator.stop()
    } catch (error) {
      log.error('Failed to stop vibration:', error)
    }
  }

  static async stop() {
    try {
      const v = new Vibrator()
      v.stop()
    } catch (_error) {
      // Ignore
    }
  }
}
