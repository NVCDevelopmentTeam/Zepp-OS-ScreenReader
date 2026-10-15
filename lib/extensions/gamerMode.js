/**
 * Gamer mode: while a game (or anything with its own sound) is in the foreground, ZSR stays
 * silent and answers with vibration only. Nothing is written to the saved settings, so a
 * restart always returns to normal speech.
 *
 * The reader (speech), the vibration feedback and the sound feedback consult `gamerMode`
 * when they act.
 */
const gamerMode = {
  isEnabled: false,
  /** 0-10; picks the vibration strength used while the mode is on. */
  vibrationIntensity: 1,
  soundEnabled: true
}

function toggleGamerMode() {
  gamerMode.isEnabled = !gamerMode.isEnabled
  return gamerMode.isEnabled
}

/** @param {number} level 0-10 */
function setVibrationIntensity(level) {
  if (level >= 0 && level <= 10) {
    gamerMode.vibrationIntensity = level
  }
}

function toggleSound() {
  gamerMode.soundEnabled = !gamerMode.soundEnabled
  return gamerMode.soundEnabled
}

/** @returns {'low' | 'medium' | 'high'} vibration level to use while the mode is on */
function gamerFeedbackLevel() {
  if (gamerMode.vibrationIntensity <= 3) return 'low'
  if (gamerMode.vibrationIntensity <= 7) return 'medium'
  return 'high'
}

export { gamerMode, toggleGamerMode, setVibrationIntensity, toggleSound, gamerFeedbackLevel }
