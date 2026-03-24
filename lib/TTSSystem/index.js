import { log } from '@zos/utils'
import NativeTTSEngine from './NativeTTSEngine.js'
import EspeakTTSEngine from './EspeakTTSEngine.js'

/**
 * Dual TTS Engine Manager
 * Supports simultaneous use of primary and secondary engines
 */
export class TTSEngineManager {
  constructor(options = {}) {
    this.options = options
    this.primaryEngine = null
    this.secondaryEngine = null
    this.isDualMode = options.dualMode || false
  }

  async init() {
    try {
      const config = globalThis.ScreenReaderConfig || {}

      // Initialize Primary Engine
      if (config.primaryTTSEngine === 'native') {
        this.primaryEngine = new NativeTTSEngine(this.options)
      } else {
        this.primaryEngine = new EspeakTTSEngine(this.options)
      }

      let success = await this.primaryEngine.init()

      if (!success) {
        log.warn('Primary TTS init failed, trying fallback')
        // Fallback to whichever one we didn't try
        if (this.primaryEngine instanceof NativeTTSEngine) {
          this.primaryEngine = new EspeakTTSEngine(this.options)
        } else {
          this.primaryEngine = new NativeTTSEngine(this.options)
        }
        await this.primaryEngine.init()
      }

      // Initialize Secondary Engine
      if (this.isDualMode || (config.secondaryTTSEngine && config.secondaryTTSEngine !== 'none')) {
        this.secondaryEngine = new EspeakTTSEngine({ ...this.options, voice: 'en-US' })
        await this.secondaryEngine.init()
      }

      return true
    } catch (error) {
      log.error('TTS Engine Manager init failed:', error)
      return false
    }
  }

  async stop() {
    if (this.primaryEngine) await this.primaryEngine.stop()
    if (this.secondaryEngine) await this.secondaryEngine.stop()
  }

  /**
   * Synthesize text
   * @param {string} text
   * @param {Object} options
   * @param {boolean} options.secondary - Use secondary engine if available
   */
  async synthesize(text, options = {}) {
    const engine =
      options.secondary && this.secondaryEngine ? this.secondaryEngine : this.primaryEngine
    if (!engine) return false
    return await engine.synthesize(text, options)
  }

  setVoice(voice, isSecondary = false) {
    const engine = isSecondary ? this.secondaryEngine : this.primaryEngine
    if (engine) engine.setVoice(voice)
  }

  setRate(rate, isSecondary = false) {
    const engine = isSecondary ? this.secondaryEngine : this.primaryEngine
    if (engine) engine.setRate(rate)
  }

  setPitch(pitch, isSecondary = false) {
    const engine = isSecondary ? this.secondaryEngine : this.primaryEngine
    if (engine) engine.setPitch(pitch)
  }
}

export default TTSEngineManager
