import '../../lib/utils/polyfills.js'
import { widget } from '@zos/ui'
import { gettext } from '../../lib/utils/i18n.js'
import { safeDeviceInfo } from '../../lib/utils/deviceInfo.js'
import { replace } from '@zos/router'
import { loadSettings, saveSettings } from '../../lib/core/config.js'

import { ZSRPage } from '../../lib/core/zsrPage.js'
import { createWidget, createChild } from '../../lib/core/zsrWidgets.js'
import { px } from '../../lib/utils/px.js'
const { width, height } = safeDeviceInfo()

const gesturesList = [
  { name: gettext('Swipe Up'), key: 'gesture_up', value: 'previous' },
  { name: gettext('Swipe Down'), key: 'gesture_down', value: 'next' },
  { name: gettext('Swipe Left'), key: 'gesture_left', value: 'context_menu' },
  { name: gettext('Swipe Right'), key: 'gesture_right', value: 'select' },
  { name: gettext('Double Tap'), key: 'gesture_double_tap', value: 'cycle_mode' },
  { name: gettext('Long Press'), key: 'gesture_long_press', value: 'toggle_mute' }
]

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

    createChild(root, widget.TEXT, {
      x: 0,
      y: px(10),
      w: width,
      h: px(50),
      text: gettext('Gestures & Input'),
      color: 0xffffff,
      align_h: 2,
      align_v: 2,
      text_size: px(28)
    })

    const config = globalThis.ScreenReaderConfig || {}

    createChild(root, widget.SCROLL_LIST, {
      x: 0,
      y: px(70),
      w: width,
      h: height - px(70),
      item_height: px(90),
      item_space: px(10),
      item_config: [
        {
          type_id: 1,
          item_bg_color: 0x333333,
          item_bg_radius: 10,
          text_view: [
            {
              x: px(20),
              y: px(10),
              w: width - px(40),
              h: px(40),
              key: 'name',
              color: 0xffffff,
              text_size: px(22),
              align_v: 2
            },
            {
              x: px(20),
              y: px(50),
              w: width - px(40),
              h: px(30),
              key: 'displayValue',
              color: 0xaaaaaa,
              text_size: px(18),
              align_v: 2
            }
          ]
        }
      ],
      data_array: gesturesList.map((g) => ({
        ...g,
        displayValue: config[g.key] || g.value,
        type_id: 1
      })),
      data_count: gesturesList.length,
      item_click_func: (_list, index) => {
        const item = gesturesList[index]
        const actions = [
          'next',
          'previous',
          'select',
          'context_menu',
          'cycle_mode',
          'toggle_mute',
          'read_screen'
        ]
        let current = config[item.key] || item.value
        let nextIndex = (actions.indexOf(current) + 1) % actions.length
        let nextAction = actions[nextIndex]

        config[item.key] = nextAction
        saveSettings(config)

        replace({ url: 'page/settings/GesturesInput' })
      }
    })

    return root
  }
})
