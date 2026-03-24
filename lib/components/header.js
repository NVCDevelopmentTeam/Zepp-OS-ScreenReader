import { widget } from '@zos/ui'
import { getDeviceInfo } from '@zos/device'
import NavigationManager from '../core/navigationManager.js'

const { width: DEVICE_WIDTH } = getDeviceInfo()

export class Header {
  constructor(options = {}) {
    this.title = options.title || ''
    this.height = options.height || 48
    this.widget = null
  }

  create(root) {
    const container = root.createWidget(widget.GROUP, {
      x: 0,
      y: 0,
      w: DEVICE_WIDTH,
      h: this.height
    })

    this.createTitle(container)
    this.createBackButton(container)

    this.widget = container
    return container
  }

  createTitle(parent) {
    const title = parent.createWidget(widget.TEXT, {
      x: 48,
      y: 0,
      w: DEVICE_WIDTH - 96,
      h: this.height,
      text: this.title,
      color: 0xffffff,
      align_h: 2,
      align_v: 2
    })
    NavigationManager.registerElement(title)
  }

  createBackButton(parent) {
    const button = parent.createWidget(widget.BUTTON, {
      x: 0,
      y: 0,
      w: 48,
      h: this.height,
      text: '<',
      color: 0xffffff,
      click_func: () => {
        // this.$router.back()
      }
    })
    NavigationManager.registerElement(button)
  }
}
