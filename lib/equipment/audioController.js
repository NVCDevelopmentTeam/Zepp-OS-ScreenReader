import { createPlayer } from './mediaSupport.js'
import { soundCandidates } from '../feedback/soundPaths.js'
import { log } from '@zos/utils'

class AudioController {
  constructor() {
    this.volume = 70
    this.enabled = true
    this._player = null
    this.SOUNDS = {
      tap: 'tap.opus',
      success: 'success.opus',
      error: 'error.opus',
      warning: 'warning.opus',
      notification: 'notification.opus'
    }
  }

  /**
   * Lazily created: '@zos/media' only exists on API_LEVEL 3.0+, and it is
   * loaded asynchronously at startup (see mediaSupport.js), so the player
   * cannot be created while this singleton is constructed.
   */
  get player() {
    if (!this._player) this._player = createPlayer()
    return this._player
  }

  async playSound(type) {
    if (!this.enabled || !this.player) return false

    try {
      const sound = this.SOUNDS[type]
      if (!sound) throw new Error('Invalid sound type')

      this.player.stop()
      this.player.setSource(this.player.source.FILE, { file: soundCandidates(sound)[0] })
      this.player.prepare()
      this.player.start()
      return true
    } catch (error) {
      log.error('Audio playback failed:', error)
      return false
    }
  }

  setVolume(level) {
    this.volume = Math.min(Math.max(level, 0), 100)
    if (this.player) this.player.setVolume(this.volume)
  }

  /**
   * Audio ducking (spec item 16) is NOT possible on Zepp OS: there is no
   * audio-focus API, so another app's audio cannot be lowered while ZSR speaks.
   * The previous implementation lowered ZSR's OWN player to 25% during speech,
   * which ducked nothing and risked making ZSR itself quieter, so it is now a
   * deliberate no-op. The methods remain so callers and the setting keep working
   * if a future Zepp OS adds an audio-focus API (see lib/utils/featureSupport.js).
   */
  startDucking() {
    this.isDucked = false
  }

  stopDucking() {
    this.isDucked = false
  }
}

export default new AudioController()
