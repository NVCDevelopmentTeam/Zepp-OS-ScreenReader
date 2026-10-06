import { EventEmitter } from '../utils/eventEmitter.js'
import { log } from '@zos/utils'
import { getDeviceInfo } from '@zos/device'
import ScreenReader from '../core/screenReader.js'
import { VibrationManager } from '../feedback/vibrateFeedback.js'
import { CAPABILITIES } from '../utils/constants.js'
import { getApiCapabilityLevel } from '../utils/apiCapability.js'

class AccessibilityServer extends EventEmitter {
  constructor() {
    super()
    this.initialized = false
    this.capabilities = null
  }

  async initialize() {
    try {
      await this.validateDevice()
      await ScreenReader.init()
      this.initialized = true
      this.emit('ready')
      return true
    } catch (error) {
      this.handleError(error)
      return false
    }
  }

  async validateDevice() {
    try {
      // getDeviceInfo() is synchronous and returns the info object directly
      // (there is no `success` / `capabilities` field on it).
      const info = getDeviceInfo()
      if (!info || !info.width) {
        throw new Error('Failed to get device info')
      }
      this.capabilities = this.detectCapabilities()
      return true
    } catch (error) {
      this.handleError(error)
      return false
    }
  }

  /**
   * Capabilities derived from the API_LEVEL that is actually present at
   * runtime (see lib/utils/apiCapability.js), not from fields the platform
   * does not provide.
   */
  detectCapabilities() {
    const level = getApiCapabilityLevel()
    return {
      // '@zos/media' (audio playback) starts at API_LEVEL 3.0.
      [CAPABILITIES.AUDIO]: level >= 3.0,
      // Speech always resolves through the engine chain, which degrades to
      // haptic feedback when no audio path exists.
      [CAPABILITIES.SPEECH]: true,
      [CAPABILITIES.DISPLAY]: true,
      [CAPABILITIES.GESTURE]: true,
      [CAPABILITIES.VIBRATE]: true
    }
  }

  async handleRequest(type, params) {
    try {
      await this.ensureInitialized()
      const handler = this.getRequestHandler(type)
      return await handler(params)
    } catch (error) {
      this.handleError(error)
      throw error
    }
  }

  async ensureInitialized() {
    if (!this.initialized) {
      const success = await this.initialize()
      if (!success) {
        throw new Error('Server initialization failed')
      }
    }
  }

  getRequestHandler(type) {
    const handlers = {
      speak: this.handleSpeak.bind(this),
      status: this.getStatus.bind(this),
      stop: this.stop.bind(this)
    }

    if (!handlers[type]) {
      throw new Error(`Unknown request type: ${type}`)
    }

    return handlers[type]
  }

  handleError(error) {
    this.emit('error', error)
    log.error('Server error:', error)
    return false
  }

  async handleSpeak(params) {
    const { text, options } = params || {}
    if (!text) throw new Error('No text provided')
    return await ScreenReader.speak(text, options)
  }

  async getStatus() {
    return {
      initialized: this.initialized,
      capabilities: this.capabilities,
      screenReader: {
        enabled: ScreenReader.enabled,
        speaking: ScreenReader.speaking
      }
    }
  }

  async stop() {
    try {
      if (VibrationManager && typeof VibrationManager.stop === 'function') {
        await VibrationManager.stop()
      }
      this.initialized = false
      return true
    } catch (error) {
      this.handleError(error)
      return false
    }
  }
}

export default new AccessibilityServer()
