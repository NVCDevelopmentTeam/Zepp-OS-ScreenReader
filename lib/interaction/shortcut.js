import { log } from '@zos/utils'

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
      const { push } = require('@zos/router')
      push({ url: 'page/home/Settings' })
    })

    this.register('goBack', async () => {
      const { back } = require('@zos/router')
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

    log.info('ShortcutHandler initialized')
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
