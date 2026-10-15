import ScreenReader from './screenReader.js'
import NavigationManager from './navigationManager.js'
import { log } from '@zos/utils'
import { isFocusable as isFocusableWidget } from './zsrWidgets.js'
import { setParent } from './widgetParents.js'
import { format, gettext } from '../utils/i18n.js'
import { safeTimeout } from '../utils/safeCall.js'
/**
 * Widget Interceptor to automatically register focusable elements
 */
class WidgetInterceptor {
  constructor() {
    this.originalCreateWidget = null
    this.initialized = false
  }

  init() {
    if (this.initialized) return
    log.info('Initializing Widget Interceptor')

    const g = globalThis
    const self = this
    // `createWidget` is a module export on Zepp OS 2.0+, not a global, so there is
    // usually nothing to patch here. ZSR's own pages register through zsrWidgets.js,
    // which does not depend on this. A few short retries cover a late global; after
    // that the interceptor stays idle (not an error).
    const MAX_INTERCEPT_ATTEMPTS = 5
    const RETRY_MS = 200
    let attempts = 0

    const intercept = () => {
      const interceptTarget = (obj, name) => {
        if (!obj || typeof obj[name] !== 'function') return false
        const original = obj[name]

        obj[name] = function (type, options) {
          // 'this' is the group when called as group.createWidget
          const parent = this !== obj && this !== g ? this : null
          const widgetInstance = original.apply(this, arguments)

          if (widgetInstance && self.isFocusable(type, options)) {
            NavigationManager.registerElement(widgetInstance, type, options, parent)
          }

          const w = globalThis.widget || {}
          if (
            widgetInstance &&
            w.GROUP !== undefined &&
            type === w.GROUP &&
            typeof widgetInstance.createWidget === 'function'
          ) {
            setParent(widgetInstance, parent)
            self.interceptGroup(widgetInstance)
          }

          return widgetInstance
        }
        return true
      }

      let found = false
      ;[g, g.hmUI, g.ui].forEach((target) => {
        try {
          if (interceptTarget(target, 'createWidget')) found = true
        } catch (e) {
          log.debug(`createWidget could not be patched on one target: ${e.message}`)
        }
      })

      if (!found) {
        attempts++
        if (attempts < MAX_INTERCEPT_ATTEMPTS) {
          safeTimeout(intercept, RETRY_MS)
        } else {
          log.debug('No global createWidget to intercept; pages register through zsrWidgets')
          self.initialized = true
        }
        return
      }

      ;[g, g.hmUI].forEach((target) => {
        if (target && typeof target.showToast === 'function') {
          const original = target.showToast
          target.showToast = function (options) {
            const text = typeof options === 'string' ? options : (options && options.content) || ''
            ScreenReader.speak(format(gettext('Toast: {0}'), text), { priority: 'high' })
            return original.call(this, options)
          }
        }
      })

      self.initialized = true
      log.info('Widget Interceptor successfully installed')
    }

    intercept()
  }

  interceptGroup(group) {
    const self = this
    const originalGroupCreate = group.createWidget

    group.createWidget = function (type, options) {
      const widgetInstance = originalGroupCreate.apply(this, arguments)

      if (widgetInstance && self.isFocusable(type, options)) {
        NavigationManager.registerElement(widgetInstance, type, options, group)
      }

      const w = globalThis.widget || {}
      if (
        widgetInstance &&
        w.GROUP !== undefined &&
        type === w.GROUP &&
        typeof widgetInstance.createWidget === 'function'
      ) {
        setParent(widgetInstance, group)
        self.interceptGroup(widgetInstance)
      }

      return widgetInstance
    }
  }

  /**
   * @param {number} type widget type
   * @param {any} [options] widget options (text widgets without text are skipped)
   */
  isFocusable(type, options) {
    return isFocusableWidget(type, options)
  }
}

export default new WidgetInterceptor()
