import { getDeviceInfo } from '@zos/device'
import { getLanguage } from '@zos/settings'
import { localStorage } from '@zos/storage'
const deviceInfo = getDeviceInfo()
// `hmStorage` is a Zepp OS 1.0-era global and does not exist in the 2.0
// API this project targets - the real 2.0 persistence API is
// `localStorage` from `@zos/storage`. Falling back to a no-op stub when
// `hmStorage` was undefined meant saveSettings()/loadSettings() silently
// did nothing on real 2.0 devices: settings pushed live over BLE while
// the app was running would appear to work, but nothing ever survived an
// app restart. See
// https://docs.zepp.com/docs/reference/device-app-api/newAPI/storage/localStorage/
const storage = localStorage

// Flattened config for easier access on device
export const ServerConfig = {
  // General
  screenReaderEnabled: true,
  autoStart: true,
  confirmBeforeDisable: true,
  language: 'en-US',

  // Speech
  primaryTTSEngine: 'espeak',
  secondaryTTSEngine: 'none',
  speechRate: 1.0,
  speechPitch: 1.0,
  speechVolume: 1.0,
  capitalStyle: 'off',
  readEmoji: true,
  readSymbols: 'full',
  readStatusBar: true,
  readProgressBars: true,
  progressFeedback: 'both',
  readUsageHints: true,
  readListPosition: true,
  readPasswords: false,
  speechMuted: false,

  // Vision
  screenCurtain: false,
  exploreMode: true,
  magnification: false,

  // Feedback
  soundVolume: 0.7,

  // Remote
  remoteAccessEnabled: false,
  remoteHelperId: '',

  // Notifications
  notifyPush: true,
  notifySMS: true,
  notifyCalls: true,
  notifyMissedCalls: true,
  notifyPriority: false,

  // Speech History
  speechHistoryEnabled: true,
  speechHistoryLimit: 50,

  // Accessibility Shortcut (physical Home button, see
  // lib/interaction/shortcut.js's initHardwareShortcut())
  accessibilityShortcut: 'off',

  // Developer Options
  debugLogging: false,
  verboseSpeech: false,

  // Speech - audio behavior
  audioDucking: true,
  readScreenOff: false,
  readScreenOnTime: true,

  // Audio & Braille
  audioRouting: 'default',
  brailleEnabled: true,
  brailleTable: 'en-US',

  // Cursor & Navigation
  reviewCursor: true,
  cursorStyle: 'border',
  cursorColor: '00ff00',
  browseOrder: 'default',

  // Object Presentation
  announceDayOfWeek: true,

  // Input Composition (not yet backed by real behavior - see
  // setting/InputCompositionSetting.js's honesty note)
  echoBehavior: 'chars',
  announceAutocomplete: true,
  announceSelection: true,

  // Speech
  defaultGranularity: 'default',
  spellOutMode: false,

  // Document Settings (not yet backed by real behavior - see
  // setting/DocumentSetting.js's honesty note)
  docNavMode: 'standard',
  announceFormatting: true,
  browseBehavior: 'auto',

  // Developer Options
  apiVersionOverride: 'default',

  // Gestures
  customGestures: {},
  invertSwipeGestures: false,

  // Gesture Actions (read directly by lib/interaction/gesture.js)
  gesturePracticeMode: false,
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
  // Default: English (US), espeak-ng "male2" variant, per project
  // requirement - the user can still change rate/pitch/volume/voice
  // manually afterward.
  voicePreset: 'male2',

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
    // First run, no saved preferences yet: default UI/speech language to
    // the watch's actual system language (settingsKey 'language',
    // GeneralSetting.js) rather than always hardcoding English, using the
    // real `getLanguage()` from `@zos/settings`. The user can still
    // override this manually afterward - this only affects the
    // unconfigured starting value.
    try {
      const systemLanguage = getLanguage()
      if (systemLanguage) {
        return { ...ServerConfig, language: systemLanguage }
      }
    } catch (_e) {
      // getLanguage() unavailable on this firmware - fall through to the
      // hardcoded default below rather than crashing startup over it.
    }
    return ServerConfig
  } catch (error) {
    console.error('Failed to load settings:', error)
    return ServerConfig
  }
}

export default ServerConfig
