import { createWidget, widget, text } from '@zos/ui'
import { getTextByTime } from '@zos/sensor'
import { px, log } from '@zos/utils'
import { messageBuilder } from '@zos/message'

// Constants
const MAX_RECONNECT_ATTEMPTS = 3
const RECONNECT_DELAY = 1000
const CONNECTION_TIMEOUT = 5000
const SPEAK_TIMEOUT = 3000

/**
 * @typedef {Object} AppState
 * @property {boolean} isConnecting
 * @property {'disconnected'|'connecting'|'connected'} connectionState
 * @property {boolean} screenReaderEnabled
 * @property {number} speechRate
 */

App({
  /** @type {AppState} */
  state: {
    isConnecting: false,
    connectionState: 'disconnected',
    screenReaderEnabled: false,
    speechRate: 1.0
  },

  onCreate() {
    try {
      this.initScreenReader()
      log.info('App created successfully')
    } catch (error) {
      log.error('App creation failed:', error)
    }
  },

  initScreenReader() {
    try {
      if (!this.state) this.state = {}
      this.state.screenReaderEnabled = true
      this.connectWithRetry()
      this.initMessageHandler()
      log.info('Screen reader initialization started')
    } catch (error) {
      log.error('Screen reader init failed:', error)
      throw error
    }
  },

  async connectWithRetry(attempt = 0) {
    if (this.state.isConnecting || this.state.connectionState === 'connected') return

    try {
      this.state.isConnecting = true
      this.state.connectionState = 'connecting'
      
      // Add timeout to connection attempt
      const connectPromise = messageBuilder.connect()
      const timeoutPromise = this.createTimeout(CONNECTION_TIMEOUT)
      
      await Promise.race([connectPromise, timeoutPromise])
      this.state.connectionState = 'connected'
      
      // Initial announcement with error handling
      const speakPromise = this.speak('Screen reader initialized')
      const speakTimeout = this.createTimeout(SPEAK_TIMEOUT)
      await Promise.race([speakPromise, speakTimeout]).catch(log.warn)
    } catch (error) {
      await this.handleConnectionError(error, attempt)
    } finally {
      this.state.isConnecting = false
    }
  },

  createTimeout(duration) {
    return new Promise((_, reject) => 
      setTimeout(() => reject(new Error(`Operation timed out after ${duration}ms`)), duration)
    )
  },

  async handleConnectionError(error, attempt) {
    log.error(`Connection attempt ${attempt + 1} failed:`, error?.message || error)
    
    if (attempt < MAX_RECONNECT_ATTEMPTS) {
      const delay = RECONNECT_DELAY * Math.pow(2, attempt)
      log.info(`Retrying in ${delay}ms...`)
      await this.delay(delay)
      return this.connectWithRetry(attempt + 1)
    }
    
    this.handleError(new Error(`Max retries (${MAX_RECONNECT_ATTEMPTS}) exceeded: ${error?.message || error}`))
  },

  initMessageHandler() {
    messageBuilder.on('error', (error) => {
      log.error('Message error:', error?.message || error)
      this.handleError(error)
    })

    // Add connection status monitoring
    messageBuilder.on('disconnect', () => {
      log.warn('Connection lost, attempting to reconnect...')
      this.state.connectionState = 'disconnected'
      this.connectWithRetry()
    })
  },

  handleError(error) {
    log.error('App error:', error?.message || error)
    this.state.screenReaderEnabled = false
    if (this.state.connectionState === 'connected') {
      messageBuilder.disconnect()
    }
    this.state.connectionState = 'disconnected'
  },

  /**
   * @param {string} text - Text to speak
   * @param {number} [rate] - Speech rate override
   * @returns {Promise<void>}
   */
  async speak(text, rate) {
    if (!this.validateSpeakParams(text, rate)) return

    try {
      const speakPromise = messageBuilder.request({
        method: 'SPEAK',
        params: {
          text,
          rate: rate || this.state.speechRate
        }
      })
      
      const timeoutPromise = this.createTimeout(SPEAK_TIMEOUT)
      return await Promise.race([speakPromise, timeoutPromise])
    } catch (error) {
      log.error('Speech failed:', error?.message || error)
      throw error
    }
  },

  /**
   * @param {string} text - Text to validate
   * @param {number} [rate] - Speech rate to validate
   * @returns {boolean}
   */
  validateSpeakParams(text, rate) {
    if (!text?.trim()) {
      log.error('Invalid text parameter')
      return false
    }
    if (this.state.connectionState !== 'connected') {
      log.error('Not connected to message service')
      return false
    }
    if (!this.state.screenReaderEnabled) {
      log.warn('Screen reader is not enabled')
      return false
    }
    if (rate && (rate < 0.5 || rate > 2)) {
      log.warn('Speech rate out of bounds, using default')
      return true
    }
    return true
  },

  /**
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise<void>}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms))
  },

  onDestroy() {
    try {
      this.state.screenReaderEnabled = false
      if (this.tts) {
        this.tts.stop().catch(() => null)
      }
      if (this.state.connectionState === 'connected') {
        messageBuilder.disconnect()
      }
      this.state.connectionState = 'disconnected'
      this.state.isConnecting = false
      log.info('App destroyed successfully')
    } catch (error) {
      log.error('App destruction failed:', error?.message || error)
    }
  }
})