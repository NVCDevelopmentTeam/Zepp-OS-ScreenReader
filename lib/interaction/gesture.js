import {
  onGesture,
  offGesture,
  GESTURE_UP,
  GESTURE_DOWN,
  GESTURE_LEFT,
  GESTURE_RIGHT
} from '@zos/interaction'
import { log } from '@zos/utils'
import { gettext, format } from '../utils/i18n.js'
import { back, push } from '@zos/router'
import EventManager from '../core/eventManager.js'
import ShortcutHandler from './shortcut.js'

export const GESTURES = {
  UP: 1,
  DOWN: 2,
  LEFT: 3,
  RIGHT: 4,
  CLICK: 5,
  DOUBLE_CLICK: 6,
  LONG_PRESS: 7,
  TWO_FINGER_TAP: 10,
  THREE_FINGER_TAP: 11,
  TWO_FINGER_SWIPE_UP: 20,
  TWO_FINGER_SWIPE_DOWN: 21,
  TWO_FINGER_SWIPE_LEFT: 22,
  TWO_FINGER_SWIPE_RIGHT: 23,
  THREE_FINGER_SWIPE_UP: 30,
  THREE_FINGER_SWIPE_DOWN: 31,
  THREE_FINGER_SWIPE_LEFT: 32,
  THREE_FINGER_SWIPE_RIGHT: 33
}

// Friendly names for "Gesture Practice Mode" (toggled from
// page/userGuide/userGuide.js), spoken instead of performing the real
// action so a new user can safely learn what each gesture feels like.
const GESTURE_NAMES = {
  [GESTURES.UP]: 'Swipe up',
  [GESTURES.DOWN]: 'Swipe down',
  [GESTURES.LEFT]: 'Swipe left',
  [GESTURES.RIGHT]: 'Swipe right',
  [GESTURES.CLICK]: 'Single tap',
  [GESTURES.DOUBLE_CLICK]: 'Double tap',
  [GESTURES.LONG_PRESS]: 'Long press',
  [GESTURES.TWO_FINGER_TAP]: 'Two-finger tap',
  [GESTURES.THREE_FINGER_TAP]: 'Three-finger tap',
  [GESTURES.TWO_FINGER_SWIPE_UP]: 'Two-finger swipe up',
  [GESTURES.TWO_FINGER_SWIPE_DOWN]: 'Two-finger swipe down',
  [GESTURES.TWO_FINGER_SWIPE_LEFT]: 'Two-finger swipe left',
  [GESTURES.TWO_FINGER_SWIPE_RIGHT]: 'Two-finger swipe right',
  [GESTURES.THREE_FINGER_SWIPE_UP]: 'Three-finger swipe up',
  [GESTURES.THREE_FINGER_SWIPE_DOWN]: 'Three-finger swipe down',
  [GESTURES.THREE_FINGER_SWIPE_LEFT]: 'Three-finger swipe left',
  [GESTURES.THREE_FINGER_SWIPE_RIGHT]: 'Three-finger swipe right'
}

const DEFAULT_MAPPINGS = {
  [GESTURES.RIGHT]: 'next',
  [GESTURES.LEFT]: 'previous',
  [GESTURES.UP]: 'cycle_mode_prev',
  [GESTURES.DOWN]: 'cycle_mode_next',
  [GESTURES.CLICK]: 'read_current',
  [GESTURES.DOUBLE_CLICK]: 'select',
  [GESTURES.LONG_PRESS]: 'context_menu',
  [GESTURES.TWO_FINGER_TAP]: 'toggle_mute',
  [GESTURES.THREE_FINGER_TAP]: 'read_status_bar',
  [GESTURES.TWO_FINGER_SWIPE_UP]: 'scroll_up',
  [GESTURES.TWO_FINGER_SWIPE_DOWN]: 'scroll_down',
  [GESTURES.TWO_FINGER_SWIPE_LEFT]: 'previous_page',
  [GESTURES.TWO_FINGER_SWIPE_RIGHT]: 'next_page',
  [GESTURES.THREE_FINGER_SWIPE_UP]: 'read_current',
  [GESTURES.THREE_FINGER_SWIPE_DOWN]: 'read_all',
  [GESTURES.THREE_FINGER_SWIPE_LEFT]: 'spell_out',
  [GESTURES.THREE_FINGER_SWIPE_RIGHT]: 'toggle_screen_curtain'
}

export class GestureHandler {
  constructor() {
    this.mappings = { ...DEFAULT_MAPPINGS }
    this.lastSwipeCode = 0
    this.lastSwipeTime = 0
  }

