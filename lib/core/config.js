import { getDeviceInfo } from '@zos/device';
import { Settings } from '@zos/settings';

const deviceInfo = getDeviceInfo();

export const ServerConfig = {
  // Server settings
  server: {
    port: 8080,
    host: 'localhost',
    timeout: 5000,
    retryAttempts: 3,
    maxConnections: 1
  },

  // TTS Engine configuration
  tts: {
    engine: 'espeak',
    defaultVoice: 'en-US',
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    maxTextLength: 500
  },

  // Feedback settings
  feedback: {
    vibration: {
      enabled: true,
      duration: 50,
      intensity: 0.5
    },
    sound: {
      enabled: true,
      volume: 0.7
    }
  },

  // Debug settings
  debug: {
    enabled: false,
    logLevel: 'info',
    logToFile: false,
    performanceMonitoring: true
  },

  // Device specific settings
  device: {
    model: deviceInfo.deviceName,
    platform: deviceInfo.platformName,
    screenWidth: deviceInfo.width,
    screenHeight: deviceInfo.height
  },

  // Localization
  localization: {
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'es', 'fr', 'de', 'it'],
    fallbackLanguage: 'en'
  },

  // Queue management
  queue: {
    maxSize: 50,
    priorityLevels: ['high', 'normal', 'low'],
    defaultPriority: 'normal'
  },

  // Performance settings
  performance: {
    maxConcurrentOperations: 1,
    timeoutMs: 3000,
    bufferSize: 1024
  },

  // Storage settings
  storage: {
    maxCacheSize: 1024 * 1024, // 1MB
    persistSettings: true
  }
};

// Settings management
export const saveSettings = async (settings) => {
  try {
    await Settings.setItem('screenReaderConfig', JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error('Failed to save settings:', error);
    return false;
  }
};

export const loadSettings = async () => {
  try {
    const saved = await Settings.getItem('screenReaderConfig');
    return saved ? JSON.parse(saved) : ServerConfig;
  } catch (error) {
    console.error('Failed to load settings:', error);
    return ServerConfig;
  }
};

export default ServerConfig;