import { gettext } from 'i18n'
import { messageBuilder } from '@zos/message'
import { Settings } from '@zos/settings'
import { log } from '@zos/utils'
import { TTS } from '@zos/sensor'

const MAX_RETRIES = 3
const RETRY_DELAY = 1000
const MAX_QUEUE_SIZE = 10
const TTS_TIMEOUT = 3000
const QUEUE_TIMEOUT = 10000

AppSideService({
  async onInit() {
    try {
      this.state = {
        messageQueue: [],
        isProcessing: false,
        tts: null,
        settings: new Settings()
      }
      
      await this.setupMessageHandler()
      await this.initTTS()
      log.info('AppSide initialized')
    } catch (error) {
      log.error('Init failed:', error)
    }
  },

  setupMessageHandler() {
    messageBuilder.on('request', this.queueMessage.bind(this))
  },

  queueMessage(ctx) {
    if (this.state.messageQueue.length >= MAX_QUEUE_SIZE) {
      log.warn('Message queue full, dropping message')
      ctx.response({ success: false, error: 'Queue full' })
      return
    }
    this.state.messageQueue.push(ctx)
    this.processMessageQueue()
  },

  async processMessageQueue() {
    const { state } = this
    if (state.isProcessing || !state.messageQueue.length) return
    
    state.isProcessing = true
    const timeoutId = setTimeout(() => this.handleQueueTimeout(), QUEUE_TIMEOUT)

    try {
      while (state.messageQueue.length > 0) {
        const ctx = state.messageQueue[0]
        try {
          await this.processMessage(ctx)
          state.messageQueue.shift()
        } catch (error) {
          if (!await this.handleMessageError(ctx, error)) break
        }
      }
    } finally {
      clearTimeout(timeoutId)
      state.isProcessing = false
    }
  },

  handleQueueTimeout() {
    log.error('Queue processing timeout')
    this.clearMessageQueue()
    this.state.isProcessing = false
    if (this.state.tts) {
      this.state.tts.stop().catch(error => 
        log.error('Failed to stop TTS:', error))
    }
  },

  async handleMessageError(ctx, error) {
    if (!ctx.retries) ctx.retries = 0
    if (ctx.retries < MAX_RETRIES) {
      ctx.retries++
      await this.delay(RETRY_DELAY * ctx.retries)
      return true // Continue processing queue
    } else {
      this.state.messageQueue.shift()
      ctx.response({ 
        success: false, 
        error: error.message,
        retryCount: ctx.retries
      })
      return false // Stop processing queue
    }
  },

  async processMessage(ctx) {
    if (!ctx || !ctx.request) {
      throw new Error('Invalid context')
    }

    if (!this.validateMessage(ctx.request)) {
      throw new Error('Invalid message format')
    }

    try {
      await this.handleMessage(ctx)
    } catch (error) {
      log.error('Message processing failed:', error)
      throw error
    }
  },

  validateMessage(request) {
    return request &&
      typeof request.method === 'string' &&
      ['SPEAK', 'GET_SETTINGS'].includes(request.method)
  },

  async handleMessage(ctx) {
    const { request } = ctx
    if (!request?.method || typeof request.method !== 'string') {
      ctx.response({ success: false, error: 'Invalid request method' })
      return
    }

    try {
      switch (request.method) {
        case 'SPEAK':
          const result = await this.handleSpeak(request.params)
          ctx.response({ success: true, data: result })
          break
        case 'GET_SETTINGS':
          const settings = await this.state.settings.get()
          ctx.response({ success: true, data: settings })
          break
        default:
          ctx.response({ success: false, error: 'Unknown method' })
      }
    } catch (error) {
      ctx.response({ success: false, error: error.message })
    }
  },

  async ensureTTSReady() {
    if (!this.state.tts) {
      await this.initTTS()
    }
    
    if (!this.state.tts?.isInitialized) {
      throw new Error('TTS not ready')
    }
  },

  async handleSpeak(params) {
    if (!this.validateSpeakParams(params)) {
      throw new Error('Invalid speech parameters')
    }

    try {
      await this.ensureTTSReady()
      const { text, rate } = this.sanitizeParams(params)
      
      await Promise.race([
        this.state.tts.speak(text, rate),
        this.createTimeout(TTS_TIMEOUT)
      ])

      return { success: true, text, rate }
    } catch (error) {
      await this.handleTTSError(error)
      throw new Error(`Speech failed: ${error.message}`)
    }
  },

  validateSpeakParams(params) {
    return params?.text && typeof params.text === 'string'
  },

  sanitizeParams(params) {
    return {
      text: params.text.trim(),
      rate: this.validateRate(params.rate)
    }
  },

  async handleTTSError(error) {
    log.error('TTS error:', error)
    if (this.state.tts) {
      await this.state.tts.stop().catch(() => null)
      this.state.tts = null
    }
  },

  validateText(text) {
    if (!text || typeof text !== 'string') {
      throw new Error('Invalid text parameter')
    }
    return text.trim()
  },

  async initTTS() {
    if (this.initializingTTS) {
      return this.initPromise
    }

    try {
      this.initializingTTS = true
      if (!this.initPromise) {
        this.initPromise = this._initTTS()
      }
      return await this.initPromise
    } catch (error) {
      this.state.tts = null
      throw error
    } finally {
      this.initializingTTS = false
      this.initPromise = null
    }
  },

  async _initTTS() {
    try {
      if (this.state.tts) {
        await Promise.race([
          this.state.tts.stop(),
          this.createTimeout(TTS_TIMEOUT)
        ]).catch(() => null)
        this.state.tts = null
      }

      this.state.tts = new TTS()
      await Promise.race([
        this.state.tts.init(),
        this.createTimeout(TTS_TIMEOUT)
      ])

      return true
    } catch (error) {
      this.state.tts = null
      throw new Error(`TTS initialization failed: ${error.message}`)
    }
  },

  createTimeout(message, duration) {
    return new Promise((_, reject) => 
      setTimeout(() => reject(new Error(message)), duration)
    )
  },

  validateRate(rate = 1.0) {
    const parsedRate = parseFloat(rate)
    if (isNaN(parsedRate) || parsedRate <= 0 || parsedRate > 2) {
      log.warn('Invalid rate, using default')
      return 1.0
    }
    return parsedRate
  },

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  },

  clearMessageQueue() {
    while (this.state.messageQueue.length > 0) {
      const ctx = this.state.messageQueue.shift()
      ctx.response({ success: false, error: 'Queue cleared' })
    }
    this.state.isProcessing = false
  },

  onDestroy() {
    try {
      this.clearMessageQueue()
      messageBuilder.removeAllListeners()
      
      if (this.state.tts?.isInitialized) {
        this.state.tts.stop().catch(() => null)
      }

      this.state = {
        messageQueue: [],
        isProcessing: false,
        tts: null,
        settings: null
      }
    } catch (error) {
      log.error('Cleanup failed:', error)
    }
  }
})