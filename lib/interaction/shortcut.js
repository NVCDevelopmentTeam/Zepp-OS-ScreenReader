import VoiceControlService from '../core/voiceControlService.js'
import { log } from '@zos/utils'
import { gettext, format } from '../utils/i18n.js'
import { push, back } from '@zos/router'
import {
  onKey,
  offKey,
  KEY_HOME,
  KEY_UP,
  KEY_DOWN,
  KEY_SHORTCUT,
  KEY_EVENT_CLICK,
  KEY_EVENT_LONG_PRESS
} from '@zos/interaction'

export class ShortcutHandler {
  constructor() {
    this.SHORTCUTS = new Map()
  }

  getScreenReader() {
    return globalThis.ScreenReaderInstance
  }

  getNavManager() {
    return globalThis.NavigationManagerInstance
  }

  init() {
    // Register global shortcuts
    this.register('toggleZSR', async () => {
      const screenReader = this.getScreenReader()
      if (screenReader) {
        const enabled = screenReader.toggleEnabled()
        await screenReader.speak(
          enabled ? gettext('Screen reader enabled') : gettext('Screen reader disabled'),
          {
            priority: 'high',
            force: true
          }
        )
      }
    })
    // Mute / unmute speech output (also reachable as 'toggleSpeech').
    const toggleMute = async () => {
      const screenReader = this.getScreenReader()
      if (screenReader) screenReader.toggleMute()
    }
    this.register('toggleMute', toggleMute)
    this.register('toggleSpeech', toggleMute)

    this.register('toggleScreenCurtain', async () => {
      const screenReader = this.getScreenReader()
      const ui = globalThis.ScreenReaderUIInstance
      if (screenReader && ui) {
        const on = ui.toggleCurtain()
        await screenReader.speak(
          on ? gettext('Screen curtain enabled') : gettext('Screen curtain disabled'),
          { priority: 'high', force: true }
        )
      }
    })

    // Voice command (also assignable to a gesture): record, recognise online, act.
    this.register('voiceCommand', async () => {
      await VoiceControlService.startListening()
    })

    this.register('readAll', async () => {
      const nav = this.getNavManager()
      const screenReader = this.getScreenReader()
      if (nav && screenReader) {
        const allText = nav.elements
          .map((el) => nav.getElementText(el.element, el.type, el.options))
          .join('. ')
        await screenReader.speak(allText, { priority: 'high' })
      }
    })

    this.register('readCurrent', async () => {
      const nav = this.getNavManager()
      if (nav) await nav.readCurrent()
    })

    this.register('openSettings', async () => {
      push({ url: 'page/home/Settings' })
    })

    this.register('goBack', async () => {
      // require() doesn't exist on Zepp OS's device runtime (ES modules
      // only) - this always threw, silently, so "goBack" never actually
      // navigated back. `back` is now imported statically above.
      back()
    })

    this.register('spellOut', async () => {
      const nav = this.getNavManager()
      if (nav) await nav.spellOut()
    })

    this.register('navigateToFirst', async () => {
      const nav = this.getNavManager()
      if (nav) await nav.navigateToEdge('first')
    })

    this.register('navigateToLast', async () => {
      const nav = this.getNavManager()
      if (nav) await nav.navigateToEdge('last')
    })

    this.register('increaseRate', async () => {
      const config = globalThis.ScreenReaderConfig || {}
      let rate = config.speechRate || 1.0
      rate = Math.min(rate + 0.25, 3.0)
      config.speechRate = rate

      const screenReader = this.getScreenReader()
      if (screenReader) {
        screenReader.tts.setRate(rate)
        await screenReader.speak(format(gettext('Rate {0}'), rate.toFixed(2)), {
          priority: 'high',
          force: true
        })
      }
    })

    this.register('decreaseRate', async () => {
      const config = globalThis.ScreenReaderConfig || {}
      let rate = config.speechRate || 1.0
      rate = Math.max(rate - 0.25, 0.5)
      config.speechRate = rate

      const screenReader = this.getScreenReader()
      if (screenReader) {
        screenReader.tts.setRate(rate)
        await screenReader.speak(format(gettext('Rate {0}'), rate.toFixed(2)), {
          priority: 'high',
          force: true
        })
      }
    })

    this.initHardwareShortcut()

    log.info('ShortcutHandler initialized')
  }

