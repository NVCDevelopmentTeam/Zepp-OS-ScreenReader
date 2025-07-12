import { Vibrator } from '@zos/sensor';
import { log } from '@zos/utils';

export class VibrationManager {
  constructor() {
    this.PATTERNS = {
      notification: [50],
      success: [100],
      warning: [50, 100, 50],
      error: [100, 100, 100],
      alert: [200, 100, 200],
      info: [30]
    };
  }

  async vibrate(pattern, intensity = 50) {
    try {
      const durationPattern = Array.isArray(pattern) ? pattern : this.PATTERNS[pattern];
      if (!durationPattern) {
        throw new Error('Invalid vibration pattern');
      }

      await Vibrator.start({
        pattern: durationPattern,
        intensity: Math.min(Math.max(intensity, 0), 100)
      });
    } catch (error) {
      log.error('Vibration failed:', error);
    }
  }

  stop() {
    try {
      Vibrator.stop();
    } catch (error) {
      log.error('Failed to stop vibration:', error);
    }
  }
}