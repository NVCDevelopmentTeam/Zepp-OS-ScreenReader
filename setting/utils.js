import * as hmUI from '@zos/ui'
import { getDeviceInfo } from '@zos/device'
import { log } from '@zos/utils'

const DEVICE_CAPABILITIES = {
  audio: ['volume', 'sound'],
  display: ['brightness', 'contrast'],
  speech: ['rate', 'pitch'],
  gesture: ['swipe', 'tap']
}

const deviceManager = {
  async validate() {
    try {
      const info = await getDeviceInfo()
      return {
        success: info?.success || false,
        capabilities: this.parseCapabilities(info?.capabilities)
      }
    } catch (error) {
      log.error('Device validation failed:', error)
      return { success: false, capabilities: {} }
    }
  },

  parseCapabilities(caps = {}) {
    return {
      audio: !!caps.audio?.enabled,
      speech: !!caps.speech?.enabled,
      display: !!caps.display?.enabled,
      gesture: !!caps.gesture?.enabled
    }
  }
}

export const settingsManager = {
  deviceManager,

  async validateDeviceFeatures(requiredCapabilities = []) {
    try {
      const info = await getDeviceInfo()
      if (!info?.success) {
        throw new Error('Device info not available')
      }
      
      const caps = info.capabilities || {}
      const validated = this.validateCapabilities(caps)

      if (requiredCapabilities.length) {
        const missing = requiredCapabilities.filter(cap => !validated[cap])
        if (missing.length) {
          throw new Error(`Missing capabilities: ${missing.join(', ')}`)
        }
      }

      return { success: true, capabilities: validated }
    } catch (error) {
      log.error('Device validation failed:', error.message)
      return { success: false, capabilities: {} }
    }
  },

  init() {
    try {
      const info = getDeviceInfo()
      return {
        isValid: info.success,
        capabilities: this.validateCapabilities(info.capabilities || {})
      }
    } catch (error) {
      log.error('Settings initialization failed:', error)
      return { isValid: false, capabilities: {} }
    }
  },

  validateCapabilities(caps = {}) {
    if (!caps || typeof caps !== 'object') return {}
    return {
      audio: Boolean(caps.audio?.enabled),
      speech: Boolean(caps.speech?.enabled),
      display: Boolean(caps.display?.enabled),
      gesture: Boolean(caps.gesture?.enabled)
    }
  },

  isSupported: (capability) => {
    const info = getDeviceInfo()
    return info.success && info.capabilities?.[capability]
  },

  validateNumericRange: (value, min, max) => {
    const num = parseFloat(value)
    return !isNaN(num) && num >= min && num <= max
  },

  async handleSettingChange(apiCall, newValue, settingName) {
    if (typeof apiCall !== 'function') {
      log.error(`Invalid API call for ${settingName}`)
      return [false, null]
    }
    try {
      const result = await apiCall(newValue)
      log.debug(`${settingName}: ${JSON.stringify(newValue)}`)
      return [true, result]
    } catch (error) {
      log.error(`${settingName} error: ${error.message}`)
      return [false, null]
    }
  },

  validateLanguage: (lang) => {
    const validLangs = ['en-US', 'zh-CN', 'ja-JP', 'ko-KR']
    return validLangs.includes(lang)
  },

  validateBoolean: (value) => {
    return typeof value === 'boolean'
  },

  handleToggleSetting: async (apiCall, currentValue, settingName) => {
    const newValue = !currentValue
    try {
      await apiCall(newValue)
      log.info(`${settingName} toggled to: ${newValue}`)
      return [true, newValue]
    } catch (error) {
      log.error(`Failed to toggle ${settingName}:`, error)
      return [false, currentValue]
    }
  },

  validateSettings: {
    mode: (mode) => ['auto', 'manual', 'character', 'default'].includes(mode),
    theme: (theme) => ['default', 'dark', 'light', 'high-contrast'].includes(theme),
    echo: (echo) => ['none', 'character', 'word', 'sentence'].includes(echo)
  },

  handleModeChange: async (apiCall, newValue, settingName, validModes) => {
    if (!validModes.includes(newValue)) {
      log.error(`Invalid ${settingName} mode:`, newValue)
      return false
    }
    return await settingsManager.handleSettingChange(apiCall, newValue, settingName)
  },

  validateInput: {
    braille: {
      modes: ['auto', 'manual', 'basic', 'advanced'],
      layouts: ['default', 'en-US', 'zh-CN', 'ja-JP', 'ko-KR']
    },
    keyboard: {
      echo: ['none', 'character', 'word', 'sentence'],
      layouts: ['en-US', 'zh-CN', 'ja-JP', 'ko-KR']
    },
    sound: {
      volume: (val) => this.validateNumericRange(val, 0, 100),
      themes: ['default', 'classic', 'modern']
    }
  },

  validateGesture: {
    actions: ['read', 'pause', 'next', 'previous', 'select']
  },
  
  validateMenuOrder: (order) => {
    return ['asc', 'desc'].includes(order)
  },

  handleError: (error, context) => {
    log.error(`[${context}] ${error.message}`)
    return false
  },

  validateDisplay: {
    brightness: (value) => settingsManager.validateNumericRange(value, 0, 100),
    contrast: (value) => settingsManager.validateNumericRange(value, 0.5, 2.0),
    fontScale: (value) => settingsManager.validateNumericRange(value, 0.8, 1.5)
  },

  validateFeedback: {
    intensity: ['low', 'medium', 'high'],
    patterns: ['single', 'double', 'long']
  },

  checkDeviceSupport: async () => {
    const info = getDeviceInfo()
    if (!info.success) {
      throw new Error('Failed to get device info')
    }
    return info.capabilities || {}
  },

  initializeDevice: async () => {
    const info = await getDeviceInfo()
    if (!info.success) {
      throw new Error('Device initialization failed')
    }
    return {
      capabilities: info.capabilities,
      deviceId: info.deviceId,
      platform: info.platform
    }
  }
}
