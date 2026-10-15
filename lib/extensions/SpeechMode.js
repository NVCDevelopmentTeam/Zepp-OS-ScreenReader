/**
 * Speech Mode for Zepp OS Screen Reader (ZSR).
 *
 * Speech Mode is independent from the ZSR state:
 *
 * ZSR ON + Speech Mode ON  -> ZSR provides speech feedback normally.
 * ZSR ON + Speech Mode OFF -> ZSR remains active, but speech output is suppressed.
 *
 * Speech Mode does NOT control or detect TalkBack.
 *
 * It is a thin facade over the reader's own mute state, so the context menu, voice
 * commands, the "mute" shortcut and this module can never disagree.
 */

/** @returns {any} the running ScreenReader, or undefined before it exists */
function reader() {
  return globalThis.ScreenReaderInstance
}

function isEnabled() {
  const r = reader()
  return r && typeof r.isMuted === 'function' ? !r.isMuted() : true
}

/**
 * Speak through Speech Mode: nothing is produced while it is off.
 * @param {string} text
 * @returns {boolean} true when the text was handed to the speech engine
 */
function speak(text) {
  const r = reader()
  if (!text || !r || !isEnabled()) return false
  r.speak(text)
  return true
}

function stop() {
  const r = reader()
  if (r && typeof r.stop === 'function') r.stop()
}

function enable() {
  const r = reader()
  if (r && !isEnabled()) r.toggleMute()
}

function disable() {
  const r = reader()
  if (r && isEnabled()) r.toggleMute()
}

/** @returns {boolean} the new state */
function toggle() {
  const r = reader()
  if (r) r.toggleMute()
  return isEnabled()
}

function getState() {
  return { enabled: isEnabled() }
}

const SpeechMode = { speak, enable, disable, toggle, stop, isEnabled, getState }

export default SpeechMode
