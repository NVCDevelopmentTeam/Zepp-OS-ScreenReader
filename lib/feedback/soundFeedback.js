import { Audio } from '@zos/sensor';
import { log } from '@zos/utils';

export class SoundFeedback {
  constructor(defaultVolume = 50) {
    this.volume = Math.min(Math.max(defaultVolume, 0), 100);
    this.SOUNDS = {
      success: 'success.wav',
      error: 'error.wav',
      warning: 'warning.wav',
      notification: 'notification.wav',
      info: 'info.wav',
      click: 'click.wav'
    };
  }

  setVolume(volume) {
    this.volume = Math.min(Math.max(volume, 0), 100);
  }

  async play(sound) {
    try {
      const soundFile = this.SOUNDS[sound];
      if (!soundFile) {
        throw new Error(`Invalid sound type: ${sound}`);
      }

      await Audio.play({
        filename: soundFile,
        volume: this.volume / 100
      });
    } catch (error) {
      log.error('Sound playback failed:', error);
    }
  }

  stop() {
    try {
      Audio.stop();
    } catch (error) {
      log.error('Failed to stop sound:', error);
    }
  }
}