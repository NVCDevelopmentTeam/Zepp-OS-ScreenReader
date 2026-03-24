import NavigationManager from '../core/navigationManager.js'
import { log } from '@zos/utils'
import { event, widget } from '@zos/ui'
import { getDeviceInfo } from '@zos/device'
import { GESTURES } from '../interaction/gesture.js'

export class ScreenReaderUI {
  constructor() {
    this.rootGroup = null
    this.interactionLayer = null
    this.focusRect = null
    this.enabled = false
    this.touches = new Map()
    this.lastExploredIndex = -1
    this.lastClickTime = 0
    this.gestureStartTime = 0
  }

  getContextMenu() {
    return globalThis.ContextMenuInstance
  }

  async init(rootGroup) {
    try {
      this.rootGroup = rootGroup
      const { width, height } = getDeviceInfo()

      if (this.rootGroup) {
        // Interaction layer - transparent but covers everything to capture touch
        this.interactionLayer = this.rootGroup.createWidget(widget.FILL_RECT, {
          x: 0,
          y: 0,
          w: width,
          h: height,
          color: 0x000000,
          alpha: 0,
          z_index: 9999
        })

        this.createFocusRect()
        this.setupGestures()

        // Initial state sync
        const isEnabled = globalThis.ScreenReaderInstance?.enabled
        this.setEnabled(!!isEnabled)
      }
      log.info('ScreenReaderUI initialized')

      // Listen for enabled changes
      globalThis.ScreenReaderInstance?.on('enabledChange', (enabled) => {
        this.setEnabled(enabled)
      })
    } catch (error) {
      log.error('ScreenReaderUI init failed:', error)
    }
  }

  setEnabled(enabled) {
    this.enabled = enabled
    if (this.interactionLayer) {
      this.interactionLayer.setProperty(widget.prop.VISIBLE, enabled)
    }
    if (this.focusRect) {
      this.focusRect.setProperty(widget.prop.VISIBLE, enabled)
    }
  }

  createFocusRect() {
    const { width, height } = getDeviceInfo()
    try {
      this.focusRect = this.rootGroup.createWidget(widget.RECT, {
        x: 0,
        y: 0,
        w: width,
        h: height,
        color: 0x00ff00,
        line_width: 4,
        style: widget.prop.STYLE_STROKE,
        z_index: 9998,
        visible: false
      })
    } catch (error) {
      log.error('Failed to create focus rect:', error)
      // Fallback for older SDKs
      this.focusRect = this.rootGroup.createWidget(widget.RECT, {
        x: 0,
        y: 0,
        w: width,
        h: height,
        color: 0x00ff00,
        alpha: 100,
        z_index: 9998,
        visible: false
      })
    }
  }

  updateFocusRect(bounds) {
    if (!this.focusRect) return
    try {
      this.focusRect.setProperty(widget.prop.MORE, {
        x: bounds.x - 2,
        y: bounds.y - 2,
        w: bounds.w + 4,
        h: bounds.h + 4,
        visible: true
      })
    } catch (_e) {
      this.focusRect.setProperty(widget.prop.X, bounds.x - 2)
      this.focusRect.setProperty(widget.prop.Y, bounds.y - 2)
      this.focusRect.setProperty(widget.prop.W, bounds.w + 4)
      this.focusRect.setProperty(widget.prop.H, bounds.h + 4)
      this.focusRect.setProperty(widget.prop.VISIBLE, true)
    }
  }

