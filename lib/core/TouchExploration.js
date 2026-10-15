/**
 * Zepp OS Screen Reader (ZSR) - Touch Exploration Feature Module
 *
 * Implements "Explore by Touch" accessibility behavior.
 * Includes: event-capture overlay, UI element registry, hit-testing
 * algorithm, throttle mechanism, and double-tap activation gesture.
 *
 * It also owns the Touch Exploration SWITCH, like TalkBack's "Explore by touch":
 *   ON  (default): one finger slid over the screen reads what it passes over, one tap
 *                  focuses and reads, double tap activates; ZSR's touch layer catches touches.
 *   OFF:           the touch layer steps aside, touches reach the app's own widgets
 *                  directly, and ZSR is used with swipes, the crown and the keys instead.
 * The switch is the saved setting `exploreMode`.
 *
 * NOTE: This module's standalone element list (zsrUiElements) is separate
 * from NavigationManager's element registry. Prefer NavigationManager for
 * new feature work; this module is kept for cases where a lightweight
 * standalone overlay is needed without the full interceptor stack.
 */

import { createWidget, widget, deleteWidget, event, prop } from '@zos/ui'
import { saveSettings } from './config.js'
import { gettext } from '../utils/i18n.js'
import { guard } from '../utils/safeCall.js'
import { log } from '@zos/utils'

// ─── Configuration constants ──────────────────────────────────────────────────
/** Maximum gap (ms) between two taps to qualify as a double-tap. */
const DOUBLE_TAP_TIMEOUT = 300
/** Minimum interval (ms) between processed MOVE events (throttle). */
const THROTTLE_DELAY = 60

// ─── Module-level state ───────────────────────────────────────────────────────
/** @type {string | null} */
let lastFocusedElementId = null
let lastTapTime = 0
let lastMoveProcessedTime = 0

/**
 * Internal registry of accessible UI elements managed by this module.
 * Each entry: { id, text, x, y, w, h, callback }
 */
const zsrUiElements = []

// ─── Core helper functions ────────────────────────────────────────────────────

/**
 * Speak text through ZSR's screen reader instance if available,
 * otherwise fall back to console logging.
 * @param {string} text - Text to announce.
 */
function zsrSpeak(text) {
  const sr = globalThis.ScreenReaderInstance
  if (sr && typeof sr.speak === 'function') {
    sr.speak(text, { priority: 'high' })
  } else {
    log.debug(`[ZSR TTS]: ${text}`)
  }
}

/**
 * Register a UI element with the touch exploration overlay.
 * @param {string} id - Unique identifier for the element.
 * @param {string} text - Accessible text announced on touch.
 * @param {number} x - Left edge of the element's bounding box.
 * @param {number} y - Top edge of the element's bounding box.
 * @param {number} w - Width of the element's bounding box.
 * @param {number} h - Height of the element's bounding box.
 * @param {function} [callback] - Action invoked on double-tap activation.
 */
export function registerZsrElement(id, text, x, y, w, h, callback) {
  zsrUiElements.push({ id, text, x, y, w, h, callback })
}

/**
 * Clear all registered elements. Call this on page transitions to prevent
 * stale references and memory leaks.
 */
export function clearZsrElements() {
  zsrUiElements.length = 0
  lastFocusedElementId = null
}

/**
 * Hit-test: find the registered element that contains the given screen point.
 * @param {number} touchX - X coordinate of the touch event.
 * @param {number} touchY - Y coordinate of the touch event.
 * @returns {{ id: string, text: string, x: number, y: number, w: number, h: number, callback?: function } | undefined} Matching element or undefined.
 */
function findElementAtCoords(touchX, touchY) {
  return zsrUiElements.find(
    (el) => touchX >= el.x && touchX <= el.x + el.w && touchY >= el.y && touchY <= el.y + el.h
  )
}

// ─── Accessibility overlay ────────────────────────────────────────────────────
/** Reference to the transparent touch-capture overlay widget. */
/** @type {ZSRWidget | null} */
let touchOverlayWidget = null

/**
 * Initialize the touch exploration overlay for the current screen.
 * Creates a transparent full-screen widget on top of all content to
 * intercept touch events before they reach underlying widgets.
 *
 * @param {number} [screenWidth=480] - Screen width in px.
 * @param {number} [screenHeight=480] - Screen height in px.
 */
