import NavigationManager from './navigationManager.js'
import ScreenReader from './screenReader.js'
import ScreenReaderUI from '../components/screenReaderUI.js'
import { GESTURES } from '../interaction/gesture.js'
import ShortcutHandler from '../interaction/shortcut.js'
import { log } from '@zos/utils'
import { showDialog } from '@zos/ui'
import { gettext } from '@zos/i18n'

/**
 * Page Interceptor to handle page lifecycle and automatic announcements
 */
class PageInterceptor {
  constructor() {
    this.initialized = false
  }

  init() {
    if (this.initialized) return
    log.info('Initializing Page Interceptor')

    const self = this

    // Lazy interception or immediate if already present
    const intercept = () => {
      const originalPage = typeof Page !== 'undefined' ? Page : null

      if (!originalPage) {
        log.warn('Page global still not found, waiting...')
        setTimeout(intercept, 100)
        return
      }

      const newPage = function (pageConfig) {
        const originalOnInit = pageConfig.onInit
        const originalOnShow = pageConfig.onShow
        const originalOnDestroy = pageConfig.onDestroy
        const originalBuild = pageConfig.build

        pageConfig.onInit = function (params) {
          log.info('Page onInit intercepted')
          NavigationManager.clearElements()
          if (originalOnInit) originalOnInit.call(this, params)
        }

        pageConfig.onShow = function () {
          log.info('Page onShow intercepted')
          ScreenReader.speak(gettext('Entering page'), { priority: 'high' })

          if (originalOnShow) return originalOnShow.call(this)
        }

        pageConfig.build = function () {
          log.info('Page build intercepted')
          let root = null
          try {
            root = originalBuild ? originalBuild.call(this) : null
          } catch (e) {
            log.error('Original build failed:', e)
          }

          if (root && typeof root.createWidget === 'function') {
            try {
              ScreenReaderUI.init(root)
            } catch (e) {
              log.error('ScreenReaderUI init failed:', e)
            }
          } else {
            log.warn(
              'No root widget returned from build(), ScreenReaderUI might not work on this page'
            )
          }

          return root
        }

        pageConfig.onDestroy = function () {
          log.info('Page onDestroy intercepted')
          NavigationManager.clearElements()
          if (originalOnDestroy) return originalOnDestroy.call(this)
        }

        // Add Key handling
        const originalOnKey = pageConfig.onKey
        pageConfig.onKey = function (event) {
          const keyCode = typeof event === 'object' ? event.code : event
          const keyType = typeof event === 'object' ? event.type : 0 // 0: short, 1: long

          log.info(`Key event: code=${keyCode}, type=${keyType}`)

          // Check for accessibility shortcut (configurable hardware button)
          // Default: UP button long press toggles ZSR
          if (keyCode === 1 && keyType === 1) {
            // 1 is often UP
            ShortcutHandler.execute('toggleZSR')
            return true
          }

          // DOWN button long press toggles mute
          if (keyCode === 2 && keyType === 1) {
            // 2 is often DOWN
            ShortcutHandler.execute('toggleMute')
            return true
          }

          if (originalOnKey) return originalOnKey.call(this, event)
          return false
        }

        // Add gesture support
        const originalOnGesture = pageConfig.onGesture
        pageConfig.onGesture = function (event) {
          if (!ScreenReader.enabled) {
            if (originalOnGesture) return originalOnGesture.call(this, event)
            return false
          }

          const gestureCode = typeof event === 'object' ? event.gesture : event
          log.info('Gesture event:', gestureCode)

          switch (gestureCode) {
            case GESTURES.RIGHT:
              NavigationManager.navigate('next')
              return true
            case GESTURES.LEFT:
              NavigationManager.navigate('prev')
              return true
            case GESTURES.UP:
              NavigationManager.cycleMode()
              return true
            case GESTURES.CLICK:
              NavigationManager.handleSelection()
              return true
          }

          if (originalOnGesture) return originalOnGesture.call(this, event)
          return false
        }

        return originalPage(pageConfig)
      }

      try {
        globalThis.Page = newPage
        self.initialized = true
        log.info('Page Interceptor successfully installed')
      } catch (e) {
        log.warn('Failed to assign Page property:', e)
      }
    }

    // Global event listener for confirmation
    ScreenReader.on('confirmDisable', () => {
      showDialog({
        title: gettext('Disable ZSR?'),
        content: gettext('Do you want to turn off ZSR? Press OK to stop immediately.'),
        show_cancel: true,
        ok_text: gettext('OK'),
        cancel_text: gettext('Cancel'),
        ok_func: () => {
          ScreenReader.toggleEnabled(true)
        }
      })
    })

    intercept()
  }
}

export default new PageInterceptor()
