import NavigationManager from '../core/navigationManager.js'
import { log } from '@zos/utils'
import { createWidget, deleteWidget, event, widget, prop } from '@zos/ui'
import { getDeviceInfo } from '@zos/device'
import { GESTURES } from '../interaction/gesture.js'

/**
 * Touch-exploration layer.
 *
 * A fully transparent widget is created LAST on every page (so it is the top
 * widget) and receives all touches while ZSR is enabled:
 *   - drag one finger  -> explore by touch (speaks what is under the finger)
 *   - single tap       -> focus + speak the element under the finger
 *   - double tap       -> activate (default action mapped in gesture.js)
 *   - long press       -> context menu
 *   - swipes           -> mapped actions (next / previous / ...)
 *
 * NOTE (platform): Zepp OS widget touch events carry one pointer only
 * (x, y). Two/three-finger gestures therefore cannot be detected through the
 * widget API; they are mapped when a firmware reports `touch_id`, and are
 * otherwise inert. Every action they trigger is also available via a
 * one-finger gesture or a hardware key, so nothing is unreachable.
 */
export class ScreenReaderUI {
  constructor() {
    /** @type {any} */
    this.interactionLayer = null
    /** @type {any} */
    this.focusRect = null
    /** @type {any} */
    this.curtain = null
    /** @type {any} */
    this.indicator = null
    this.enabled = false
    this.attached = false
    this.listenerBound = false
    this.touches = new Map()
    this.lastExploredIndex = -1
    this.lastClickTime = 0
    this.lastClickX = 0
    this.lastClickY = 0
    this.gestureStartTime = 0
    this.moved = false
    this.metrics = { swipe: 40, tap: 20 }
  }

  getContextMenu() {
    return globalThis.ContextMenuInstance
  }

  /**
   * Create the touch layer on top of the page that just finished building.
   * Safe to call once per page build.
   */
  attach() {
    try {
      const { width, height } = getDeviceInfo()
      const shortSide = Math.min(width, height)
      // Distances scale with the screen so the same physical gesture works
      // on a 320px Bip and a 480px Balance.
      this.metrics = {
        swipe: Math.max(30, Math.round(shortSide * 0.12)),
        tap: Math.max(12, Math.round(shortSide * 0.05))
      }
      this.touches.clear()
      this.lastExploredIndex = -1
      this.lastClickTime = 0

      // Stacking order (bottom -> top): page, curtain (only while switched on),
      // focus indicator, touch layer. The curtain is NOT created otherwise: an
      // opaque full-screen widget that is merely hidden would black out the whole
      // screen if a firmware ignored the visibility flag.
      const curtainOn = !!(
        globalThis.ScreenReaderConfig && globalThis.ScreenReaderConfig.screenCurtain
      )
      this.curtain = curtainOn
        ? createWidget(widget.FILL_RECT, {
            x: 0,
            y: 0,
            w: width,
            h: height,
            color: 0x000000,
            alpha: 255
          })
        : null
      this.createFocusRect(width, height)
      this.createIndicator(width)
      this.interactionLayer = createWidget(widget.FILL_RECT, {
        x: 0,
        y: 0,
        w: width,
        h: height,
        color: 0x000000,
        alpha: 0
      })
      this.setupGestures()
      this.attached = true

      const sr = globalThis.ScreenReaderInstance
      this.setEnabled(!!(sr && sr.enabled))
      if (!this.listenerBound && sr && typeof sr.on === 'function') {
        this.listenerBound = true
        sr.on('enabledChange', (/** @type {boolean} */ enabled) => this.setEnabled(enabled))
      }
      log.info('ScreenReaderUI attached')
    } catch (error) {
      log.error('ScreenReaderUI attach failed:', error)
    }
  }

  /** Backwards-compatible alias (older callers passed a root group). */
  init(_rootGroup) {
    this.attach()
  }

  detach() {
    this.attached = false
    this.interactionLayer = null
    this.focusRect = null
    this.curtain = null
    this.indicator = null
    this.touches.clear()
    NavigationManager.onFocusChange = null
  }

  setEnabled(enabled) {
    this.enabled = !!enabled
    try {
      if (this.interactionLayer) this.interactionLayer.setProperty(prop.VISIBLE, this.enabled)
      if (this.indicator) this.indicator.setProperty(prop.VISIBLE, this.enabled)
      if (this.focusRect && !this.enabled) this.focusRect.setProperty(prop.VISIBLE, false)
    } catch (e) {
      log.warn('setEnabled failed: ' + (e && e.message))
    }
  }

