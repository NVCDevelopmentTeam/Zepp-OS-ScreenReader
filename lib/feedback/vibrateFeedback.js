import {
  Vibrator,
  VIBRATOR_SCENE_NOTIFICATION,
  VIBRATOR_SCENE_SHORT_MIDDLE,
  VIBRATOR_SCENE_STRONG_REMINDER,
  VIBRATOR_SCENE_TIMER
} from '@zos/sensor'
import { log } from '@zos/utils'

export class VibrationManager {
  constructor() {
    this.vibrator = new Vibrator()
    this.PATTERNS = {
      notification: VIBRATOR_SCENE_NOTIFICATION,
      success: VIBRATOR_SCENE_SHORT_MIDDLE,
      warning: VIBRATOR_SCENE_STRONG_REMINDER,
      error: VIBRATOR_SCENE_TIMER,
      alert: VIBRATOR_SCENE_STRONG_REMINDER,
      info: VIBRATOR_SCENE_SHORT_MIDDLE
    }
  }

  async vibrate(pattern) {
    try {
      if (!this.vibrator) {
        this.vibrator = new Vibrator()
      }

      const mode =
        typeof pattern === 'number'
          ? pattern
          : this.PATTERNS[pattern] || VIBRATOR_SCENE_SHORT_MIDDLE

      // Stop any current vibration
      try {
        this.vibrator.stop()
      } catch (e) {
        log.warn('Vibrator stop failed:', e)
      }

      // In Zepp OS 2.0+, Vibrator usually has setMode
      if (typeof this.vibrator.setMode === 'function') {
        this.vibrator.setMode(mode)
      } else if (typeof this.vibrator.setScene === 'function') {
        this.vibrator.setScene(mode)
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
}
