import { EventEmitter } from '../utils/eventEmitter.js'
import { log } from '@zos/utils'

class EventManager extends EventEmitter {
  constructor() {
    super()
  }

  register(event, handler) {
    try {
      this.on(event, handler)
      return true
    } catch (error) {
      log.error('Event registration failed:', error)
      return false
    }
  }

  emit(event, data) {
    try {
      super.emit(event, data)
    } catch (error) {
      log.error('Event emission failed:', error)
    }
  }
}

export default new EventManager()
