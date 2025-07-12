import { createWidget, widget } from '@zos/ui'
import { DEVICE_WIDTH, DEVICE_HEIGHT } from '@zos/utils'
import ScreenReader from '../core/screenReader'
import { VibrationManager } from '../feedback/vibrateFeedback'

export class Footer {
  constructor(options = {}) {
    this.height = options.height || 56
    this.actions = options.actions || []
    this.widget = null
  }

  create() {
    const container = createWidget(widget.GROUP, {
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
      const button = createWidget(widget.BUTTON, {
        x: buttonWidth * index,
        y: 0,
        w: buttonWidth,
        h: this.height,
        text: action.icon,
        fontSize: 20,
        color: 'white',
        onClick: async () => {
          await ScreenReader.speak(action.label)
          await VibrationManager.feedback('notification')
          action.onClick?.()
        }
      })
      parent.appendChild(button)
    })
  }
}