  /**
   * Screen curtain: black overlay for privacy/battery while ZSR keeps
   * speaking. Persisted in ScreenReaderConfig so every new page honours it.
   * @returns {boolean} new state
   */
  toggleCurtain() {
    const cfg = globalThis.ScreenReaderConfig || (globalThis.ScreenReaderConfig = {})
    cfg.screenCurtain = !cfg.screenCurtain
    // Re-create the layers so the touch layer stays on top of a new curtain.
    if (this.attached) this.rebuild()
    return cfg.screenCurtain
  }

  /** Delete this page's ZSR widgets (curtain, focus frame, indicator, touch layer). */
  destroyWidgets() {
    for (const w of [this.curtain, this.focusRect, this.indicator, this.interactionLayer]) {
      if (!w) continue
      try {
        deleteWidget(w)
      } catch (e) {
        log.warn('deleteWidget failed: ' + (e && e.message))
      }
    }
    this.curtain = null
    this.focusRect = null
    this.indicator = null
    this.interactionLayer = null
  }

  rebuild() {
    this.destroyWidgets()
    this.attach()
  }

  /** Small dot while ZSR is active (configurable: 'minimal' | 'off'). */
  createIndicator(width) {
    const cfg = globalThis.ScreenReaderConfig || {}
    if ((cfg.activeIndicator || 'minimal') === 'off') {
      this.indicator = null
      return
    }
    try {
      const color = parseInt(cfg.indicatorColor || 'ffaa00', 16) || 0xffaa00
      const size = Math.max(6, Math.round(width * 0.02))
      this.indicator = createWidget(widget.FILL_RECT, {
        x: Math.round(width / 2 - size / 2),
        y: 2,
        w: size,
        h: size,
        radius: Math.round(size / 2),
        color
      })
    } catch (error) {
      log.warn('Failed to create active indicator:', error)
      this.indicator = null
    }
  }

  createFocusRect(width, height) {
    const cfg = globalThis.ScreenReaderConfig || {}
    const style = cfg.cursorStyle || 'border'
    if (style === 'none') {
      this.focusRect = null
      return
    }
    const isHighlight = style === 'highlight'
    const color = parseInt(cfg.cursorColor || '00ff00', 16) || 0x00ff00
    const base = { x: 0, y: 0, w: width, h: height, color }
    try {
      if (isHighlight || !widget.STROKE_RECT) {
        this.focusRect = createWidget(widget.FILL_RECT, { ...base, alpha: isHighlight ? 90 : 60 })
      } else {
        this.focusRect = createWidget(widget.STROKE_RECT, { ...base, line_width: 4 })
      }
      this.focusRect.setProperty(prop.VISIBLE, false)
    } catch (error) {
      log.error('Failed to create focus rect:', error)
      this.focusRect = null
    }
  }

  updateFocusRect(bounds) {
    if (!this.focusRect || !bounds) return
    try {
      this.focusRect.setProperty(prop.MORE, {
        x: bounds.x - 2,
        y: bounds.y - 2,
        w: bounds.w + 4,
        h: bounds.h + 4
      })
      this.focusRect.setProperty(prop.VISIBLE, this.enabled)
    } catch (_e) {
      try {
        this.focusRect.setProperty(prop.X, bounds.x - 2)
        this.focusRect.setProperty(prop.Y, bounds.y - 2)
        this.focusRect.setProperty(prop.W, bounds.w + 4)
        this.focusRect.setProperty(prop.H, bounds.h + 4)
        this.focusRect.setProperty(prop.VISIBLE, this.enabled)
      } catch (e2) {
        log.warn('updateFocusRect failed: ' + (e2 && e2.message))
      }
    }
  }

  dispatch(gesture) {
    const handler = globalThis.GestureHandlerInstance
    if (handler && typeof handler.handleGesture === 'function') handler.handleGesture(gesture)
  }

  /** Map a finished swipe to a gesture id for 1, 2 or 3 fingers. */
  swipeGesture(count, dx, dy) {
    const horizontal = Math.abs(dx) > Math.abs(dy)
    const table = {
      1: horizontal ? [GESTURES.LEFT, GESTURES.RIGHT] : [GESTURES.UP, GESTURES.DOWN],
      2: horizontal
        ? [GESTURES.TWO_FINGER_SWIPE_LEFT, GESTURES.TWO_FINGER_SWIPE_RIGHT]
        : [GESTURES.TWO_FINGER_SWIPE_UP, GESTURES.TWO_FINGER_SWIPE_DOWN],
      3: horizontal
        ? [GESTURES.THREE_FINGER_SWIPE_LEFT, GESTURES.THREE_FINGER_SWIPE_RIGHT]
        : [GESTURES.THREE_FINGER_SWIPE_UP, GESTURES.THREE_FINGER_SWIPE_DOWN]
    }
    const pair = table[count] || table[1]
    const positive = horizontal ? dx > 0 : dy > 0
    return positive ? pair[1] : pair[0]
  }

