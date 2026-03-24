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

    const config = globalThis.ScreenReaderConfig

    root.createWidget(widget.TEXT, {
      x: 0,
      y: 20,
      w: width,
      h: 50,
      text: gettext('Speech Settings'),
      color: 0xffffff,
      align_h: 2,
      align_v: 2,
      text_size: 28
    })

    // Speech Rate
    this.createSlider(
      root,
      100,
      gettext('Speech Rate'),
      config.speechRate ?? 1.0,
      0.5,
      3.0,
      (val) => {
        config.speechRate = val
        ScreenReader.tts.setRate(val)
        saveSettings(config)
      }
    )

    // Speech Pitch
    this.createSlider(
      root,
      200,
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
    this.createToggle(root, 300, gettext('Read Status Bar'), !!config.readStatusBar, (val) => {
      config.readStatusBar = val
      saveSettings(config)
    })

    this.createToggle(root, 380, gettext('Read Progress'), !!config.readProgressBars, (val) => {
      config.readProgressBars = val
      saveSettings(config)
    })

    this.createToggle(root, 460, gettext('Read Hints'), !!config.readUsageHints, (val) => {
      config.readUsageHints = val
      saveSettings(config)
    })

    // TTS Engine Selector
    const engine = config.primaryTTSEngine || 'espeak'
    root.createWidget(widget.BUTTON, {
      x: 40,
      y: 550,
      w: width - 80,
      h: 60,
      text: `${gettext('Engine')}: ${engine.toUpperCase()}`,
      color: 0xffffff,
      normal_color: 0x333333,
      press_color: 0x555555,
      radius: 30,
      click_func: () => {
        const next = engine === 'native' ? 'espeak' : 'native'
        config.primaryTTSEngine = next
        saveSettings(config)
        ScreenReader.speak(`${gettext('TTS engine set to')} ${next}`, { priority: 'high' })
        replace({ url: 'page/settings/Speech' })
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
  },

  createSlider(root, y, label, value, min, max, onChange) {
    root.createWidget(widget.TEXT, {
      x: 40,
      y: y,
      w: width - 80,
      h: 40,
      text: `${label}: ${value.toFixed(1)}`,
      color: 0xffffff,
      text_size: 20,
      align_v: 2
    })

    root.createWidget(widget.SLIDER, {
      x: 40,
      y: y + 40,
      w: width - 80,
      h: 40,
      min: min * 10,
      max: max * 10,
      value: value * 10,
      onChange: (val) => {
        const realVal = val / 10
        onChange(realVal)
      }
    })
  }
})
