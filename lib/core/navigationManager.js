import { log } from '@zos/utils'

class NavigationManager {
  constructor() {
    this.currentIndex = -1
    this.elements = []
  }

  registerElement(element) {
    try {
      this.elements.push({
        element,
        focusable: true,
        index: this.elements.length
      })
      return true
    } catch (error) {
      log.error('Element registration failed:', error)
      return false
    }
  }

  async navigate(direction) {
    try {
      const nextIndex = this.getNextIndex(direction)
      if (nextIndex !== -1) {
        await this.focusElement(nextIndex)
      }
      return true
    } catch (error) {
      log.error('Navigation failed:', error)
      return false
    }
  }

  getNextIndex(direction) {
    const count = this.elements.length
    if (count === 0) return -1

    if (direction === 'next') {
      return (this.currentIndex + 1) % count
    }
    return (this.currentIndex - 1 + count) % count
  }
}

export default new NavigationManager()
