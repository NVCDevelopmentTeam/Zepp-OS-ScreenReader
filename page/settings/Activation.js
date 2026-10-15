import '../../lib/utils/polyfills.js'
import { widget } from '@zos/ui'
import { gettext } from '../../lib/utils/i18n.js'
import { safeDeviceInfo } from '../../lib/utils/deviceInfo.js'
import { saveSettings, loadSettings } from '../../lib/core/config.js'
import { describeActivation, openingGuide } from '../../lib/interaction/activation.js'

import { ZSRPage } from '../../lib/core/zsrPage.js'
import { createWidget, createChild } from '../../lib/core/zsrWidgets.js'
const { width, height } = safeDeviceInfo()

/** Vertical spacing between rows, scaled so the page fits the shortest screens (320x380). */
const ROW = Math.round(height * 0.185)

function createToggle(root, y, label, checked, onChange) {
  createChild(root, widget.TEXT, {
    x: 40,
    y: y,
    w: width - 150,
    h: 60,
    text: label,
    color: 0xffffff,
    text_size: 22,
    align_v: 2
  })

  createChild(root, widget.SLIDE_SWITCH, {
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

/** @param {string} text */
function speak(text) {
  const reader = globalThis.ScreenReaderInstance
  if (reader && typeof reader.speak === 'function') {
    reader.speak(text, { priority: 'high', force: true })
  }
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
      y: 10,
      w: width,
      h: 50,
      text: gettext('Activation'),
      color: 0xffffff,
      align_h: 2,
      align_v: 2,
      text_size: 28
    })

    // 1. Crown pressed three times
    createToggle(
      root,
      ROW,
      gettext('Crown, three presses'),
      config.accessibilityShortcut === 'triple_click_home',
      (val) => {
        config.accessibilityShortcut = val ? 'triple_click_home' : 'off'
        saveSettings(config)
      }
    )

    // 2. Accessibility button in the bottom corner (appears on the next page)
    createToggle(
      root,
      ROW * 2,
      gettext('Accessibility button'),
      config.accessibilityButton !== false,
      (val) => {
        config.accessibilityButton = val
        saveSettings(config)
      }
    )

    // 3. Swipe up, down, up
    createToggle(
      root,
      ROW * 3,
      gettext('Gesture, swipe up down up'),
      config.activationGesture === 'zigzag',
      (val) => {
        config.activationGesture = val ? 'zigzag' : 'off'
        saveSettings(config)
      }
    )

    createChild(root, widget.BUTTON, {
      x: 40,
      y: ROW * 4,
      w: width - 80,
      h: 56,
      radius: 28,
      text: gettext('How to open ZSR'),
      color: 0xffffff,
      normal_color: 0x333333,
      press_color: 0x666666,
      click_func: () => speak(describeActivation().concat(openingGuide()).join(' '))
    })

    return root
  }
})
