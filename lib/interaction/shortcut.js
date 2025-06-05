import { log } from '@zos/utils'

export class ShortcutHandler {
  static SHORTCUTS = new Map()

  static register(key, action) {
    try {
      if (typeof action !== 'function') {
        throw new Error('Action must be a function')
      }
      this.SHORTCUTS.set(key, action)
      return true
    } catch (error) {
      log.error('Shortcut registration failed:', error)
      return false
    }
  }

  static async execute(key) {
    try {
      const action = this.SHORTCUTS.get(key)
      if (!action) throw new Error(`Unknown shortcut: ${key}`)
      await action()
      return true
    } catch (error) {
      log.error('Shortcut execution failed:', error)
      return false
    }
  }
}
