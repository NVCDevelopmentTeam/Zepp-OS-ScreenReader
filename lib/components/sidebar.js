import { widget } from '@zos/ui'
import { getDeviceInfo } from '@zos/device'
import ScreenReader from '../core/screenReader.js'

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo()

/**
 * Sidebar panel component. Slides in from the left edge of the screen.
 * Intended for quick-access navigation or settings shortcuts.
 */
class Sidebar {
  constructor() {
    this.isOpen = false
    /** @type {ZSRWidget | null} */
    this.widget = null
  }

  create(root) {
    this.widget = root.createWidget(widget.GROUP, {
      x: -DEVICE_WIDTH,
      y: 0,
      w: DEVICE_WIDTH,
      h: DEVICE_HEIGHT
    })
    if (this.widget) {
      this.widget.setProperty(widget.prop.VISIBLE, false)
    }

    return this.widget
  }

  toggle() {
    if (!this.widget) return
    this.isOpen = !this.isOpen
    this.widget.setProperty(widget.prop.X, this.isOpen ? 0 : -DEVICE_WIDTH)
    this.widget.setProperty(widget.prop.VISIBLE, this.isOpen)
    ScreenReader.speak(this.isOpen ? 'Sidebar opened' : 'Sidebar closed')
  }
}

export default new Sidebar()
