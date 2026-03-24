import { getDeviceInfo } from '@zos/device'
const deviceInfo = getDeviceInfo()
// In Zepp OS 2.0, hmStorage is global or can be imported.
// We use the global hmStorage if available or provide a fallback.
const storage =
  typeof globalThis.hmStorage !== 'undefined'
    ? globalThis.hmStorage
    : {
        setItem: () => {},
        getItem: () => null
      }

// Flattened config for easier access on device
export const ServerConfig = {
  // General
  enabled: true,
  autoStart: true,
  confirmBeforeDisable: true,
  language: 'en-US',

  // Speech
  primaryTTSEngine: 'espeak',
  secondaryTTSEngine: 'none',
  speechRate: 1.0,
  speechPitch: 1.0,
  speechVolume: 1.0,
  readEmoji: true,
  readSymbols: false,
  readStatusBar: true,
  readProgressBars: true,
  readUsageHints: true,
  readListItemPosition: true,
  reportPasswords: 'mask',

  // Vision
  screenCurtain: false,
  exploreMode: true,
  magnification: false,

  // Feedback
  vibrationEnabled: true,
  soundEnabled: true,
  soundVolume: 0.7,

  // Remote
  remoteAssistance: false,

  // Gestures
  customGestures: {},

  // Device Info (Read-only)
  deviceModel: deviceInfo.deviceName,
  devicePlatform: deviceInfo.platformName,
  screenWidth: deviceInfo.width,
  screenHeight: deviceInfo.height
}

// Settings management
export const saveSettings = (settings) => {
  try {
    storage.setItem('screenReaderConfig', JSON.stringify(settings))
    return true
  } catch (error) {
    console.error('Failed to save settings:', error)
    return false
  }
}

export const loadSettings = () => {
  try {
    const saved = storage.getItem('screenReaderConfig')
    if (saved) {
      const parsed = JSON.parse(saved)
      return { ...ServerConfig, ...parsed }
    }
    return ServerConfig
  } catch (error) {
    console.error('Failed to load settings:', error)
    return ServerConfig
  }
}

export default ServerConfig
