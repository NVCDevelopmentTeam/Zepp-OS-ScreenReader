import * as media from '@zos/media'
import { log } from '@zos/utils'

const Tts = media ? media.Tts : null

/**
 * Native Text-to-Speech Engine implementation for Zepp OS 3.0+
 */
export class NativeTTSEngine {
  constructor(options = {}) {
    this.config = {
      voice: options.voice || 'en-US',
      pitch: options.pitch || 1.0,
      rate: options.rate || 1.0,
      volume: options.volume || 100
    }
    this.tts = null
    this.initialized = false
    this.isSpeaking = false
    this.onStatusChange = null
    this.currentReject = null
  }

  async init() {
    try {
      if (typeof Tts !== 'function') {
        throw new Error('Native Tts class not available')
      }
      this.tts = new Tts()
      this.tts.onStatusChange((status) => {
        log.debug('TTS Status:', status)
        if (status === 'FINISHED' || status === 'ERROR') {
          this.isSpeaking = false
          if (this.onStatusChange) this.onStatusChange(status)
        }
      })
      this.initialized = true
      return true
    } catch (error) {
      log.error('Native TTS init failed:', error)
      return false
    }
  }

  async stop() {
    if (this.tts) {
      this.tts.stop()
    }
    this.isSpeaking = false
    if (this.currentReject) {
      this.currentReject(new Error('TTS Interrupted'))
      this.currentReject = null
    }
  }

  async synthesize(text, options = {}) {
    if (!this.initialized) await this.init()
    if (!this.tts) return false

    // Audio Ducking: In a production Zepp OS app, we would use the Audio session API
    // to lower the volume of other apps. For now, we ensure ZSR interrupts its own speech.
    if (this.isSpeaking) {
      await this.stop()
    }

    return new Promise((resolve, reject) => {
      try {
        this.isSpeaking = true
        this.currentReject = reject

        this.onStatusChange = (status) => {
          this.currentReject = null
          if (status === 'FINISHED') resolve(true)
          if (status === 'ERROR') reject(new Error('TTS Engine Error'))
        }

        this.tts.speak({
          text,
          rate: options.rate || this.config.rate,
          pitch: options.pitch || this.config.pitch,
          volume: options.volume || this.config.volume
        })
      } catch (error) {
        this.isSpeaking = false
        this.currentReject = null
        reject(error)
      }
    })
  }

  setVoice(voice) {
    this.config.voice = voice
  }

  setRate(rate) {
    this.config.rate = rate
  }

  setPitch(pitch) {
    this.config.pitch = pitch
  }
}

export default NativeTTSEngine
