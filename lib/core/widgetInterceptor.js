import ScreenReader from './screenReader.js'
import NavigationManager from './navigationManager.js'
import { log } from '@zos/utils'

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

    const intercept = () => {
      // Intercept both global and hmUI versions
      const interceptTarget = (obj, name) => {
        if (!obj || !obj[name]) return false
        const original = obj[name]

        obj[name] = function (type, options) {
          // 'this' might be the group instance if called as group.createWidget
          const parent = this !== obj && this !== g ? this : null
          const widgetInstance = original.apply(this, arguments)

          if (widgetInstance && self.isFocusable(type)) {
            NavigationManager.registerElement(widgetInstance, type, options, parent)
          }

          // Also intercept sub-widget creation for GROUPS
          const w = globalThis.widget || {}
          if (
            widgetInstance &&
            type === (w.GROUP || 0) &&
            typeof widgetInstance.createWidget === 'function'
          ) {
            widgetInstance._parent = parent
            self.interceptGroup(widgetInstance)
          }

          return widgetInstance
        }
        return true
      }

      // Try multiple possible locations
      const targets = [
        { obj: g, name: 'createWidget' },
        { obj: g.hmUI, name: 'createWidget' },
        { obj: g.ui, name: 'createWidget' }
      ]

      let found = false
      targets.forEach((t) => {
        if (interceptTarget(t.obj, t.name)) found = true
      })

      if (!found) {
        log.warn('Could not find createWidget on globalThis, waiting...')
        setTimeout(intercept, 100)
        return
      }

      // Intercept showToast
      const toastTargets = [
        { obj: g, name: 'showToast' },
        { obj: g.hmUI, name: 'showToast' }
      ]

      toastTargets.forEach((t) => {
        if (t.obj && t.obj[t.name]) {
          const original = t.obj[t.name]
          t.obj[t.name] = function (options) {
            const text = typeof options === 'string' ? options : (options && options.content) || ''
            ScreenReader.speak(`Toast: ${text}`, { priority: 'high' })
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

      if (widgetInstance && self.isFocusable(type)) {
        NavigationManager.registerElement(widgetInstance, type, options, group)
      }

      const w = globalThis.widget || {}
      if (
        widgetInstance &&
        type === (w.GROUP || 0) &&
        typeof widgetInstance.createWidget === 'function'
      ) {
        widgetInstance._parent = group
        self.interceptGroup(widgetInstance)
      }

      return widgetInstance
    }
  }

  isFocusable(type) {
    const w = globalThis.widget || {
      TEXT: 1,
      BUTTON: 2,
      IMG: 3,
      SLIDE_SWITCH: 11,
      CHECKBOX_GROUP: 12,
      RADIO_GROUP: 13,
      SLIDER: 14,
      PROGRESS: 15,
      PICKER: 16,
      SCROLL_LIST: 20,
      CYCLE_LIST: 21,
      VIEW_CONTAINER: 30,
      DIALOG: 31
    }

    const focusableTypes = [
      w.TEXT,
      w.BUTTON,
      w.IMG,
      w.SLIDE_SWITCH,
      w.CHECKBOX_GROUP,
      w.RADIO_GROUP,
      w.SLIDER,
      w.PROGRESS,
      w.PICKER,
      w.SCROLL_LIST,
      w.CYCLE_LIST,
      w.VIEW_CONTAINER,
      w.DIALOG
    ]
    return focusableTypes.includes(type)
  }
}

export default new WidgetInterceptor()
