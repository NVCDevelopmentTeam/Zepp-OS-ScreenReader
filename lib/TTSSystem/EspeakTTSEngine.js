import { log } from '@zos/utils'
import SpeechPlayer, { cacheKeyFor } from '../equipment/speechPlayer.js'
import OfflineVoice from '../equipment/offlineVoice.js'

/**
 * @typedef {Object} TTSConfig
 * @property {string} voice - Voice identifier
 * @property {number} pitch - Voice pitch (0-100)
 * @property {number} rate - Speech rate (50-300)
 */

// Maps setting/VoiceSetting.js's "Voice Preset" (settingsKey 'voicePreset':
// male/female/child) onto espeak-ng's standard `<voice>+<variant>` suffix
// syntax (e.g. "en-US+f3"). 'child' has no dedicated espeak variant, so it
// approximates one via a higher-pitched female variant - flagged here
// rather than silently presented as an exact match.
const VOICE_PRESET_SUFFIXES = {
  male: '+m2',
  male1: '+m1',
  male2: '+m2',
  male3: '+m3',
  female: '+f3',
  female1: '+f1',
  female2: '+f2',
  female3: '+f3',
  child: '+f5' // approximation - espeak-ng has no purpose-built child voice
}

// The rest of ZSR expresses speech rate and pitch as MULTIPLIERS around 1.0
// (config.speechRate 0.5-3.0, config.speechPitch), while eSpeak works in
// words-per-minute and a 0-100 pitch scale. Values that already look like
// absolute eSpeak units (> 10) are passed through unchanged.
const BASE_WPM = 175
const BASE_PITCH = 50

/** @param {number} value multiplier (<= 10) or absolute words per minute */
function toWordsPerMinute(value) {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return BASE_WPM
  return Math.min(Math.max(Math.round(n <= 10 ? n * BASE_WPM : n), 50), 450)
}

