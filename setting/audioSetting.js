class AudioSettings {
  constructor() {
    this.soundSplitMode = 'disabled';
    this.volume = 100;
    this.followsVoiceVolume = false;
    this.duckingMode = 'none';
    this.deviceId = 'default';
    this.keepAwakeTime = 30;
  }

  setSoundSplitMode(mode) {
    const validModes = [
      'disabled',
      'bothChannels',
      'leftRight',
      'leftBoth',
      'rightLeft',
      'rightBoth'
    ];
    if (validModes.includes(mode)) {
      this.soundSplitMode = mode;
    }
  }

  setVolume(level) {
    this.volume = Math.min(Math.max(0, level), 100);
  }

  setDuckingMode(mode) {
    const validModes = ['none', 'speech', 'always'];
    if (validModes.includes(mode)) {
      this.duckingMode = mode;
    }
  }

  setAudioDevice(deviceId) {
    this.deviceId = deviceId;
  }

  setKeepAwakeTime(seconds) {
    this.keepAwakeTime = Math.max(0, seconds);
  }

  getSettings() {
    return {
      soundSplitMode: this.soundSplitMode,
      volume: this.volume,
      followsVoiceVolume: this.followsVoiceVolume,
      duckingMode: this.duckingMode,
      deviceId: this.deviceId,
      keepAwakeTime: this.keepAwakeTime
    };
  }
}

// Export the settings class
export default AudioSettings;