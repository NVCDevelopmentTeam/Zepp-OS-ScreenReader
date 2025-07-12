import { createWidget, widget } from '@zos/ui'
import { DEVICE_WIDTH } from '@zos/utils'
import { VibrationManager } from '../feedback/vibrateFeedback'
import { log } from '@zos/utils'

export class ConfigPanel {
  constructor(options = {}) {
    this.width = DEVICE_WIDTH
    this.height = options.height || 200
    this.settings = options.settings || []
  }

  create() {
    try {
      const container = createWidget(widget.GROUP, {
        x: 0,
        y: 0,
        w: this.width,
        h: this.height
      })

      this.createSettingControls(container)
      return container
    } catch (error) {
      log.error('Config panel creation failed:', error)
      return null
    }
  }

  async toggleSetting(key, value) {
    try {
      await this.settings[key]?.onChange?.(value)
      await VibrationManager.feedback('success')
    } catch (error) {
      log.error('Setting toggle failed:', error)
      await VibrationManager.feedback('error')
    }
  }
}