/** @param {number} value multiplier (<= 10) or absolute 0-100 pitch */
function toPitch(value) {
  const n = Number(value)
  if (!Number.isFinite(n) || n <= 0) return BASE_PITCH
  return Math.min(Math.max(Math.round(n <= 10 ? n * BASE_PITCH : n), 0), 100)
}

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
  } /**
   * @param {number} pitch - Voice pitch (0-100)
   */
  setPitch(pitch) {
    this.config.pitch = toPitch(pitch)
  }

  /**
   * @param {number} rate - Speech rate: multiplier (e.g. 1.0) or words per minute (50-450)
   */
  setRate(rate) {
    this.config.rate = toWordsPerMinute(rate)
  }

  /**
   * @returns {Promise<void>}
   */
  async stop() {
    this.isSpeaking = false
    SpeechPlayer.stop()
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
        pitch: toPitch(options.pitch ?? this.config.pitch),
        rate: toWordsPerMinute(options.rate ?? this.config.rate)
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
      const result = await this.performSynthesis({ ...options, text })
      return result.success
    } catch (error) {
      log.error('Synthesis failed:', error instanceof Error ? error.message : String(error))
      throw error
    }
  }

  /**
   * @private
   * @param {TTSConfig & { text: string }} params - Merged synthesis parameters including text.
   * @returns {Promise<{ success: boolean }>}
   */
  /**
   * Speech cannot be produced (no audio on this firmware, phone not
   * connected, engine still downloading...). A blind user must still learn
   * that, so give one distinct double haptic warning per 30 s instead of
   * staying silently silent.
   */
  signalSpeechUnavailable() {
    const now = Date.now()
    if (this.lastUnavailableSignal && now - this.lastUnavailableSignal < 30000) return
    this.lastUnavailableSignal = now
    try {
      const sr = globalThis.ScreenReaderInstance
      if (sr && sr.vibration) {
        sr.vibration.vibrate('warning')
        setTimeout(() => sr.vibration.vibrate('warning'), 400)
      }
    } catch (_e) {
      /* haptics are optional */
    }
  }

  /**
   * Final espeak voice for an utterance: detected language (Vietnamese /
   * Chinese text) plus the "Voice Preset" variant suffix (e.g. '+f3').
   * @param {string} text
   * @param {string} baseVoice
   */
  resolveVoice(text, baseVoice) {
    const preset = globalThis.ScreenReaderConfig?.voicePreset
    const suffix = VOICE_PRESET_SUFFIXES[preset]
    let targetVoice = baseVoice
    if (text && globalThis.ScreenReaderConfig?.languageDetectionAuto !== false) {
      if (/[àáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]/i.test(text)) {
        targetVoice = 'vi'
      } else if (/[\u4e00-\u9fa5]/.test(text)) {
        targetVoice = 'zh'
      }
    }
    return suffix && !targetVoice.includes('+') ? `${targetVoice}${suffix}` : targetVoice
  }

  /**
   * Download the offline voice for the watch's language (and English) in the
   * background. Requires the phone; resumable; safe to call repeatedly.
   * @param {any} messageBuilder
   */
  async syncOfflineVoice(messageBuilder) {
    const cfg = globalThis.ScreenReaderConfig || {}
    if (cfg.offlineVoiceEnabled === false || !SpeechPlayer.available || !messageBuilder) return
    const ui = OfflineVoice.langOf(cfg.language || 'en-US')
    const langs = ui === 'en' ? ['en'] : [ui, 'en']
    for (const lang of langs) {
      const base = lang === 'en' ? 'en-US' : lang
      const voice = this.resolveVoice('', base)
      const result = await OfflineVoice.sync(
        (params) =>
          messageBuilder.request(
            { method: 'TTS_BATCH', params: { ...params, volume: undefined } },
            { timeout: 60000 }
          ),
        {
          voice,
          // Same values ScreenReader passes at speak time (config.speechRate /
          // speechPitch are multipliers), so the pack signature matches.
          rate: toWordsPerMinute(cfg.speechRate || 1.0),
          pitch: toPitch(cfg.speechPitch || 1.0),
          isBusy: () => this.isSpeaking
        }
      )
      log.info(`Offline voice (${lang}): ${result.status} ${result.have}/${result.total}`)
      if (result.status === 'full' || result.status === 'unavailable') break
    }
  }

  async performSynthesis(params) {
    const { text, ...options } = params

    // Audio playback needs '@zos/media' (API_LEVEL 3.0+). Without it the
    // caller falls back to haptic feedback instead of pretending to speak.
    if (!SpeechPlayer.available) {
      if (!this.warnedNoAudio) {
        this.warnedNoAudio = true
        log.warn('Speech output needs Zepp OS API_LEVEL 3.0+ (audio player); using haptics only.')
        this.signalSpeechUnavailable()
      }
      return { success: false }
    }

    const voice = this.resolveVoice(text, options.voice)

    // 1. Offline voice: short interface labels made of downloaded words are
    // spoken instantly with no phone round trip (what makes ZSR usable like
    // TalkBack/NVDA while operating the watch itself).
    const cfg = globalThis.ScreenReaderConfig || {}
    if (cfg.offlineVoiceEnabled !== false && cfg.offlineVoicePreferred !== false) {
      this.isSpeaking = true
      try {
        const spoken = await OfflineVoice.speak(text, voice, options.rate, options.pitch)
        if (spoken === true) return { success: true }
      } catch (e) {
        log.warn('Offline voice failed, using the phone instead: ' + String(e))
      } finally {
        this.isSpeaking = false
      }
    }

    // 2. Identical phrases (menus, labels) are replayed from the on-watch cache:
    // instant, and they keep working when the phone is out of range.
    const key = cacheKeyFor(voice, options.rate, options.pitch, text)
    if (SpeechPlayer.has(key)) {
      this.isSpeaking = true
      try {
        const played = await SpeechPlayer.play(key)
        if (played) {
          SpeechPlayer.touch(key)
          return { success: true }
        }
      } finally {
        this.isSpeaking = false
      }
    }

    const app = getApp()
    const messageBuilder = app._options.globalData ? app._options.globalData.messageBuilder : null
    if (!messageBuilder) {
      log.error('MessageBuilder not found in globalData')
      return { success: false }
    }

    try {
      // First use downloads the engine on the phone, so allow extra time.
      const response = await messageBuilder.request(
        {
          method: 'SPEAK',
          params: {
            text,
            engine: 'espeak',
            voice,
            pitch: options.pitch,
            rate: options.rate,
            volume: globalThis.ScreenReaderConfig?.speechVolume
              ? Math.round(globalThis.ScreenReaderConfig.speechVolume * 100)
              : undefined
          }
        },
        { timeout: 30000 }
      )

      if (!response || response.result !== 'OK' || !response.audio || !response.audio.base64) {
        log.warn('Speech synthesis unavailable on phone: ' + (response && response.code))
        this.signalSpeechUnavailable()
        return { success: false }
      }

      SpeechPlayer.store(key, response.audio.base64)
      this.isSpeaking = true
      try {
        return { success: await SpeechPlayer.play(key) }
      } finally {
        this.isSpeaking = false
      }
    } catch (error) {
      log.error('TTS side-service request failed:', error)
      this.signalSpeechUnavailable()
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
