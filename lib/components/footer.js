import { widget } from '@zos/ui'
import { getDeviceInfo } from '@zos/device'
import NavigationManager from '../core/navigationManager.js'

const { width: DEVICE_WIDTH, height: DEVICE_HEIGHT } = getDeviceInfo()

export class Footer {
  constructor(options = {}) {
    this.height = options.height || 56
    this.actions = options.actions || []
    this.widget = null
  }

  create(root) {
    const container = root.createWidget(widget.GROUP, {
      x: 0,
      y: DEVICE_HEIGHT - this.height,
      w: DEVICE_WIDTH,
      h: this.height
    })

    this.createActionButtons(container)

    this.widget = container
    return container
  }

  createActionButtons(parent) {
    const buttonWidth = DEVICE_WIDTH / this.actions.length

    this.actions.forEach((action, index) => {
      const button = parent.createWidget(widget.BUTTON, {
        x: buttonWidth * index,
        y: 0,
        w: buttonWidth,
        h: this.height,
        text: action.icon || action.label,
        color: 0xffffff,
        click_func: () => {
          action.onClick?.()
        }
      })
      button.onClick = action.onClick
      NavigationManager.registerElement(button)
    })
  }
}
