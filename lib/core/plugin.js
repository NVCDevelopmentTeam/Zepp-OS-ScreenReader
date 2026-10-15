import { log } from '@zos/utils'
import ScreenReader from './screenReader.js'
import NavigationManager from './navigationManager.js'
import BrailleService from './braille.js'
import VisionService from './visionService.js'
import ShortcutHandler from '../interaction/shortcut.js'
import { activationStatus, describeActivation, openingGuide } from '../interaction/activation.js'
import {
  isTouchExplorationEnabled,
  setTouchExploration,
  toggleTouchExploration
} from './TouchExploration.js'
import KeyboardController from '../extensions/keyboard.js'
import { handleExternalKey } from '../extensions/shortcut.js'
import SpeechHistory from '../utils/speechHistory.js'
import { getFriendlyDate } from '../utils/dateTimeUtils.js'
import { translateEmojis, translateSymbols } from '../utils/emojis.js'

/**
 * The ZSR programming interface, `globalThis.ZSR`.
 *
 * It is organised around what a Zepp OS watch has: a small touch screen, a crown and one to
 * three buttons, vibration, speech through the phone or the watch, and peripherals that can be
 * paired over Bluetooth (a Braille display, a keyboard). app.js adds `core`, `components` and
 * `extensions` to the same object.
 */
export const ZSRApi = {
  // 1. General: starting, switching on/off, language
  General: {
    startup: () => ScreenReader.init(),
    toggle: (force) => ScreenReader.toggleEnabled(force),
    setLanguage: (lang) => {
      globalThis.ScreenReaderConfig.language = lang
      BrailleService.setTable(lang)
    }
  },

  // 2. Activation: the three ways to turn ZSR on or off, and how to open ZSR
  Activation: {
    status: () => activationStatus(),
    describe: () => describeActivation(),
    openingGuide: () => openingGuide(),
    toggleReader: () => ShortcutHandler.execute('toggleZSR')
  },

  // 3. Speech
  Speech: {
    speak: (text, options) => ScreenReader.speak(text, options),
    stop: () => ScreenReader.stop(),
    setRate: (rate) => ScreenReader.tts.setRate(rate),
    setPitch: (pitch) => ScreenReader.tts.setPitch(pitch)
  },

  // 4. Audio: volume and mute
  Audio: {
    setVolume: (vol) => ScreenReader.tts.setVolume(vol),
    toggleMute: () => ScreenReader.toggleMute()
  },

  // 5. Touch: exploration by touch (one finger reads what it passes over)
  Touch: {
    isEnabled: () => isTouchExplorationEnabled(),
    setEnabled: (enabled, announce) => setTouchExploration(enabled, announce),
    toggle: (announce) => toggleTouchExploration(announce),
    explore: (x, y) => {
      const index = NavigationManager.findElementAt(x, y)
      if (index !== -1) NavigationManager.focusElement(index)
    }
  },

  // 6. Keys: the crown and buttons of the watch
  Keys: ShortcutHandler,

  // 7. Peripherals: what can be connected to the watch
  Peripherals: {
    // A Braille display (Bluetooth LE) or the watch's own vibration Braille
    Braille: BrailleService,
    // A keyboard; `handleKey` acts only if the firmware delivers its key codes
    Keyboard: KeyboardController,
    handleKey: (keyCode) => handleExternalKey(keyCode)
  },

  // 8. Braille (vibration Braille output and Braille display)
  Braille: BrailleService,

  // 9. Vision: screen curtain, magnification
  Vision: VisionService,

  // 10. Review cursor: move through text without moving the focus
  ReviewCursor: {
    move: (dir) => NavigationManager.moveReviewCursor(dir),
    read: () => NavigationManager.readReviewCursor()
  },

  // 11. Input: echo while typing
  Input: {
    echoCharacter: (char) => ScreenReader.speak(char, { priority: 'high' }),
    echoWord: (word) => ScreenReader.speak(word, { priority: 'high' }),
    echoSentence: (sentence) => ScreenReader.speak(sentence, { priority: 'high' })
  },

  // 12. Elements: how an element is described
  Elements: {
    reportRole: true,
    reportState: true,
    reportValue: true,
    describe: (el) => NavigationManager.getElementText(el.element, el.type, el.options)
  },

  // 13. Reading modes: how the swipes move (by item, by heading, by link ...)
  ReadingModes: {
    cycle: () => NavigationManager.cycleMode('next'),
    next: (type) => NavigationManager.navigateByType('next', type, 'browse'),
    prev: (type) => NavigationManager.navigateByType('prev', type, 'browse')
  },

  // 14. Documents: long texts
  Documents: {
    reportSize: true,
    reportStyle: true,
    nextHeading: () => NavigationManager.navigateByType('next', null, 'heading'),
    nextLink: () => NavigationManager.navigateByType('next', null, 'link')
  },

  // 15. Phone link: features that need the phone
  Phone: {
    enabled: false,
    sendState: () => {} // Implemented in AccessibilityService
  },

  // 16. Speech history
  SpeechHistory: SpeechHistory,

  // 17. Text conversion
  Symbols: { translate: (text) => translateSymbols(text) },
  Emoticons: { translate: (text) => translateEmojis(text) },
  Passwords: { mode: 'mask' }, // 'mask' or 'spell'

  // 18. Date
  DayOfTheWeek: { get: () => getFriendlyDate().split(',')[0] },

  // 19. Updates
  Updater: {
    check: async () => {
      // Logic from app-side UPDATE_CHECK
    }
  },

  // 20. Diagnostics
  Diagnostics: {
    debugMode: false,
    log: (msg) => log.debug(`[ZSR] ${msg}`)
  }
}

// The one global of the programming interface; app.js adds core / components / extensions.
globalThis.ZSR = Object.assign(globalThis.ZSR || {}, ZSRApi)
export default ZSRApi
