import { vibrate } from '@zos/sensor';

/**
 * @typedef {Object} VibrationPatterns
 * @property {number[]} success - Success pattern durations
 * @property {number[]} error - Error pattern durations
 * @property {number[]} warning - Warning pattern durations
 * @property {number[]} info - Info pattern durations
 */

/**
 * Manages haptic feedback through vibration patterns
 */
export class VibrationManager {
  constructor() {
    /** @type {VibrationPatterns} */
    this.patterns = {
      success: [50],
      error: [100, 100, 100],
      warning: [50, 100, 50],
      info: [30]
    };
  }

  /**
   * @param {keyof VibrationPatterns | number[]} pattern - Vibration pattern to execute
   * @returns {Promise<void>}
   */
  async vibrate(pattern) {
    try {
      const durationPattern = Array.isArray(pattern) ? pattern : this.patterns[pattern];
      if (!durationPattern) {
        throw new Error('Invalid vibration pattern');
      }
      
      await this.executePattern(durationPattern);
    } catch (error) {
      console.error('Vibration failed:', error);
    }
  }

  /**
   * @private
   * @param {number[]} durations - Array of vibration durations
   * @returns {Promise<void>}
   */
  async executePattern(durations) {
    for (const duration of durations) {
      await this.singleVibration(duration);
      if (durations.length > 1) {
        await this.wait(100); // Gap between patterns
      }
    }
  }

  /**
   * @private
   * @param {number} duration - Duration in milliseconds
   * @returns {Promise<void>}
   */
  async singleVibration(duration) {
    return new Promise(resolve => {
      vibrate.start();
      setTimeout(() => {
        vibrate.stop();
        resolve();
      }, duration);
    });
  }

  /**
   * @private
   * @param {number} ms - Duration in milliseconds
   * @returns {Promise<void>}
   */
  wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}