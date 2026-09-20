import { log } from '@zos/utils'
import { push, back } from '@zos/router'
import { onKey, KEY_HOME, KEY_EVENT_CLICK } from '@zos/interaction'

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
        await screenReader.speak(`Screen reader ${enabled ? 'enabled' : 'disabled'}`, {
          priority: 'high',
          force: true
        })
      }
    })
    this.register('toggleScreenCurtain', async () => {
      const screenReader = this.getScreenReader()
      if (screenReader) {
        const config = globalThis.ScreenReaderConfig || {}
        config.screenCurtain = !config.screenCurtain
        // We need the root group to enable the curtain, this will be handled in PageInterceptor or ScreenReaderUI
        globalThis.VisionServiceInstance?.toggleScreenDimming(
          globalThis.ScreenReaderUIInstance?.rootGroup
        )
        await screenReader.speak(
          `Screen curtain ${config.screenCurtain ? 'enabled' : 'disabled'}`,
          {
            priority: 'high',
            force: true
          }
        )
      }
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
        await screenReader.speak(`Rate ${rate.toFixed(2)}`, { priority: 'high', force: true })
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
        await screenReader.speak(`Rate ${rate.toFixed(2)}`, { priority: 'high', force: true })
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
    let clickCount = 0
    let clickTimer = null
    const CLICK_WINDOW_MS = 600

    try {
      onKey({
        callback: (key, keyEvent) => {
          if (key !== KEY_HOME || keyEvent !== KEY_EVENT_CLICK) {
            return false
          }

          const config = globalThis.ScreenReaderConfig || {}
          const mode = config.accessibilityShortcut || 'off'
          if (mode === 'off' || mode === 'long_press_home') {
            // Long-press has no separate KEY_EVENT in the simplified
            // callback form used here; treating it as "off" for the
            // click-counter avoids double-handling long-press elsewhere.
            return false
          }

          const requiredClicks = mode === 'triple_click_home' ? 3 : 2

          clickCount++
          if (clickTimer) clearTimeout(clickTimer)

          if (clickCount >= requiredClicks) {
            clickCount = 0
            this.execute('toggleZSR')
            // Skip the default Home behavior only for the click that
            // completes the pattern - earlier clicks in the sequence
            // still go home normally if the user stops short of the
            // full pattern.
            return true
          }

          clickTimer = setTimeout(() => {
            clickCount = 0
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

export default new ShortcutHandler()
