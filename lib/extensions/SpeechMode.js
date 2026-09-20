/**
 * speechMode.js
 *
 * Speech Mode for Zepp OS Screen Reader (ZSR).
 *
 * Speech Mode is independent from the ZSR state:
 *
 * ZSR ON + Speech Mode ON
 *   -> ZSR provides speech feedback normally.
 *
 * ZSR ON + Speech Mode OFF
 *   -> ZSR remains active, but speech output is suppressed.
 *
 * Speech Mode does NOT control or detect TalkBack.
 */

const SpeechMode = (() => {
  // Speech Mode state.
  // true  = speech output is enabled
  // false = speech output is suppressed
  let enabled = true

  /**
   * Pass speech to the actual ZSR speech engine.
   *
   * Replace this implementation with the TTS API
   * used by your ZSR implementation.
   */
  function speakNative(text) {
    if (!text) {
      return
    }

    /*
     * Example:
     *
     * zsrTTS.speak(text);
     *
     * or:
     *
     * zsr.speak(text);
     *
     * Replace this with the actual ZSR TTS implementation.
     */

    if (
      typeof globalThis !== 'undefined' &&
      globalThis.zsr &&
      typeof globalThis.zsr.speak === 'function'
    ) {
      globalThis.zsr.speak(text)
    }
  }

  /**
   * Speak text through Speech Mode.
   *
   * This should be used by ZSR instead of calling
   * the TTS engine directly.
   */
  function speak(text) {
    if (!enabled) {
      // Speech Mode is disabled.
      // ZSR continues to operate normally,
      // but no speech is produced.
      return false
    }

    speakNative(text)

    return true
  }

  /**
   * Enable speech output.
   */
  function enable() {
    enabled = true
  }

  /**
   * Disable speech output.
   *
   * This does NOT disable ZSR.
   * It only suppresses speech feedback.
   */
  function disable() {
    enabled = false

    // Stop any speech that is currently playing.
    stop()
  }

  /**
   * Toggle Speech Mode.
   */
  function toggle() {
    if (enabled) {
      disable()
    } else {
      enable()
    }

    return enabled
  }

  /**
   * Check whether Speech Mode is enabled.
   */
  function isEnabled() {
    return enabled
  }

  /**
   * Stop the current speech output.
   *
   * This does NOT disable ZSR.
   */
  function stop() {
    try {
      if (
        typeof globalThis !== 'undefined' &&
        globalThis.zsr &&
        typeof globalThis.zsr.stopSpeech === 'function'
      ) {
        globalThis.zsr.stopSpeech()
      }

      if (
        typeof globalThis !== 'undefined' &&
        globalThis.zsrTTS &&
        typeof globalThis.zsrTTS.stop === 'function'
      ) {
        globalThis.zsrTTS.stop()
      }
    } catch (error) {
      console.log('[SpeechMode] Failed to stop speech:', error)
    }
  }

  /**
   * Get the current Speech Mode state.
   */
  function getState() {
    return {
      enabled
    }
  }

  return {
    speak,

    enable,
    disable,
    toggle,

    stop,

    isEnabled,
    getState
  }
})()

export default SpeechMode
