import { Gesture } from '@zos/sensor'
import { log } from '@zos/utils'
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

const DEFAULT_MAPPINGS = {
  [GESTURES.RIGHT]: 'next',
  [GESTURES.LEFT]: 'previous',
  [GESTURES.UP]: 'cycle_mode_prev',
  [GESTURES.DOWN]: 'cycle_mode_next',
  [GESTURES.CLICK]: 'select',
  [GESTURES.DOUBLE_CLICK]: 'read_screen',
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
    this.gestureSensor = null
    this.mappings = { ...DEFAULT_MAPPINGS }
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

    try {
      this.gestureSensor = new Gesture()
      if (this.gestureSensor && typeof this.gestureSensor.onGesture === 'function') {
        this.gestureSensor.onGesture((event) => {
          this.handleGesture(typeof event === 'object' ? event.gesture : event)
        })
      }
    } catch (error) {
      log.warn('Gesture sensor not available or failed to initialize:', error)
    }

    globalThis.GestureHandlerInstance = this
    log.info('GestureHandler initialized')
  }

  async handleGesture(gestureCode) {
    if (!globalThis.ScreenReaderInstance?.enabled) return

    const actionKey = this.mappings[gestureCode]
    if (!actionKey) return

    log.debug(`Gesture received: ${gestureCode}, action: ${actionKey}`)

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
          if (globalThis.ScreenReaderInstance) {
            const config = globalThis.ScreenReaderConfig || {}
            config.screenCurtain = !config.screenCurtain
            globalThis.ScreenReaderUIInstance?.setEnabled(!config.screenCurtain)
            await globalThis.ScreenReaderInstance.speak(
              `Screen curtain ${config.screenCurtain ? 'enabled' : 'disabled'}`,
              { priority: 'high' }
            )
          }
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
              await globalThis.ScreenReaderInstance.speak('No next page available', {
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

const instance = new GestureHandler()
export default instance
