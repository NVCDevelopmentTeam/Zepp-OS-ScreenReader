const gamerMode = {
  isEnabled: false,
  vibrationIntensity: 1,
  soundEnabled: true
};

function toggleGamerMode() {
  gamerMode.isEnabled = !gamerMode.isEnabled;
  return gamerMode.isEnabled;
}

function setVibrationIntensity(level) {
  if (level >= 0 && level <= 10) {
    gamerMode.vibrationIntensity = level;
  }
}

function toggleSound() {
  gamerMode.soundEnabled = !gamerMode.soundEnabled;
  return gamerMode.soundEnabled;
}

export {
  gamerMode,
  toggleGamerMode,
  setVibrationIntensity,
  toggleSound
};
