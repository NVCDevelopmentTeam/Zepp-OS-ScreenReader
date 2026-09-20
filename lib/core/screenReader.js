import { log } from '@zos/utils'
import TTSEngine from '../TTSSystem/index.js'
import { VibrationManager } from '../feedback/vibrateFeedback.js'
import { SoundFeedback } from '../feedback/soundFeedback.js'
import { EventEmitter } from '../utils/eventEmitter.js'
import SpeechHistory from '../utils/speechHistory.js'
import { translateEmojis, translateSymbols, announceCapitals } from '../utils/emojis.js'
import VirtualScreen from '../extensions/virtualScreen.js'
import AudioController from '../equipment/audioController.js'

/**
 * Screen reader implementation for Zepp OS
 */
class ScreenReader extends EventEmitter {
  constructor() {
    super()
    this.tts = new TTSEngine()
    this.vibration = new VibrationManager()
    this.sound = new SoundFeedback()
    this.queue = []
    this.enabled = false
    this.muted = false
    this.isProcessing = false
    this.isPaused = false
    this.speaking = false
    this.debugMode = false
    this.initialized = false
    this.initPromise = null
    this.debugStats = { totalSpoken: 0, errors: 0, startTime: Date.now() }
    this.lastSpoken = ''
    this.lastSpokenAt = 0
  }

  setDebugMode(enabled) {
    this.debugMode = enabled
    this.logDebug(`Debug mode ${enabled ? 'enabled' : 'disabled'}`)
  }

  toggleMute() {
    this.muted = !this.muted
    this.logDebug(`Speech feedback ${this.muted ? 'muted' : 'unmuted'}`)
    this.emit('muteChange', this.muted)
    if (this.muted) {
      this.sound.play('click')
      this.vibration.vibrate('warning')
      this.tts.synthesize('Speech muted', { priority: 'high' })
    } else {
      this.sound.play('click')
      this.vibration.vibrate('success')
      this.speak('Speech unmuted', { priority: 'high', force: true })
    }
    return this.muted
  }

  toggleEnabled(force = false) {
    if (this.enabled && !force && globalThis.ScreenReaderConfig?.confirmBeforeDisable) {
      this.emit('confirmDisable')
      return this.enabled
    }

    this.enabled = !this.enabled
    this.logDebug(`Screen reader ${this.enabled ? 'enabled' : 'disabled'}`)
    this.emit('enabledChange', this.enabled)

    if (this.enabled) {
      this.vibration.vibrate('success')
      this.sound.play('success')
      this.speak('ZSR has been turned on', { priority: 'high', force: true })
    } else {
      this.vibration.vibrate('warning')
      this.sound.play('warning')
      this.stop()
      // Use raw TTS synthesize to ensure announcement even if 'enabled' is false
      this.tts.synthesize('ZSR has been turned off', { priority: 'high' })
    }
    return this.enabled
  }

  logDebug(message, data) {
    if (this.debugMode) {
      log.debug(`[ScreenReader] ${message}`, data || '')
      this.emit('debugLog', { message, data })
    }
  }

  async init() {
    if (this.initialized) return true
    if (this.initPromise) return this.initPromise

    const timeoutPromise = new Promise((resolve) => {
      setTimeout(() => {
        log.warn('ScreenReader init timeout')
        this.initialized = true // Force initialized to true even if TTS fails
        resolve(true)
      }, 3000)
    })

    this.initPromise = Promise.race([
      (async () => {
        try {
          this.logDebug('Initializing screen reader')

          const config = globalThis.ScreenReaderConfig || {}
          // Initialize TTS with dual mode support if secondary engine is selected
          if (config.secondaryTTSEngine && config.secondaryTTSEngine !== 'none') {
            this.tts.isDualMode = true
          }

          await this.tts.init()
          this.sound.init()
          // Respect the persisted "Enable ZSR" toggle (settingsKey
          // 'screenReaderEnabled' in setting/GeneralSetting.js) instead of
          // always forcing enabled=true on every init - previously this
          // ignored the setting entirely, so turning ZSR off never
          // actually stuck across an app restart.
          this.enabled = config.screenReaderEnabled !== false
          this.initialized = true
          this.emit('ready')
          return true
        } catch (error) {
          this.handleError(error)
          this.initialized = true // Allow app to continue
          return false
        }
      })(),
      timeoutPromise
    ])

    return this.initPromise
  }

  getLastSpoken() {
    return this.lastSpoken
  }

