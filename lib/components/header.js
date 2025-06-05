import { createWidget, widget } from '@zos/ui'
import { DEVICE_WIDTH } from '@zos/utils'
import { ScreenReader } from '../core/screenReader'
import { VibrationManager } from '../feedback/vibrate feedback'

export class Header {
  constructor(options = {}) {
    this.title = options.title || ''
    this.height = options.height || 48
    this.widget = null
  }

  create() {
    const container = createWidget(widget.GROUP, {
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
    const title = createWidget(widget.TEXT, {
      x: 48,
      y: 0,
      w: DEVICE_WIDTH - 96,
      h: this.height,
      text: this.title,
      fontSize: 18,
      color: 'white',
      textAlign: 'center',
      accessible: true,
      accessibilityLabel: this.title,
      onClick: async () => {
        await ScreenReader.speak(this.title)
        await VibrationManager.feedback('notification')
      }
    })
    parent.appendChild(title)
  }

  createBackButton(parent) {
    const button = createWidget(widget.BUTTON, {
      x: 0,
      y: 0,
      w: 48,
      h: this.height,
      text: '←',
      fontSize: 24,
      color: 'white',
      onClick: () => {
        ScreenReader.speak('Back')
        history.back()
      }
    })
    parent.appendChild(button)
  }
}