export function initTouchExploration(screenWidth = 480, screenHeight = 480) {
  if (!isTouchExplorationEnabled()) return
  // Create a transparent full-screen overlay to capture all touch events.
  // widget.FILL_RECT with alpha=0 captures events without visual effect.
  // @ts-expect-error alpha / z_index are valid widget options that @zeppos/device-types 4.0.0 does not declare
  touchOverlayWidget = createWidget(widget.FILL_RECT, {
    x: 0,
    y: 0,
    w: screenWidth,
    h: screenHeight,
    color: 0x000000,
    alpha: 0,
    z_index: 9990,
    radius: 0,
    angle: 0
  })

  if (!touchOverlayWidget) return

  // A. Handle MOVE events — implements "explore by touch" (finger drag).
  touchOverlayWidget.addEventListener(
    event.MOVE,
    guard((ev) => {
      const now = Date.now()
      // Throttle: skip events that arrive faster than THROTTLE_DELAY to
      // conserve CPU and battery on constrained smartwatch hardware.
      if (now - lastMoveProcessedTime < THROTTLE_DELAY) return
      lastMoveProcessedTime = now

      const hovered = findElementAtCoords(ev.x, ev.y)
      if (hovered) {
        // Only announce when moving to a different element.
        if (hovered.id !== lastFocusedElementId) {
          lastFocusedElementId = hovered.id
          zsrSpeak(hovered.text)
        }
      } else {
        lastFocusedElementId = null
      }
    }, 'event')
  )

  // B. Handle CLICK events — implements "double-tap to activate".
  touchOverlayWidget.addEventListener(
    event.CLICK_UP,
    guard((ev) => {
      const now = Date.now()
      const clicked = findElementAtCoords(ev.x, ev.y)
      if (!clicked) return

      if (clicked.id === lastFocusedElementId) {
        if (now - lastTapTime < DOUBLE_TAP_TIMEOUT) {
          // Second tap within timeout → activate the element.
          zsrSpeak(`Activating ${clicked.text}`)
          if (typeof clicked.callback === 'function') {
            clicked.callback()
          }
          lastTapTime = 0 // Reset so the next tap starts a fresh sequence.
        } else {
          lastTapTime = now // Record first tap timestamp.
        }
      } else {
        // Direct tap on an unannounced element — focus it and prepare for
        // a potential second tap to activate.
        lastFocusedElementId = clicked.id
        zsrSpeak(clicked.text)
        lastTapTime = now
      }
    }, 'event')
  )
}

/**
 * Destroy the touch exploration overlay and release all registered elements.
 * Must be called on page destroy to prevent widget and memory leaks.
 */
export function destroyTouchExploration() {
  if (touchOverlayWidget) {
    // require() doesn't exist in the Zepp OS device runtime (it's ES
    // modules only) - a require() call here would always throw and be
    // silently swallowed by the catch below, meaning deleteWidget() never
    // actually ran and the widget leaked every time this was called.
    // deleteWidget is imported statically above instead.
    try {
      if (typeof deleteWidget === 'function') deleteWidget(touchOverlayWidget)
    } catch (_e) {
      // deleteWidget may not be available on all firmware versions; no-op.
    }
    touchOverlayWidget = null
  }
  clearZsrElements()
}

// ─── Touch exploration switch ─────────────────────────────────────────────────

/** @returns {boolean} true while touch exploration is on (the default) */
export function isTouchExplorationEnabled() {
  const config = globalThis.ScreenReaderConfig || {}
  return config.exploreMode !== false
}

/**
 * Turn touch exploration on or off, save it, and apply it to the touch layers of the page that
 * is showing.
 * @param {boolean} enabled
 * @param {boolean} [announce] speak the new state
 * @returns {boolean} the new state
 */
export function setTouchExploration(enabled, announce = false) {
  const config = globalThis.ScreenReaderConfig || (globalThis.ScreenReaderConfig = {})
  config.exploreMode = !!enabled
  try {
    saveSettings(config)
  } catch (e) {
    log.warn('Touch exploration setting could not be saved: ' + String(e))
  }

  const ui = globalThis.ScreenReaderUIInstance
  if (ui && typeof ui.applyTouchExploration === 'function') ui.applyTouchExploration()
  if (touchOverlayWidget) {
    try {
      touchOverlayWidget.setProperty(prop.VISIBLE, !!enabled)
    } catch (e) {
      log.warn('Touch overlay could not be switched: ' + String(e))
    }
  }

  if (announce) {
    zsrSpeak(enabled ? gettext('Touch exploration on') : gettext('Touch exploration off'))
  }
  return config.exploreMode
}

/**
 * @param {boolean} [announce] speak the new state
 * @returns {boolean} the new state
 */
export function toggleTouchExploration(announce = true) {
  return setTouchExploration(!isTouchExplorationEnabled(), announce)
}
