import { EventEmitter } from '@zos/events'
import { log } from '@zos/utils'

class EventManager extends EventEmitter {
  constructor() {
    super()
    this.handlers = new Map()
  }

  register(event, handler) {
    try {
      if (!this.handlers.has(event)) {
        this.handlers.set(event, new Set())
      }
      this.handlers.get(event).add(handler)
      return true
    } catch (error) {
      log.error('Event registration failed:', error)
      return false
    }
  }

  emit(event, data) {
    try {
      const handlers = this.handlers.get(event)
      if (handlers) {
        handlers.forEach(handler => handler(data))
      }
    } catch (error) {
      log.error('Event emission failed:', error)
    }
  }
}

export default new EventManager()