  setupGestures() {
    const layer = this.interactionLayer
    if (!layer) return
    const id = (/** @type {any} */ info) => (info && info.touch_id) || 0

    layer.addEventListener(event.CLICK_DOWN, (/** @type {any} */ info) => {
      if (!this.enabled) return
      const now = Date.now()
      this.touches.set(id(info), {
        x: info.x,
        y: info.y,
        startX: info.x,
        startY: info.y,
        time: now
      })
      if (this.touches.size === 1) {
        this.gestureStartTime = now
        this.moved = false
      }
    })

    layer.addEventListener(event.MOVE, (/** @type {any} */ info) => {
      if (!this.enabled) return
      const touch = this.touches.get(id(info))
      if (!touch) return
      touch.x = info.x
      touch.y = info.y
      const far =
        Math.abs(info.x - touch.startX) > this.metrics.tap ||
        Math.abs(info.y - touch.startY) > this.metrics.tap
      if (far) this.moved = true

      // Explore by touch: one slow finger reads what it passes over.
      const cfg = globalThis.ScreenReaderConfig || {}
      if (this.touches.size === 1 && cfg.exploreMode !== false && this.moved) {
        const index = NavigationManager.findElementAt(info.x, info.y)
        if (index !== -1 && index !== this.lastExploredIndex) {
          this.lastExploredIndex = index
          NavigationManager.focusElement(index)
        }
      }
    })

    layer.addEventListener(event.CLICK_UP, (/** @type {any} */ info) => {
      if (!this.enabled) return
      const touchCount = Math.max(1, this.touches.size)
      const now = Date.now()
      const duration = now - this.gestureStartTime
      const start = this.touches.get(id(info))
      const dx = start ? info.x - start.startX : 0
      const dy = start ? info.y - start.startY : 0
      this.touches.delete(id(info))

      const dist = Math.max(Math.abs(dx), Math.abs(dy))
      const isSwipe = dist >= this.metrics.swipe
      const still = dist < this.metrics.tap
      const isLongPress = still && duration >= 500
      const isTap = still && duration < 500

      if (isSwipe) {
        // Fast flicks are valid swipes (no minimum duration).
        this.dispatch(this.swipeGesture(touchCount, dx, dy))
      } else if (isLongPress && touchCount === 1) {
        this.dispatch(GESTURES.LONG_PRESS)
      } else if (isTap) {
        if (touchCount === 2) {
          this.dispatch(GESTURES.TWO_FINGER_TAP)
        } else if (touchCount >= 3) {
          this.dispatch(GESTURES.THREE_FINGER_TAP)
        } else {
          const nearLast =
            Math.abs(info.x - this.lastClickX) <= this.metrics.swipe &&
            Math.abs(info.y - this.lastClickY) <= this.metrics.swipe
          if (this.lastClickTime && now - this.lastClickTime < 350 && nearLast) {
            this.lastClickTime = 0
            this.dispatch(GESTURES.DOUBLE_CLICK)
          } else {
            this.lastClickTime = now
            this.lastClickX = info.x
            this.lastClickY = info.y
            // Like TalkBack: a single tap focuses (and speaks) what is under
            // the finger; if nothing is there, fall back to the mapped action.
            const index = NavigationManager.findElementAt(info.x, info.y)
            if (index !== -1) {
              NavigationManager.focusElement(index)
            } else {
              this.dispatch(GESTURES.CLICK)
            }
          }
        }
      }

      if (this.touches.size === 0) this.lastExploredIndex = -1
    })

    NavigationManager.onFocusChange = (/** @type {number} */ index) => {
      const info = NavigationManager.elements[index]
      if (info) this.updateFocusRect(NavigationManager.getAbsoluteBounds(info))
    }
  }

  async handleNavigation(direction) {
    try {
      const menu = this.getContextMenu()
      if (!this.enabled || (menu && menu.visible)) return false
      return await NavigationManager.navigate(direction)
    } catch (/** @type {any} */ error) {
      log.error('Navigation failed:', error)
      return false
    }
  }

  async handleSelection() {
    const menu = this.getContextMenu()
    if (menu && menu.visible) return
    NavigationManager.handleSelection()
  }

  getNavigableElements() {
    return NavigationManager.elements
  }

  getRootGroup() {
    return null
  }
}

// Shared across separately bundled pages: reuse the instance that already exists.
const instance = globalThis.ScreenReaderUIInstance || new ScreenReaderUI()
globalThis.ScreenReaderUIInstance = instance
export default instance
