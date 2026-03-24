import { widget } from '@zos/ui'
import { getDeviceInfo } from '@zos/device'

const { width: DEVICE_WIDTH } = getDeviceInfo()

export class ConfigPanel {
  constructor(options = {}) {
    this.width = DEVICE_WIDTH
    this.height = options.height || 200
    this.settings = options.settings || []
  }

  create(root) {
    try {
      const container = root.createWidget(widget.GROUP, {
        x: 0,
        y: 0,
        w: this.width,
        h: this.height
      })

      // this.createSettingControls(container)
      return container
    } catch (_) {
      return null
    }
  }
}
