import { Gesture } from '@zos/sensor'
import { log } from '@zos/utils'
import EventManager from '../core/eventManager'

export class GestureHandler {
  static async register(type, handler) {
    try {
      if (typeof handler !== 'function') {
        throw new Error('Handler must be a function')
      }

      const wrappedHandler = async (event) => {
        try {
          await handler(event)
          EventManager.emit('gesture', { type, success: true })
        } catch (error) {
          EventManager.emit('error', { type, error })
        }
      }

      await Gesture.register(type, wrappedHandler)
      return true
    } catch (error) {
      log.error('Gesture registration failed:', error)
      return false
    }
  }
}
