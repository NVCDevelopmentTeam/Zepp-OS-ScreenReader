import '../../lib/utils/polyfills.js'
import { widget, text_style } from '@zos/ui'
import { gettext } from '../../lib/utils/i18n.js'
import { safeDeviceInfo } from '../../lib/utils/deviceInfo.js'
import { replace } from '@zos/router'
import SpeechHistory from '../../lib/utils/speechHistory.js'
import ScreenReader from '../../lib/core/readerProxy.js'
import { loadSettings } from '../../lib/core/config.js'

import { ZSRPage } from '../../lib/core/zsrPage.js'
import { createWidget, createChild } from '../../lib/core/zsrWidgets.js'
import { guard } from '../../lib/utils/safeCall.js'
import { px } from '../../lib/utils/px.js'
const { width, height } = safeDeviceInfo()

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

    createChild(root, widget.TEXT, {
      x: 0,
      y: px(10),
      w: width,
      h: px(50),
      text: gettext('Speech History'),
      color: 0xffffff,
      align_h: 2,
      align_v: 2,
      text_size: px(28)
    })

    const history = SpeechHistory.getHistory().map((item) => ({ ...item, type_id: 1 }))

    if (history.length === 0) {
      createChild(root, widget.TEXT, {
        x: px(20),
        y: px(100),
        w: width - px(40),
        h: px(100),
        text: gettext('No history available'),
        color: 0xaaaaaa,
        align_h: 2,
        align_v: 2,
        text_size: px(24)
      })
      return root
    }

    createChild(root, widget.SCROLL_LIST, {
      x: 0,
      y: px(70),
      w: width,
      h: height - px(150),
      item_height: px(100),
      item_space: 5,
      item_config: [
        {
          type_id: 1,
          item_bg_color: 0x222222,
          item_bg_radius: 10,
          text_view: [
            {
              x: px(10),
              y: 5,
              w: width - px(20),
              h: px(90),
              key: 'text',
              color: 0xffffff,
              text_size: px(18),
              text_style: text_style.WRAP,
              align_v: 2
            }
          ]
        }
      ],
      data_array: history,
      data_count: history.length,
      item_click_func: (list, index) => {
        const item = history[index]
        ScreenReader.speak(item.text, { priority: 'high', force: true })
      }
    })

    createChild(root, widget.BUTTON, {
      x: px(40),
      y: height - px(70),
      w: width - px(80),
      h: px(60),
      text: gettext('Clear History'),
      color: 0xffffff,
      normal_color: 0xaa0000,
      press_color: 0x666666,
      radius: px(30),
      click_func: guard(() => {
        SpeechHistory.clear()
        replace({ url: 'page/home/History' })
      }, 'click_func')
    })

    return root
  }
})