  /**
   * Wires the physical Home button to toggleZSR, per the number of clicks
   * chosen in setting/GeneralSetting.js's "Accessibility Shortcut"
   * (settingsKey 'accessibilityShortcut': 'long_press_home' /
   * 'double_click_home' / 'triple_click_home' / 'off').
   *
   * Design notes (see @zos/interaction docs - onKey allows only ONE
   * listener system-wide, so this is the single registration point for
   * KEY_HOME on this app):
   * - A single click of Home is intentionally left alone (falls through
   *   to Zepp OS's default behavior, `return false`) so pressing it once
   *   still exits to the watch face like a sighted user expects - only
   *   the deliberate double/triple-click patterns turn ZSR on/off.
   * - Click counting resets after 600ms of inactivity, so a normal single
   *   press to go home isn't mistaken for the start of a multi-click.
   * - This runs *before* the enabled-check that gates other shortcuts,
   *   for the same reason gesture.js's LONG_PRESS/'toggleZSR' path
   *   bypasses ScreenReader's enabled flag: a user who disabled ZSR must
   *   still be able to turn it back on with the same physical control,
   *   or they're stuck until a sighted person helps.
   */
  initHardwareShortcut() {
    const CLICK_WINDOW_MS = 600
    // Click-count state lives on the instance so re-binding the listener on
    // a new page does not lose an in-progress multi-click.
    if (this.clickCount === undefined) {
      this.clickCount = 0
      this.clickTimer = null
    }

    try {
      // onKey allows ONE listener; drop any previous one before binding.
      try {
        offKey()
      } catch (_e) {
        /* nothing registered yet */
      }
      onKey({
        callback: (key, keyEvent) => {
          const config = globalThis.ScreenReaderConfig || {}
          const mode = config.accessibilityShortcut || 'off'

          // Dedicated shortcut key (present on some models) - long press.
          if (key === KEY_SHORTCUT && keyEvent === KEY_EVENT_LONG_PRESS && mode !== 'off') {
            this.execute('toggleZSR')
            return true
          }

          // Original behaviour restored: long press UP toggles ZSR, long press
          // DOWN toggles mute (only when ZSR is active, so the watch's normal
          // long-press actions are untouched when it is off).
          if (keyEvent === KEY_EVENT_LONG_PRESS && config.hardwareLongPress !== false) {
            if (key === KEY_UP) {
              this.execute('toggleZSR')
              return true
            }
            const sr = globalThis.ScreenReaderInstance
            if (key === KEY_DOWN && sr && sr.enabled) {
              this.execute('toggleMute')
              return true
            }
          }

          if (key !== KEY_HOME) return false

          if (mode === 'long_press_home') {
            if (keyEvent === KEY_EVENT_LONG_PRESS) {
              this.execute('toggleZSR')
              return true
            }
            return false
          }

          if (keyEvent !== KEY_EVENT_CLICK || mode === 'off') return false

          const requiredClicks = mode === 'triple_click_home' ? 3 : 2
          this.clickCount++
          if (this.clickTimer) clearTimeout(this.clickTimer)

          if (this.clickCount >= requiredClicks) {
            this.clickCount = 0
            this.execute('toggleZSR')
            // Only the click that completes the pattern is consumed; earlier
            // clicks still go Home so a normal single press works.
            return true
          }

          this.clickTimer = setTimeout(() => {
            this.clickCount = 0
          }, CLICK_WINDOW_MS)
          return false
        }
      })
    } catch (error) {
      log.warn('onKey registration failed (device may not support KEY_HOME):', error)
    }
  }

  register(key, action) {
    try {
      if (typeof action !== 'function') {
        throw new Error('Action must be a function')
      }
      this.SHORTCUTS.set(key, action)
      return true
    } catch (error) {
      log.error('Shortcut registration failed:', error)
      return false
    }
  }

  async execute(key) {
    try {
      const action = this.SHORTCUTS.get(key)
      if (!action) throw new Error(`Unknown shortcut: ${key}`)
      await action()
      return true
    } catch (error) {
      log.error('Shortcut execution failed:', error)
      return false
    }
  }
}

// Shared across separately bundled pages: reuse the instance that already exists.
const shortcutHandler = globalThis.ShortcutHandlerInstance || new ShortcutHandler()
globalThis.ShortcutHandlerInstance = shortcutHandler
export default shortcutHandler