  setupGestures() {
    this.interactionLayer.addEventListener(event.MOVE, (info) => {
      if (!this.enabled) return

      const touch = this.touches.get(info.touch_id || 0)
      if (touch) {
        touch.x = info.x
        touch.y = info.y
      }

      // Explore by touch (1 finger)
      if (this.touches.size === 1 && globalThis.ScreenReaderConfig?.exploreMode) {
        const index = NavigationManager.findElementAt(info.x, info.y)
        if (index !== -1 && index !== this.lastExploredIndex) {
          this.lastExploredIndex = index
          NavigationManager.focusElement(index)
        }
      }
    })

    this.interactionLayer.addEventListener(event.CLICK_UP, (info) => {
      if (!this.enabled) return

      const touchCount = this.touches.size
      const now = Date.now()
      const duration = now - this.gestureStartTime
      const startTouch = this.touches.get(info.touch_id || 0)

      let deltaX = 0
      let deltaY = 0
      if (startTouch) {
        deltaX = info.x - startTouch.startX
        deltaY = info.y - startTouch.startY
      }

      this.touches.delete(info.touch_id || 0)

      const isTap = duration < 300 && Math.abs(deltaX) < 30 && Math.abs(deltaY) < 30
      const isSwipe = duration > 100 && (Math.abs(deltaX) > 50 || Math.abs(deltaY) > 50)

      if (isTap) {
        if (touchCount === 1) {
          // Double tap detection
          if (now - this.lastClickTime < 300) {
            log.info('1-finger double tap')
            globalThis.GestureHandlerInstance?.handleGesture(GESTURES.DOUBLE_CLICK)
            this.lastClickTime = 0
          } else {
            this.lastClickTime = now
            log.info('1-finger single tap')
            globalThis.GestureHandlerInstance?.handleGesture(GESTURES.CLICK)
          }
        } else if (touchCount === 2) {
          log.info('2-finger tap')
          globalThis.GestureHandlerInstance?.handleGesture(GESTURES.TWO_FINGER_TAP)
        } else if (touchCount === 3) {
          log.info('3-finger tap')
          globalThis.GestureHandlerInstance?.handleGesture(GESTURES.THREE_FINGER_TAP)
        }
      } else if (isSwipe) {
        const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY)
        if (touchCount === 1) {
          if (isHorizontal) {
            globalThis.GestureHandlerInstance?.handleGesture(
              deltaX > 0 ? GESTURES.RIGHT : GESTURES.LEFT
            )
          } else {
            globalThis.GestureHandlerInstance?.handleGesture(
              deltaY > 0 ? GESTURES.DOWN : GESTURES.UP
            )
          }
        } else if (touchCount === 2) {
          if (isHorizontal) {
            globalThis.GestureHandlerInstance?.handleGesture(
              deltaX > 0 ? GESTURES.TWO_FINGER_SWIPE_RIGHT : GESTURES.TWO_FINGER_SWIPE_LEFT
            )
          } else {
            globalThis.GestureHandlerInstance?.handleGesture(
              deltaY > 0 ? GESTURES.TWO_FINGER_SWIPE_DOWN : GESTURES.TWO_FINGER_SWIPE_UP
            )
          }
        } else if (touchCount === 3) {
          if (isHorizontal) {
            globalThis.GestureHandlerInstance?.handleGesture(
              deltaX > 0 ? GESTURES.THREE_FINGER_SWIPE_RIGHT : GESTURES.THREE_FINGER_SWIPE_LEFT
            )
          } else {
            globalThis.GestureHandlerInstance?.handleGesture(
              deltaY > 0 ? GESTURES.THREE_FINGER_SWIPE_DOWN : GESTURES.THREE_FINGER_SWIPE_UP
            )
          }
        }
      }

      if (this.touches.size === 0) {
        this.lastExploredIndex = -1
      }
    })

    this.interactionLayer.addEventListener(event.CLICK_DOWN, (info) => {
      if (!this.enabled) return

      const now = Date.now()
      this.touches.set(info.touch_id || 0, {
        x: info.x,
        y: info.y,
        startX: info.x,
        startY: info.y,
        time: now
      })

      if (this.touches.size === 1) {
        this.gestureStartTime = now
      }
    })

    // Listen for events from NavigationManager to update highlight
    NavigationManager.onFocusChange = (index) => {
      const elementInfo = NavigationManager.elements[index]
      if (elementInfo) {
        const bounds = NavigationManager.getAbsoluteBounds(elementInfo)
        this.updateFocusRect(bounds)
      }
    }
  }

  async handleNavigation(direction) {
    try {
      const ContextMenu = this.getContextMenu()
      if (!this.enabled || (ContextMenu && ContextMenu.visible)) return false
      return await NavigationManager.navigate(direction)
    } catch (error) {
      log.error('Navigation failed:', error)
      return false
    }
  }

  async handleSelection() {
    const ContextMenu = this.getContextMenu()
    if (ContextMenu && ContextMenu.visible) return
    log.info('Selection triggered')
    NavigationManager.handleSelection()
  }

  getNavigableElements() {
    return NavigationManager.elements
  }

  getRootGroup() {
    return this.rootGroup
  }
}

const instance = new ScreenReaderUI()
globalThis.ScreenReaderUIInstance = instance
export default instance
