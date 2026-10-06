import NavigationManager from './navigationManager.js'
import ScreenReader from './screenReader.js'
import ScreenReaderUI from '../components/screenReaderUI.js'
import { GESTURES } from '../interaction/gesture.js'
import ShortcutHandler from '../interaction/shortcut.js'
import { log } from '@zos/utils'
import { createModal, MODAL_CONFIRM } from '@zos/interaction'
import { gettext } from '../utils/i18n.js'

/**
 * Page Interceptor to handle page lifecycle and automatic announcements.
 *
 * Two cooperating mechanisms exist:
 *  - lib/core/zsrPage.js (`ZSRPage`): explicit, deterministic wrapper that every
 *    ZSR page uses. It marks its config with `__zsrWrapped`.
 *  - this interceptor: best-effort wrapper of the global `Page` constructor for
 *    any page that did NOT go through ZSRPage. It skips configs already
 *    wrapped, so a page is never initialised twice.
 */
class PageInterceptor {
  constructor() {
    this.initialized = false
  }

  init() {
    if (this.initialized) return
    log.info('Initializing Page Interceptor')

    const self = this
    const MAX_INTERCEPT_ATTEMPTS = 50 // ~5s at 100ms interval
    let attempts = 0

    // Lazy interception or immediate if already present
    const intercept = () => {
      const originalPage = typeof Page !== 'undefined' ? Page : null

      if (!originalPage) {
        attempts++
        if (attempts >= MAX_INTERCEPT_ATTEMPTS) {
          log.error('Page global not found after max attempts; giving up')
          return
        }
        log.warn('Page global still not found, waiting...')
        setTimeout(intercept, 100)
        return
      }

      const newPage = function (pageConfig) {
        // Already handled by ZSRPage: do not wrap a second time.
        if (pageConfig.__zsrWrapped) return originalPage(pageConfig)

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
          /** @type {any} */
          let root = null
          try {
            root = originalBuild ? originalBuild.call(this) : null
          } catch (/** @type {any} */ e) {
            log.error('Original build failed:', e)
          }

          // The touch layer no longer needs a root group: it is created on
          // top of the finished page (see ScreenReaderUI.attach()).
          try {
            ScreenReaderUI.attach()
          } catch (/** @type {any} */ e) {
            log.error('ScreenReaderUI attach failed:', e)
          }

          return root
        }

        pageConfig.onDestroy = function () {
          log.info('Page onDestroy intercepted')
          ScreenReaderUI.detach()
          NavigationManager.clearElements()
          if (originalOnDestroy) return originalOnDestroy.call(this)
        }

        // Key handling (kept for firmware that forwards keys to the page;
        // real hardware keys are bound through @zos/interaction onKey in
        // lib/interaction/shortcut.js)
        const originalOnKey = pageConfig.onKey
        pageConfig.onKey = function (event) {
          const keyCode = typeof event === 'object' ? event.code : event
          const keyType = typeof event === 'object' ? event.type : 0 // 0: short, 1: long

          log.info(`Key event: code=${keyCode}, type=${keyType}`)

          // UP button long press toggles ZSR
          if (keyCode === 1 && keyType === 1) {
            ShortcutHandler.execute('toggleZSR')
            return true
          }

          // DOWN button long press toggles mute
          if (keyCode === 2 && keyType === 1) {
            ShortcutHandler.execute('toggleMute')
            return true
          }

          if (originalOnKey) return originalOnKey.call(this, event)
          return false
        }

        // Gesture support
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

    // Global event listener for the "confirm before turning ZSR off" dialog.
    // The old DIALOG widget / showDialog is discontinued; createModal is the
    // official replacement (API_LEVEL 2.0+).
    ScreenReader.on('confirmDisable', () => {
      const title = gettext('Disable ZSR?')
      const content = gettext('Do you want to turn off ZSR? Press OK to stop immediately.')
      try {
        ScreenReader.speak(`${title} ${content}`, { priority: 'high', force: true })
        createModal({
          title,
          content,
          autoHide: false,
          onClick: (keyObj) => {
            if (keyObj && keyObj.type === MODAL_CONFIRM) {
              ScreenReader.toggleEnabled(true)
            }
          }
        })
      } catch (e) {
        // If the dialog cannot be shown, never trap the user in either state.
        log.warn('confirmDisable dialog failed: ' + (e && e.message))
        ScreenReader.toggleEnabled(true)
      }
    })

    intercept()
    this.initialized = true
  }
}

export default new PageInterceptor()