  async speak(text, options = {}) {
    if (!this.initialized) await this.init()
    if (!this.enabled && options.force !== true) return false

    const config = globalThis.ScreenReaderConfig || {}

    // Merge options with global config
    /** @type {Record<string, any>} */
    const mergedOptions = {
      rate: config.speechRate || 1.0,
      pitch: config.speechPitch || 1.0,
      volume: config.speechVolume || 1.0,
      voice: config.language || 'en-US',
      engine: config.primaryTTSEngine || 'espeak',
      ...options
    }

    // Translate emojis and symbols
    let processedText = text
    if (mergedOptions.translate !== false) {
      if (config.readEmoji !== false) processedText = translateEmojis(processedText)
      if (config.readSymbols !== 'none') {
        processedText = translateSymbols(processedText, config.readSymbols || 'full')
      }
      // "Uppercase Reading Style" (settingsKey 'capitalStyle') - see the
      // honesty note in lib/utils/emojis.js's announceCapitals() for why
      // only the 'announce' style (not a pitch-raise style) is real.
      if (config.capitalStyle === 'announce') {
        processedText = announceCapitals(processedText)
      } else if (config.capitalStyle === 'pitch') {
        if (
          mergedOptions.isCapital ||
          (typeof text === 'string' && text.length === 1 && text >= 'A' && text <= 'Z')
        ) {
          mergedOptions.pitch = Math.min((mergedOptions.pitch || 1.0) * 1.35, 2.0)
        }
      }
    }

    // If muted, we still "speak" but without sound (maybe just vibration)
    if (this.muted && mergedOptions.force !== true) {
      // VibrationManager.vibrate() already gates on the real
      // 'hapticFeedbackEnabled' settingsKey internally - no need for a
      // second, separate 'vibrationEnabled' flag with no UI control of
      // its own.
      if (mergedOptions.feedback !== false) {
        await this.vibration.vibrate('info')
      }
      return true
    }

    const item = {
      text: processedText,
      options: mergedOptions,
      priority: mergedOptions.priority || 'normal'
    }

    // Collapse rapid duplicate announcements (e.g. the same focus change
    // arriving multiple times from different event sources) to avoid
    // spamming the user and burning TTS cycles.
    const now = Date.now()
    if (
      mergedOptions.priority !== 'high' &&
      processedText === this.lastSpoken &&
      now - this.lastSpokenAt < 500
    ) {
      return true
    }

    if (mergedOptions.priority === 'high') {
      this.queue.unshift(item)
      if (this.speaking) await this.stop(false)
    } else {
      this.queue.push(item)
    }
    this.lastSpokenAt = now

    if (!this.isProcessing) return this.processQueue()
    return true
  }

  async stop(clearQueue = true) {
    if (clearQueue) this.queue = []
    await this.tts.stop()
    this.speaking = false
    AudioController.stopDucking()
  }

  /**
   * "Tap once to pause or resume" during a long announcement. Unlike
   * stop(), this keeps the remaining queued text and only halts between
   * items - true mid-word pause/resume isn't possible since the
   * espeak-ng side-service has no pause primitive (only stop()), so
   * resuming continues from the next queued chunk rather than the exact
   * word. Bound to a Single Tap gesture by default (see gesture.js).
   */
  async pauseResume() {
    if (this.isPaused) {
      this.isPaused = false
      if (!this.isProcessing) this.processQueue()
      return false
    }
    this.isPaused = true
    await this.tts.stop()
    this.speaking = false
    AudioController.stopDucking()
    return true
  }

  async processQueue() {
    if (this.isProcessing) return false
    this.isProcessing = true

    const config = globalThis.ScreenReaderConfig || {}
    if (config.audioDucking !== false) {
      AudioController.startDucking()
    }

    while (this.queue.length > 0) {
      if (this.isPaused) break
      const item = this.queue.shift()
      if (item) {
        try {
          this.speaking = true
          this.lastSpoken = item.text
          SpeechHistory.add(item.text)
          if (this.debugMode) {
            await VirtualScreen.say(item.text)
          }
          await this.tts.synthesize(item.text, item.options)
          if (item.options.feedback !== false) {
            await this.vibration.vibrate('info')
            this.sound.play('click')
          }
          this.emit('speak', item)
          this.debugStats.totalSpoken++
        } catch (/** @type {any} */ error) {
          if (error.message === 'TTS Interrupted') {
            this.logDebug('Speech interrupted by higher priority item')
          } else {
            this.debugStats.errors++
            this.handleError(error)
            break
          }
        } finally {
          this.speaking = false
        }
      }
    }

    this.isProcessing = false
    AudioController.stopDucking()
    if (!this.queue.length) this.emit('idle')
    return true
  }

  handleError(error) {
    this.speaking = false
    this.isProcessing = false
    this.queue = []
    this.emit('error', error)
    log.error('[ScreenReader Error]:', error.message || String(error))
    return false
  }
}

const screenReader = new ScreenReader()
globalThis.ScreenReaderInstance = screenReader
export default screenReader
