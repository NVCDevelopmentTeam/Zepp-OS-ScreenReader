import { EventEmitter } from '@zos/events'
import { log } from '@zos/utils'
import { getDeviceInfo } from '@zos/device'
import ScreenReader from '../core/screenReader'
import { VibrationManager } from '../feedback/vibrate feedback'
import { CAPABILITIES } from '../utils/constants'

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
      const info = await getDeviceInfo()
      if (!info.success) {
        throw new Error('Failed to get device info')
      }

      this.capabilities = this.validateCapabilities(info.capabilities)
      return true
    } catch (error) {
      this.handleError(error)
      return false
    }
  }

  validateCapabilities(caps = {}) {
    return Object.values(CAPABILITIES).reduce((acc, key) => {
      acc[key] = Boolean(caps[key]?.enabled)
      return acc
    }, {})
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
      await VibrationManager.stop()
      this.initialized = false
      return true
    } catch (error) {
      this.handleError(error)
      return false
    }
  }
}

export default new AccessibilityServer()