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

  // Gesture Actions (read directly by lib/interaction/gesture.js)
  gesture_up: 'cycle_mode_prev',
  gesture_down: 'cycle_mode_next',
  gesture_left: 'previous',
  gesture_right: 'next',
  gesture_click: 'select',
  gesture_double_click: 'read_screen',
  gesture_long_press: 'context_menu',
  gesture_two_finger_tap: 'toggle_mute',
  gesture_three_finger_tap: 'read_status_bar',
  gesture_two_finger_swipe_up: 'scroll_up',
  gesture_two_finger_swipe_down: 'scroll_down',
  gesture_two_finger_swipe_left: 'previous_page',
  gesture_two_finger_swipe_right: 'next_page',
  gesture_three_finger_swipe_up: 'read_current',
  gesture_three_finger_swipe_down: 'read_all',
  gesture_three_finger_swipe_left: 'spell_out',
  gesture_three_finger_swipe_right: 'toggle_screen_curtain',

  // Gestures & Input (button/keyboard remapping)
  buttonRemappingEnabled: false,
  fingerprintActions: false,
  keyboardMode: 'standard',
  brailleKeyboardEnabled: false,

  // OCR & Image Recognition
  ocrEnabled: true,
  ocrMode: 'auto',
  ocrLanguage: 'en-US',
  ocrRegion: 'full',

  // Display
  fontScale: 1.0,
  highContrastMode: false,

  // Font Style
  fontFamily: 'default',
  fontWeight: 'normal',

  // Feedback
  hapticFeedbackEnabled: true,
  soundFeedbackEnabled: true,
  feedbackIntensity: 'medium',

  // Sound Effects
  soundTheme: 'default',

  // Master Volume
  masterVolume: 80,

  // Text-to-Speech Engine
  ttsQuality: 'high',

  // Voice Preset
  voicePreset: 'female',

  // Keyboard
  keyboardShortcutsEnabled: true,
  keyboardEchoMode: 'character',
  keyboardLayout: 'en-US',

  // Language & Region
  fallbackLanguage: 'en-US',
  languageDetectionAuto: true,

  // Context Menu
  // Context Menu (settingsKeys match contextMenu.js's real menu items)
  menuShowReadFromTop: true,
  menuShowReadFromBottom: true,
  menuShowCycleNavigationMode: true,
  menuShowObjectDetails: true,
  menuShowScreenCurtain: true,
  menuShowReadSensors: true,
  menuShowReadStatusBar: true,
  menuShowScreenRecognition: true,
  menuShowPhotoGuidance: true,
  menuShowImageDescription: true,
  menuShowSpellOut: true,
  menuShowBrailleKeyboard: true,
  menuShowRepeatLast: true,
  menuOrder: 'default',

  // Shortcut Card
  shortcutCardAction: 'toggle_screen_reader',

  // Audio Output
  audioSoundSplitMode: 'disabled',
  audioFollowsVoiceVolume: false,
  audioKeepAwakeSeconds: 30,

  // Braille Input
  brailleDisplayMode: 'auto',
  brailleInputMode: '6dot',
  brailleKeyboardLayout: 'en-US',

  // Reliability & Diagnostics
  autoRecoveryEnabled: true,
  maxRecoveryAttempts: 3,

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