  init() {
    const config = globalThis.ScreenReaderConfig || {}
    // Load custom mappings from config
    Object.keys(GESTURES).forEach((key) => {
      const configKey = `gesture_${key.toLowerCase()}`
      if (config[configKey]) {
        this.mappings[GESTURES[key]] = config[configKey]
      }
    })

    // "Invert Swipe Gestures" (settingsKey 'invertSwipeGestures', Jieshuo style):
    // swaps vertical and horizontal directional swipe actions so up/down navigates
    // items and left/right cycles reading mode, or vice versa.
    if (config.invertSwipeGestures) {
      const up = this.mappings[GESTURES.UP]
      const down = this.mappings[GESTURES.DOWN]
      const left = this.mappings[GESTURES.LEFT]
      const right = this.mappings[GESTURES.RIGHT]

      this.mappings[GESTURES.UP] = left
      this.mappings[GESTURES.DOWN] = right
      this.mappings[GESTURES.LEFT] = up
      this.mappings[GESTURES.RIGHT] = down
    }

    this.bindSystemGestures()

    globalThis.GestureHandlerInstance = this
    log.info('GestureHandler initialized')
  }

  /**
   * (Re)register the system-level directional swipe listener.
   *
   * @zos/interaction allows ONE onGesture listener; registering again would
   * make the later one fail, so we always offGesture() first. Called from
   * init() and again from every ZSRPage.onInit(), so the listener is present
   * on whichever page is showing regardless of how the firmware scopes it.
   */
  bindSystemGestures() {
    try {
      try {
        offGesture()
      } catch (_e) {
        /* nothing registered yet */
      }
      onGesture({
        callback: (event) => {
          // While the touch layer is active it already turns swipes into
          // gestures; we only consume the system swipe here so it does not
          // also navigate away (back / notification shade).
          /** @type {number | null} */
          let code = null
          if (event === GESTURE_UP) code = GESTURES.UP
          else if (event === GESTURE_DOWN) code = GESTURES.DOWN
          else if (event === GESTURE_LEFT) code = GESTURES.LEFT
          else if (event === GESTURE_RIGHT) code = GESTURES.RIGHT
          if (code === null) return false

          const sr = globalThis.ScreenReaderInstance
          if (!sr || !sr.enabled) return false // ZSR off: normal system behaviour
          this.handleGesture(code)
          return true
        }
      })
    } catch (/** @type {any} */ error) {
      log.warn('Gesture events not available or failed to initialize:', error)
    }
  }

