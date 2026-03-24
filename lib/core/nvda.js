import ScreenReader from './screenReader.js'
import NavigationManager from './navigationManager.js'
import BrailleService from './braille.js'
import VisionService from './visionService.js'
import ShortcutHandler from '../interaction/shortcut.js'
import SpeechHistory from '../utils/speechHistory.js'
import { getFriendlyDate } from '../utils/dateTimeUtils.js'
import { translateEmojis, translateSymbols } from '../utils/emojis.js'

/**
 * NVDA 2026 Module Equivalents for Zepp OS
 * This file acts as a bridge and implementation for all 21 NVDA modules.
 */

export const NVDA = {
  // 1. General
  General: {
    startup: () => ScreenReader.init(),
    toggle: (force) => ScreenReader.toggleEnabled(force),
    setLanguage: (lang) => {
      globalThis.ScreenReaderConfig.language = lang
      BrailleService.setTable(lang)
    }
  },

  // 2. Speech
  Speech: {
    speak: (text, options) => ScreenReader.speak(text, options),
    stop: () => ScreenReader.stop(),
    setRate: (rate) => ScreenReader.tts.setRate(rate),
    setPitch: (pitch) => ScreenReader.tts.setPitch(pitch)
  },

  // 3. Braille
  Braille: BrailleService,

  // 4. Audio
  Audio: {
    setVolume: (vol) => ScreenReader.tts.setVolume(vol),
    toggleMute: () => ScreenReader.toggleMute()
  },

  // 5. Vision
  Vision: VisionService,

  // 6. Keyboard
  Keyboard: ShortcutHandler,

  // 7. Mouse (Touch Explore)
  Mouse: {
    explore: (x, y) => {
      const index = NavigationManager.findElementAt(x, y)
      if (index !== -1) NavigationManager.focusElement(index)
    }
  },

  // 8. Review Cursor
  ReviewCursor: {
    move: (dir) => NavigationManager.moveReviewCursor(dir),
    read: () => NavigationManager.readReviewCursor()
  },

  // 9. Input Composition
  InputComposition: {
    echoCharacter: (char) => ScreenReader.speak(char, { priority: 'high' }),
    echoWord: (word) => ScreenReader.speak(word, { priority: 'high' }),
    echoSentence: (sentence) => ScreenReader.speak(sentence, { priority: 'high' })
  },

  // 10. Object Presentation
  ObjectPresentation: {
    reportRole: true,
    reportState: true,
    reportValue: true,
    describe: (el) => NavigationManager.getElementText(el.element, el.type, el.options)
  },

  // 11. Browse Mode
  BrowseMode: {
    toggle: () => NavigationManager.cycleMode('browse'),
    next: (type) => NavigationManager.navigateByType('next', type, 'browse'),
    prev: (type) => NavigationManager.navigateByType('prev', type, 'browse')
  },

  // 12. Document Formatting
  DocumentFormatting: {
    reportFont: false,
    reportSize: true,
    reportStyle: true
  },

  // 13. Document Navigation
  DocumentNavigation: {
    nextHeading: () => NavigationManager.navigateByType('next', null, 'heading'),
    nextLink: () => NavigationManager.navigateByType('next', null, 'link')
  },

  // 14. Remote Access
  RemoteAccess: {
    enabled: false,
    sendState: () => {} // Implemented in AccessibilityService
  },

  // 15. Speech History
  SpeechHistory: SpeechHistory,

  // 16. Report Symbols
  ReportSymbols: {
    translate: (text) => translateSymbols(text)
  },

  // 17. Report Passwords
  ReportPasswords: {
    mode: 'mask' // 'mask' or 'spell'
  },

  // 18. Emoticons
  Emoticons: {
    translate: (text) => translateEmojis(text)
  },

  // 19. Day of the Week
  DayOfTheWeek: {
    get: () => getFriendlyDate().split(',')[0]
  },

  // 20. Add-on Updater
  AddonUpdater: {
    check: async () => {
      // Logic from app-side UPDATE_CHECK
    }
  },

  // 21. Advanced
  Advanced: {
    debugMode: false,
    log: (msg) => console.log(`[NVDA-ADV] ${msg}`)
  }
}

globalThis.NVDA = NVDA
export default NVDA
