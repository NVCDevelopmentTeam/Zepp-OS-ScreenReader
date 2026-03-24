import { createWidget, widget } from '@zos/ui'
import { gettext } from '@zos/i18n'
import { getDeviceInfo } from '@zos/device'
import { loadSettings, saveSettings } from '../../lib/core/config.js'

const { width, height } = getDeviceInfo()

export default Page({
  onInit() {
    globalThis.ScreenReaderConfig = loadSettings()
  },

  build() {
    const root = createWidget(widget.GROUP, {
      x: 0,
      y: 0,
      w: width,
      h: height
    })

    const config = globalThis.ScreenReaderConfig

    root.createWidget(widget.TEXT, {
      x: 0,
      y: 20,
      w: width,
      h: 50,
      text: gettext('Document Settings'),
      color: 0xffffff,
      align_h: 2,
      align_v: 2,
      text_size: 28
    })

    this.createToggle(root, 100, gettext('Formatting'), !!config.announceFormatting, (val) => {
      config.announceFormatting = val
      saveSettings(config)
    })

    this.createToggle(root, 180, gettext('Tables'), !!config.announceTables, (val) => {
      config.announceTables = val
      saveSettings(config)
    })

    return root
  },

  createToggle(root, y, label, checked, onChange) {
    root.createWidget(widget.TEXT, {
      x: 40,
      y: y,
      w: width - 150,
      h: 60,
      text: label,
      color: 0xffffff,
      text_size: 24,
      align_v: 2
    })

    root.createWidget(widget.SLIDE_SWITCH, {
      x: width - 110,
      y: y + 10,
      w: 80,
      h: 40,
      checked: checked,
      select_bg: 0x00aa00,
      unselect_bg: 0x666666,
      checked_change_func: (val) => {
        onChange(val)
      }
    })
  }
})
