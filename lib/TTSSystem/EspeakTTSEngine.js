import { log } from '@zos/utils'

/**
 * @typedef {Object} TTSConfig
 * @property {string} voice - Voice identifier
 * @property {number} pitch - Voice pitch (0-100)
 * @property {number} rate - Speech rate (50-300)
 */

/**
 * Text-to-Speech Engine implementation using espeak-ng (via side-service)
 */
export class EspeakTTSEngine {
  /**
   * @param {Partial<TTSConfig>} [options={}] - TTS configuration options
   */
  constructor(options = {}) {
    /** @type {TTSConfig} */
    this.config = {
      voice: options.voice || 'en-US',
      pitch: options.pitch || 50,
      rate: options.rate || 175
    }
    this.initialized = false
    this.isSpeaking = false
  }

  /**
   * @returns {Promise<boolean>}
   */
  async init() {
    try {
      await this.loadVoice(this.config.voice)
      this.initialized = true
      return true
    } catch (error) {
      log.error('TTS init failed:', error instanceof Error ? error.message : String(error))
      this.initialized = false
      return false
    }
  }

  /**
   * @param {string} voice - Voice identifier
   */
  setVoice(voice) {
    this.config.voice = voice
  }

  /**
   * @param {number} pitch - Voice pitch (0-100)
   */
  setPitch(pitch) {
    this.config.pitch = Math.min(Math.max(pitch, 0), 100)
  }

  /**
   * @param {number} rate - Speech rate (50-300)
   */
  setRate(rate) {
    this.config.rate = Math.min(Math.max(rate, 50), 300)
  }

  /**
   * @returns {Promise<void>}
   */
  async stop() {
    this.isSpeaking = false
    return Promise.resolve()
  }

  /**
   * @param {string} text - Text to synthesize
   * @param {Partial<TTSConfig>} [options={}] - Synthesis options
   * @returns {Promise<boolean>}
   */
  async synthesize(text, options = {}) {
    if (!this.initialized) {
      await this.init()
    }

    try {
      return await this.processText(text, options)
    } catch (error) {
      log.error('Speech synthesis failed:', error instanceof Error ? error.message : String(error))
      throw error
    }
  }

  /**
   * @private
   * @param {string} text - Text to process
   * @param {Partial<TTSConfig>} options - Processing options
   * @returns {Promise<boolean>}
   */
  async processText(text, options) {
    if (!text?.trim()) {
      return false
    }

    try {
      const synthesisOptions = {
        voice: options.voice || this.config.voice,
        pitch: Math.min(Math.max(options.pitch ?? this.config.pitch, 0), 100),
        rate: Math.min(Math.max(options.rate ?? this.config.rate, 50), 300)
      }

      return await this.synthesizeText(text, synthesisOptions)
    } catch (error) {
      log.error('TTS processing failed:', error instanceof Error ? error.message : String(error))
      throw error
    }
  }

  /**
   * @private
   * @param {string} text - Text to synthesize
   * @param {TTSConfig} options - Synthesis options
   * @returns {Promise<boolean>}
   */
  async synthesizeText(text, options) {
    try {
      const result = await this.performSynthesis(options, text)
      return result.success
    } catch (error) {
      log.error('Synthesis failed:', error instanceof Error ? error.message : String(error))
      throw error
    }
  }

  /**
   * @private
   * @param {TTSConfig & { text: string }} options - Synthesis parameters
   * @returns {Promise<{ success: boolean }>}
   */
  async performSynthesis(options, text) {
    const app = getApp()
    const messageBuilder = app.globalData ? app.globalData.messageBuilder : null
    if (!messageBuilder) {
      log.error('MessageBuilder not found in globalData')
      return { success: false }
    }

    try {
      const response = await messageBuilder.request({
        method: 'SPEAK',
        params: {
          text,
          engine: 'espeak',
          voice: options.voice,
          pitch: options.pitch,
          rate: options.rate
        }
      })
      return { success: response && response.result === 'OK' }
    } catch (error) {
      log.error('TTS side-service request failed:', error)
      return { success: false }
    }
  }

  /**
   * @private
   * @param {string} lang - Language code
   * @returns {Promise<void>}
   */
  async loadVoice(lang) {
    const supported = ['en-US', 'zh-CN', 'ja-JP', 'ko-KR']
    if (!supported.includes(lang)) {
      log.warn(`Unsupported language for eSpeak: ${lang}`)
    }
  }
}

export default EspeakTTSEngine
