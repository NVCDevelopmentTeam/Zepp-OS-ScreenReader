import '../../lib/utils/polyfills.js'
import { widget, prop } from '@zos/ui'
import { gettext, format } from '../../lib/utils/i18n.js'
import { safeDeviceInfo } from '../../lib/utils/deviceInfo.js'
import { replace } from '@zos/router'
import ScreenReader from '../../lib/core/readerProxy.js'
import { saveSettings } from '../../lib/core/config.js'

import { ZSRPage } from '../../lib/core/zsrPage.js'
import { createWidget, createChild } from '../../lib/core/zsrWidgets.js'
import { guard } from '../../lib/utils/safeCall.js'
import { px } from '../../lib/utils/px.js'
import { cycleVerbosity, verbosityName } from '../../lib/core/verbosity.js'
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

function createStepper(root, y, label, value, min, max, onChange) {
  let currentVal = value

  const textWidget = createChild(root, widget.TEXT, {
    x: px(40),
    y: y,
    w: width - px(80),
    h: px(40),
    text: `${label}: ${currentVal.toFixed(1)}`,
    color: 0xffffff,
    text_size: px(20),
    align_v: 2
  })

  createChild(root, widget.BUTTON, {
    x: px(40),
    y: y + px(45),
    w: (width - px(100)) / 2,
    h: px(50),
    text: '-',
    color: 0xffffff,
    normal_color: 0x333333,
    press_color: 0x666666,
    radius: px(25),
    click_func: guard(() => {
      if (currentVal > min) {
        currentVal = Math.max(min, Math.round((currentVal - 0.1) * 10) / 10)
        textWidget.setProperty(prop.TEXT, `${label}: ${currentVal.toFixed(1)}`)
        onChange(currentVal)
      }
    }, 'click_func')
  })

  createChild(root, widget.BUTTON, {
    x: px(40) + (width - px(100)) / 2 + px(20),
    y: y + px(45),
    w: (width - px(100)) / 2,
    h: px(50),
    text: '+',
    color: 0xffffff,
    normal_color: 0x333333,
    press_color: 0x666666,
    radius: px(25),
    click_func: guard(() => {
      if (currentVal < max) {
        currentVal = Math.min(max, Math.round((currentVal + 0.1) * 10) / 10)
        textWidget.setProperty(prop.TEXT, `${label}: ${currentVal.toFixed(1)}`)
        onChange(currentVal)
      }
    }, 'click_func')
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

    const config = globalThis.ScreenReaderConfig

    createChild(root, widget.TEXT, {
      x: 0,
      y: px(20),
      w: width,
      h: px(50),
      text: gettext('Speech Settings'),
      color: 0xffffff,
      align_h: 2,
      align_v: 2,
      text_size: px(28)
    })

    // Speech Rate
    createStepper(root, 80, gettext('Speech Rate'), config.speechRate ?? 1.0, 0.5, 3.0, (val) => {
      config.speechRate = val
      ScreenReader.tts.setRate(val)
      saveSettings(config)
    })

    // Speech Pitch
    createStepper(
      root,
      185,
      gettext('Speech Pitch'),
      config.speechPitch ?? 1.0,
      0.5,
      2.0,
      (val) => {
        config.speechPitch = val
        ScreenReader.tts.setPitch(val)
        saveSettings(config)
      }
    )

    // Toggles
    createToggle(root, 290, gettext('Read Status Bar'), !!config.readStatusBar, (val) => {
      config.readStatusBar = val
      saveSettings(config)
    })

    createToggle(root, 360, gettext('Read Progress'), !!config.readProgressBars, (val) => {
      config.readProgressBars = val
      saveSettings(config)
    })

    createToggle(root, 430, gettext('Read Hints'), !!config.readUsageHints, (val) => {
      config.readUsageHints = val
      saveSettings(config)
    })

    // TTS Engine Selector
    const engine = config.primaryTTSEngine || 'espeak'
    createChild(root, widget.BUTTON, {
      x: px(40),
      y: px(510),
      w: width - px(80),
      h: px(60),
      text: `${gettext('Engine')}: ${engine.toUpperCase()}`,
      color: 0xffffff,
      normal_color: 0x333333,
      press_color: 0x555555,
      radius: px(30),
      click_func: guard(() => {
        const next = engine === 'native' ? 'espeak' : 'native'
        config.primaryTTSEngine = next
        saveSettings(config)
        ScreenReader.speak(format(gettext('TTS engine set to {0}'), next), { priority: 'high' })
        replace({ url: 'page/settings/Speech' })
      }, 'click_func')
    })

    // Verbosity: tap to change level (minimal, standard, detailed, custom)
    createChild(root, widget.BUTTON, {
      x: px(40),
      y: px(590),
      w: width - px(80),
      h: px(60),
      text: `${gettext('Verbosity')}: ${verbosityName(config.verbosity || 'detailed')}`,
      color: 0xffffff,
      normal_color: 0x333333,
      press_color: 0x555555,
      radius: px(30),
      click_func: guard(() => {
        cycleVerbosity(true)
        replace({ url: 'page/settings/Speech' })
      }, 'click_func')
    })

    return root
  }
})
