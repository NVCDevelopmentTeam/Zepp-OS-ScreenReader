import { getDeviceInfo } from '@zos/device'
import { log } from '@zos/utils'

const deviceManager = {
  validate() {
    try {
      getDeviceInfo()
      return {
        success: true,
        capabilities: this.parseCapabilities()
      }
    } catch (error) {
      log.error('Device validation failed: ' + String(error))
      return { success: false, capabilities: {} }
    }
  },

  parseCapabilities() {
    // In Zepp OS, audio/haptic/display capabilities are standard on supported models
    return {
      audio: true,
      speech: true,
      display: true,
      gesture: true
    }
  }
}

export const settingsManager = {
  deviceManager,

  validateDevice() {
    return this.initializeDevice()
  },

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
      log.error('Device validation failed: ' + String(error))
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
      log.error('Settings initialization failed: ' + String(error))
      return { isValid: false, capabilities: {} }
    }
  },

  validateCapabilities(_info) {
    return {
      audio: true,
      speech: true,
      display: true,
      gesture: true
    }
  },

  isSupported: (_feature) => {
    return true
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
      log.error(`${settingName} error: ` + String(error))
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
      log.error(`Failed to toggle ${settingName}: ` + String(error))
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
    log.error(`[${context}] ` + String(error))
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
    return deviceManager.parseCapabilities()
  },

  initializeDevice: async () => {
    const info = getDeviceInfo()
    return {
      success: true,
      capabilities: deviceManager.parseCapabilities(),
      deviceId: info.deviceName || 'unknown',
      platform: 'Zepp OS'
    }
  }
}
