import { widget } from '@zos/ui'
import { getDeviceInfo } from '@zos/device'
import ScreenReader from '../core/screenReader.js'

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo()

class Sidebar {
  constructor() {
    this.isOpen = false
    this.widget = null
  }

  create(root) {
    this.widget = root.createWidget(widget.GROUP, {
      x: -DEVICE_WIDTH,
      y: 0,
      w: DEVICE_WIDTH,
      h: DEVICE_HEIGHT
    })
    this.widget.setProperty(widget.PROPERTIES.VISIBLE, false)

    return this.widget
  }

  toggle() {
    this.isOpen = !this.isOpen
    this.widget.setProperty(widget.PROPERTIES.X, this.isOpen ? 0 : -DEVICE_WIDTH)
    this.widget.setProperty(widget.PROPERTIES.VISIBLE, this.isOpen)
    ScreenReader.speak(this.isOpen ? 'Sidebar opened' : 'Sidebar closed')
  }
}

export default new Sidebar()
