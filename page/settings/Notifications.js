import '../../lib/utils/polyfills.js'
import { widget } from '@zos/ui'
import { gettext } from '../../lib/utils/i18n.js'
import { safeDeviceInfo } from '../../lib/utils/deviceInfo.js'
import { saveSettings, loadSettings } from '../../lib/core/config.js'

import { ZSRPage } from '../../lib/core/zsrPage.js'
import { createWidget, createChild } from '../../lib/core/zsrWidgets.js'
import { px } from '../../lib/utils/px.js'
const { width, height } = safeDeviceInfo()

function createToggle(root, y, label, checked, onChange) {
  createChild(root, widget.TEXT, {
    x: px(40),
    y: y,
    w: width - px(150),
    h: px(60),
    text: label,
    color: 0xffffff,
    text_size: px(24),
    align_v: 2
  })

  createChild(root, widget.SLIDE_SWITCH, {
    x: width - px(110),
    y: y + px(10),
    w: px(80),
    h: px(40),
    checked: checked,
    select_bg: 0x00aa00,
    unselect_bg: 0x666666,
    checked_change_func: (val) => {
      onChange(val)
    }
  })
}

export default ZSRPage({
  onInit() {
    if (!globalThis.ScreenReaderConfig) {
      globalThis.ScreenReaderConfig = loadSettings()
    }
  },

  build() {
    const root = createWidget(widget.GROUP, {
      x: 0,
      y: 0,
      w: width,
      h: height
    })

    const config = globalThis.ScreenReaderConfig

    createChild(root, widget.TEXT, {
      x: 0,
      y: px(20),
      w: width,
      h: px(50),
      text: gettext('Notification Settings'),
      color: 0xffffff,
      align_h: 2,
      align_v: 2,
      text_size: px(28)
    })

    createToggle(root, 100, gettext('Read All'), !!config.readNotifications, (val) => {
      config.readNotifications = val
      saveSettings(config)
    })

    createToggle(root, 180, gettext('Read SMS'), !!config.readSMS, (val) => {
      config.readSMS = val
      saveSettings(config)
    })

    createToggle(root, 260, gettext('Read Calls'), !!config.readCalls, (val) => {
      config.readCalls = val
      saveSettings(config)
    })

    createToggle(root, 340, gettext('Read Missed'), !!config.readMissedCalls, (val) => {
      config.readMissedCalls = val
      saveSettings(config)
    })

    return root
  }
})
