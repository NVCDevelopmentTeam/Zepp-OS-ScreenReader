import '../../lib/utils/polyfills.js'
import { widget } from '@zos/ui'
import { gettext } from '../../lib/utils/i18n.js'
import { safeDeviceInfo } from '../../lib/utils/deviceInfo.js'
import { replace } from '@zos/router'
import ScreenReader from '../../lib/core/readerProxy.js'
import { saveSettings } from '../../lib/core/config.js'

import { ZSRPage } from '../../lib/core/zsrPage.js'
import { createWidget, createChild } from '../../lib/core/zsrWidgets.js'
import { guard } from '../../lib/utils/safeCall.js'
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
      globalThis.ScreenReaderConfig = {}
    }
  },

  build() {
    const root = createWidget(widget.GROUP, {
      x: 0,
      y: 0,
      w: width,
      h: height
    })

    createChild(root, widget.TEXT, {
      x: 0,
      y: px(20),
      w: width,
      h: px(50),
      text: gettext('General Settings'),
      color: 0xffffff,
      align_h: 2,
      align_v: 2,
      text_size: px(28)
    })

    // Enable/Disable ZSR
    createToggle(root, 100, gettext('ZSR Status'), ScreenReader.enabled, (val) => {
      ScreenReader.toggleEnabled(val === ScreenReader.enabled)
      replace({ url: 'page/settings/General' })
    })

    // Confirm before disable
    createToggle(
      root,
      180,
      gettext('Confirm Disable'),
      !!globalThis.ScreenReaderConfig.confirmBeforeDisable,
      (val) => {
        globalThis.ScreenReaderConfig.confirmBeforeDisable = val
        saveSettings(globalThis.ScreenReaderConfig)
      }
    )

    // Auto-start
    createToggle(
      root,
      260,
      gettext('Auto-start'),
      !!globalThis.ScreenReaderConfig.autoStart,
      (val) => {
        globalThis.ScreenReaderConfig.autoStart = val
        saveSettings(globalThis.ScreenReaderConfig)
      }
    )

    // Check for updates
    createChild(root, widget.BUTTON, {
      x: px(40),
      y: px(340),
      w: width - px(80),
      h: px(60),
      text: gettext('Check for Updates'),
      color: 0xffffff,
      normal_color: 0x333333,
      press_color: 0x555555,
      radius: px(30),
      click_func: guard(() => {
        ScreenReader.speak(gettext('Checking for updates at zeppreader.com'), { priority: 'high' })
      }, 'click_func')
    })

    return root
  }
})
