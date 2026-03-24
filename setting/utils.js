import { getDeviceInfo } from '@zos/device'
import { log } from '@zos/utils'

const deviceManager = {
  validate() {
    try {
      getDeviceInfo()
      return {
        success: true, // getDeviceInfo always returns info object
        capabilities: this.parseCapabilities()
      }
    } catch (error) {
      log.error('Device validation failed:', error)
      return { success: false, capabilities: {} }
    }
  },

  parseCapabilities() {
    // Zepp OS doesn't have a direct 'capabilities' object in getDeviceInfo usually
    // We infer based on device info or assume some defaults
    return {
      audio: true, // Most modern watches have at least vibration
      speech: true,
      display: true,
      gesture: true
    }
  }
}

export const settingsManager = {
  deviceManager,

  validateDeviceFeatures(requiredCapabilities = []) {
    try {
      const info = getDeviceInfo()

      const validated = settingsManager.validateCapabilities(info)

      if (requiredCapabilities.length) {
        const missing = requiredCapabilities.filter((cap) => !validated[cap])
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
        isValid: true,
        capabilities: this.validateCapabilities(info)
      }
    } catch (error) {
      log.error('Settings initialization failed:', error)
      return { isValid: false, capabilities: {} }
    }
  },

  validateCapabilities(_) {
    // Inference for capabilities if needed
    return {
      audio: true,
      speech: true,
      display: true,
      gesture: true
    }
  },

  isSupported: (_) => {
    getDeviceInfo()
    return true // Assume supported for now or add specific checks
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
      volume: (val) => settingsManager.validateNumericRange(val, 0, 100),
      themes: ['default', 'classic', 'modern']
    },
    feedback: {
      intensity: ['low', 'medium', 'high'],
      patterns: ['single', 'double', 'long']
    },
    gesture: {
      actions: ['read', 'pause', 'next', 'previous', 'select']
    }
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