  async handleGesture(gestureCode) {
    const actionKey = this.mappings[gestureCode]
    if (!actionKey) return

    // The touch layer and the system onGesture() can both report the same
    // physical swipe; ignore an identical swipe within 250 ms.
    const now = Date.now()
    if (gestureCode <= GESTURES.RIGHT) {
      if (gestureCode === this.lastSwipeCode && now - this.lastSwipeTime < 250) return
      this.lastSwipeCode = gestureCode
      this.lastSwipeTime = now
    }

    // Gesture Practice Mode (toggled from the User Guide page): announce
    // what was detected instead of performing the real action, so new
    // users can safely learn gestures - including toggleZSR and
    // context-menu-opening gestures, which would otherwise be disruptive
    // to practice normally.
    if (globalThis.ScreenReaderConfig?.gesturePracticeMode) {
      const name = GESTURE_NAMES[gestureCode] || `Gesture ${gestureCode}`
      globalThis.ScreenReaderInstance?.speak(format(gettext('Detected: {0}'), name), {
        priority: 'high',
        force: true
      })
      return
    }

    // The screen-reader-enabled gate below must not apply to the one
    // action that turns ZSR back ON - otherwise a user who disables ZSR
    // via gesture has no gesture-based way to re-enable it (gestures
    // would be silently dropped by the very check meant to silence them
    // while off), trapping them until they get sighted help or navigate
    // the phone Settings app by memory.
    if (actionKey === 'toggleZSR') {
      globalThis.ScreenReaderInstance?.toggleEnabled()
      return
    }

    // "Tap once to pause or resume" while a long announcement is playing:
    // Single Tap normally means "select/activate", but while ZSR is
    // actively speaking, the same tap pauses instead - matching what the
    // user is likely trying to do (stop the current speech) rather than
    // accidentally activating whatever element happens to be focused.
    if (gestureCode === GESTURES.CLICK && globalThis.ScreenReaderInstance?.speaking) {
      globalThis.ScreenReaderInstance.pauseResume()
      return
    }

    if (!globalThis.ScreenReaderInstance?.enabled) return

    // "Debug Logging" (settingsKey 'debugLogging', DeveloperSettings.js) -
    // @zos/utils's log module has no documented level-filtering API, so
    // this gates our own noisy diagnostic logging directly rather than
    // pretending a log.setLevel()-style call exists.
    if (globalThis.ScreenReaderConfig?.debugLogging) {
      log.debug(`Gesture received: ${gestureCode}, action: ${actionKey}`)
    }

    try {
      EventManager.emit('gesture', actionKey)

      switch (actionKey) {
        case 'next':
          if (globalThis.NavigationManagerInstance) {
            await globalThis.NavigationManagerInstance.navigate('next')
          }
          break
        case 'previous':
          if (globalThis.NavigationManagerInstance) {
            await globalThis.NavigationManagerInstance.navigate('prev')
          }
          break
        case 'select':
          if (globalThis.NavigationManagerInstance) {
            globalThis.NavigationManagerInstance.handleSelection()
          }
          break
        case 'cycle_mode_next':
          if (globalThis.NavigationManagerInstance) {
            globalThis.NavigationManagerInstance.cycleMode('next')
          }
          break
        case 'cycle_mode_prev':
          if (globalThis.NavigationManagerInstance) {
            globalThis.NavigationManagerInstance.cycleMode('prev')
          }
          break
        case 'read_current':
          if (globalThis.NavigationManagerInstance) {
            await globalThis.NavigationManagerInstance.readCurrent()
          }
          break
        // 'read_screen' is the value older builds stored; keep it working.
        case 'read_screen':
        case 'read_all':
          if (globalThis.ScreenReaderInstance) {
            const allText = globalThis.NavigationManagerInstance?.elements
              .map((el) =>
                globalThis.NavigationManagerInstance.getElementText(el.element, el.type, el.options)
              )
              .join('. ')
            await globalThis.ScreenReaderInstance.speak(allText, { priority: 'high' })
          }
          break
        case 'toggle_screen_curtain':
          if (globalThis.ScreenReaderInstance && globalThis.ScreenReaderUIInstance) {
            const on = globalThis.ScreenReaderUIInstance.toggleCurtain()
            await globalThis.ScreenReaderInstance.speak(
              on ? gettext('Screen curtain enabled') : gettext('Screen curtain disabled'),
              { priority: 'high', force: true }
            )
          }
          break
        case 'context_menu':
          globalThis.ContextMenuInstance?.show()
          break
        case 'toggle_mute':
          globalThis.ScreenReaderInstance?.toggleMute()
          break
        case 'read_status_bar':
          globalThis.ContextMenuInstance?.readStatusBar()
          break
        case 'read_center':
          if (globalThis.NavigationManagerInstance) {
            await globalThis.NavigationManagerInstance.readCenterElement()
          }
          break
        case 'review_next':
          globalThis.NavigationManagerInstance?.moveReviewCursor('next')
          break
        case 'review_prev':
          globalThis.NavigationManagerInstance?.moveReviewCursor('prev')
          break
        case 'review_speak':
          globalThis.NavigationManagerInstance?.readReviewCursor()
          break
        case 'go_to_first':
          globalThis.NavigationManagerInstance?.navigateToEdge('first')
          break
        case 'go_to_last':
          globalThis.NavigationManagerInstance?.navigateToEdge('last')
          break
        case 'spell_out':
          if (globalThis.NavigationManagerInstance) {
            await globalThis.NavigationManagerInstance.spellOut()
          }
          break
        case 'previous_page':
          try {
            back()
          } catch (e) {
            log.warn('router.back failed:', e)
          }
          break
        case 'next_page':
          try {
            // Zepp OS router has no generic "forward"; if a target page was
            // registered via config, push it; otherwise announce that we
            // can't move forward so the user gets feedback.
            const target = globalThis.ScreenReaderConfig?.nextPageUrl
            if (target) {
              push({ url: target })
            } else if (globalThis.ScreenReaderInstance) {
              await globalThis.ScreenReaderInstance.speak(gettext('No next page available'), {
                priority: 'high'
              })
            }
          } catch (e) {
            log.warn('router.push failed:', e)
          }
          break
        case 'scroll_up':
        case 'scroll_down': {
          // Navigation-by-element is the accessible analogue of scrolling
          // on a touch-centric UI: jump focus one interactive element in
          // the chosen direction so TTS keeps narrating consistently.
          const nav = globalThis.NavigationManagerInstance
          if (nav) {
            await nav.navigate(actionKey === 'scroll_up' ? 'prev' : 'next')
          }
          break
        }
        default:
          // Try to execute as a general shortcut if it matches
          await ShortcutHandler.execute(actionKey)
      }
    } catch (error) {
      log.error('Gesture action execution failed:', error)
    }
  }
}

// Shared across separately bundled pages: reuse the instance that already exists.
const instance = globalThis.GestureHandlerInstance || new GestureHandler()
export default instance
