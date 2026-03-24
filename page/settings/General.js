import { createWidget, widget } from '@zos/ui'
import { gettext } from '@zos/i18n'
import { getDeviceInfo } from '@zos/device'
import { replace } from '@zos/router'
import ScreenReader from '../../lib/core/screenReader.js'
import { saveSettings } from '../../lib/core/config.js'

const { width, height } = getDeviceInfo()

export default Page({
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

    root.createWidget(widget.TEXT, {
      x: 0,
      y: 20,
      w: width,
      h: 50,
      text: gettext('General Settings'),
      color: 0xffffff,
      align_h: 2,
      align_v: 2,
      text_size: 28
    })

    // Enable/Disable ZSR
    this.createToggle(root, 100, gettext('ZSR Status'), ScreenReader.enabled, (val) => {
      ScreenReader.toggleEnabled(val === ScreenReader.enabled)
      replace({ url: 'page/settings/General' })
    })

    // Confirm before disable
    this.createToggle(
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
    this.createToggle(
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
    root.createWidget(widget.BUTTON, {
      x: 40,
      y: 340,
      w: width - 80,
      h: 60,
      text: gettext('Check for Updates'),
      color: 0xffffff,
      normal_color: 0x333333,
      press_color: 0x555555,
      radius: 30,
      click_func: () => {
        ScreenReader.speak('Checking for updates at zeppreader.com', { priority: 'high' })
      }
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
