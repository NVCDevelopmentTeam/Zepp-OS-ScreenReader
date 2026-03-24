import { createWidget, widget } from '@zos/ui'
import { gettext } from '@zos/i18n'
import { getDeviceInfo } from '@zos/device'
import { replace, push } from '@zos/router'
import { loadSettings, saveSettings } from '../../lib/core/config.js'
import BrailleService from '../../lib/core/braille.js'

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
      text: gettext('Audio & Braille'),
      color: 0xffffff,
      align_h: 2,
      align_v: 2,
      text_size: 28
    })

    this.createToggle(root, 100, gettext('Braille Output'), !!config.brailleOutput, (val) => {
      config.brailleOutput = val
      saveSettings(config)
    })

    // Braille Table Selection
    const brailleTable = config.brailleTable || 'en-US'
    root.createWidget(widget.TEXT, {
      x: 40,
      y: 180,
      w: width - 80,
      h: 40,
      text: `${gettext('Table')}: ${brailleTable}`,
      color: 0xaaaaaa,
      text_size: 24,
      align_v: 2
    })

    root.createWidget(widget.BUTTON, {
      x: 40,
      y: 230,
      w: width - 80,
      h: 60,
      text: gettext('Change Table'),
      color: 0xffffff,
      normal_color: 0x333333,
      press_color: 0x555555,
      radius: 30,
      click_func: () => {
        const tables = ['en-US', 'zh-CN', 'ja-JP', 'ko-KR']
        let nextIndex = (tables.indexOf(brailleTable) + 1) % tables.length
        config.brailleTable = tables[nextIndex]
        saveSettings(config)
        BrailleService.setTable(config.brailleTable)
        replace({ url: 'page/settings/AudioBraille' })
      }
    })

    root.createWidget(widget.BUTTON, {
      x: 40,
      y: 310,
      w: width - 80,
      h: 60,
      text: gettext('Pair Display'),
      color: 0xffffff,
      normal_color: 0x333333,
      press_color: 0x666666,
      radius: 30,
      click_func: () => {
        push({ url: 'page/settings/BraillePairing' })
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
