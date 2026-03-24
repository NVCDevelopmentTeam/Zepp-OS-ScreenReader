import { createWidget, widget } from '@zos/ui'
import { gettext } from '@zos/i18n'
import { getDeviceInfo } from '@zos/device'
import { replace } from '@zos/router'
import SpeechHistory from '../../lib/utils/speechHistory.js'
import ScreenReader from '../../lib/core/screenReader.js'
import { loadSettings } from '../../lib/core/config.js'

const { width, height } = getDeviceInfo()

export default Page({
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

    root.createWidget(widget.TEXT, {
      x: 0,
      y: 10,
      w: width,
      h: 50,
      text: gettext('Speech History'),
      color: 0xffffff,
      align_h: 2,
      align_v: 2,
      text_size: 28
    })

    const history = SpeechHistory.getHistory().map((item) => ({ ...item, type_id: 1 }))

    if (history.length === 0) {
      root.createWidget(widget.TEXT, {
        x: 20,
        y: 100,
        w: width - 40,
        h: 100,
        text: gettext('No history available'),
        color: 0xaaaaaa,
        align_h: 2,
        align_v: 2,
        text_size: 24
      })
      return root
    }

    root.createWidget(widget.SCROLL_LIST, {
      x: 0,
      y: 70,
      w: width,
      h: height - 150,
      item_height: 100,
      item_space: 5,
      item_config: [
        {
          type_id: 1,
          item_bg_color: 0x222222,
          item_bg_radius: 10,
          text_view: [
            {
              x: 10,
              y: 5,
              w: width - 20,
              h: 90,
              key: 'text',
              color: 0xffffff,
              text_size: 18,
              text_style: widget.TEXT_STYLE_WRAP,
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

    root.createWidget(widget.BUTTON, {
      x: 40,
      y: height - 70,
      w: width - 80,
      h: 60,
      text: gettext('Clear History'),
      color: 0xffffff,
      normal_color: 0xaa0000,
      press_color: 0x666666,
      radius: 30,
      click_func: () => {
        SpeechHistory.clear()
        replace({ url: 'page/home/History' })
      }
    })

    return root
  }
})
