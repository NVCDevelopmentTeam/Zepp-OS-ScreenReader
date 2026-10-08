import { widget } from '@zos/ui'
import { gettext } from '../../lib/utils/i18n.js'
import { safeDeviceInfo } from '../../lib/utils/deviceInfo.js'
import { push } from '@zos/router'
import { loadSettings, saveSettings } from '../../lib/core/config.js'
import SpeechHistory from '../../lib/utils/speechHistory.js'
import ScreenReader from '../../lib/core/readerProxy.js'

import { ZSRPage } from '../../lib/core/zsrPage.js'
import { createWidget, createChild } from '../../lib/core/zsrWidgets.js'
const { width, height } = safeDeviceInfo()

function createToggle(root, y, label, checked, onChange) {
  createChild(root, widget.TEXT, {
    x: 40,
    y: y,
    w: width - 150,
    h: 60,
    text: label,
    color: 0xffffff,
    text_size: 24,
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

export default ZSRPage({
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

    createChild(root, widget.TEXT, {
      x: 0,
      y: 20,
      w: width,
      h: 50,
      text: gettext('Speech History'),
      color: 0xffffff,
      align_h: 2,
      align_v: 2,
      text_size: 28
    })

    createToggle(root, 100, gettext('Log History'), !!config.historyEnabled, (val) => {
      config.historyEnabled = val
      saveSettings(config)
    })

    const historyLimit = config.historyLimit || 50
    createChild(root, widget.TEXT, {
      x: 40,
      y: 180,
      w: width - 80,
      h: 40,
      text: `${gettext('Limit')}: ${historyLimit} ${gettext('items')}`,
      color: 0xaaaaaa,
      text_size: 24,
      align_v: 2
    })

    createChild(root, widget.BUTTON, {
      x: 40,
      y: 230,
      w: width - 80,
      h: 60,
      text: gettext('View History'),
      color: 0xffffff,
      normal_color: 0x333333,
      press_color: 0x666666,
      radius: 30,
      click_func: () => {
        push({ url: 'page/home/History' })
      }
    })

    createChild(root, widget.BUTTON, {
      x: 40,
      y: 310,
      w: width - 80,
      h: 60,
      text: gettext('Clear History'),
      color: 0xffffff,
      normal_color: 0xaa0000,
      press_color: 0x666666,
      radius: 30,
      click_func: () => {
        SpeechHistory.clear()
        ScreenReader.speak(gettext('Speech history cleared'), { priority: 'high' })
      }
    })

    return root
  }
})
