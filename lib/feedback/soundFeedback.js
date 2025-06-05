import { player } from '@zos/media';

/**
 * @typedef {Object} SoundPaths
 * @property {string} success - Success sound file path
 * @property {string} error - Error sound file path
 * @property {string} warning - Warning sound file path
 * @property {string} info - Info sound file path
 * @property {string} click - Click sound file path
 */

/**
 * Manages audio feedback through sound files
 */
export class SoundFeedback {
  /**
   * @param {number} [defaultVolume=50] - Default volume level (0-100)
   */
  constructor(defaultVolume = 50) {
    /** @type {SoundPaths} */
    this.sounds = {
      success: '/sounds/success.mp3',
      error: '/sounds/error.mp3',
      warning: '/sounds/warning.mp3',
      info: '/sounds/info.mp3',
      click: '/sounds/click.mp3'
    };
    this.volume = Math.min(Math.max(defaultVolume, 0), 100);
  }

  /**
   * @param {number} volume - Volume level (0-100)
   */
  setVolume(volume) {
    this.volume = Math.min(Math.max(volume, 0), 100);
  }

  /**
   * @param {keyof SoundPaths} sound - Sound type to play
   * @returns {Promise<void>}
   */
  async play(sound) {
    try {
      const soundFile = this.sounds[sound];
      if (!soundFile) {
        throw new Error(`Invalid sound type: ${sound}`);
      }

      await this.playSound(soundFile);
    } catch (error) {
      console.error('Sound playback failed:', error);
    }
  }

  /**
   * @private
   * @param {string} soundFile - Path to sound file
   * @returns {Promise<void>}
   */
  async playSound(soundFile) {
    return new Promise((resolve, reject) => {
      try {
        player.setVolume(this.volume);
        player.playSound({
          path: soundFile,
          onComplete: () => resolve(),
          onError: error => reject(error)
        });
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Stop currently playing sound
   */
  stop() {
    try {
      player.stop();
    } catch (error) {
      console.error('Failed to stop sound:', error);
    }
  }
}