import screenReader from "@guidepup/virtual-screen-reader";
import { createWidget, widget } from '@zos/ui'
import { DEVICE_WIDTH } from '@zos/utils'
import ScreenReader from '../core/screenReader'
import { GestureHandler } from '../interaction/gesture'
import { log } from '@zos/utils'

export class ScreenReaderUI {
  constructor() {
    this.container = null
    this.enabled = false
  }

  async init() {
    try {
      await ScreenReader.init()
      await this.setupGestures()
      this.enabled = true
      return true
    } catch (error) {
      log.error('UI init failed:', error)
      return false
    }
  }

  async setupGestures() {
    const gestureHandlers = {
      swipeUp: () => this.handleNavigation('next'),
      swipeDown: () => this.handleNavigation('previous'),
      tap: () => this.handleSelection(),
      doubleTap: () => this.handleBack()
    }

    await Promise.all(
      Object.entries(gestureHandlers).map(([gesture, handler]) =>
        GestureHandler.register(gesture, handler)
      )
    )
  }

  async handleNavigation(direction) {
    try {
      if (!this.enabled) return false
      
      const elements = this.getNavigableElements()
      if (!elements.length) return false

      const currentIndex = this.getCurrentFocusIndex(elements)
      const nextIndex = this.getNextIndex(currentIndex, direction, elements.length)
      
      return await this.focusElement(elements[nextIndex])
    } catch (error) {
      log.error('Navigation failed:', error)
      return false
    }
  }

  getNavigableElements() {
    return Array.from(document.querySelectorAll('[data-focusable="true"]'))
  }

  createNavigationUI() {
    // Add UI components here
  }
}

export default new ScreenReaderUI()