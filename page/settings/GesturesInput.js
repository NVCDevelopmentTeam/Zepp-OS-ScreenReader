import { createWidget, widget } from '@zos/ui'
import { gettext } from '@zos/i18n'
import { getDeviceInfo } from '@zos/device'
import { replace } from '@zos/router'
import { loadSettings, saveSettings } from '../../lib/core/config.js'

const { width, height } = getDeviceInfo()

export default Page({
  onInit() {
    globalThis.ScreenReaderConfig = loadSettings()
    this.gestures = [
      { name: gettext('Swipe Up'), key: 'gesture_up', value: 'previous' },
      { name: gettext('Swipe Down'), key: 'gesture_down', value: 'next' },
      { name: gettext('Swipe Left'), key: 'gesture_left', value: 'context_menu' },
      { name: gettext('Swipe Right'), key: 'gesture_right', value: 'select' },
      { name: gettext('Double Tap'), key: 'gesture_double_tap', value: 'cycle_mode' },
      { name: gettext('Long Press'), key: 'gesture_long_press', value: 'toggle_mute' }
    ]
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
      text: gettext('Gestures & Input'),
      color: 0xffffff,
      align_h: 2,
      align_v: 2,
      text_size: 28
    })

    const config = globalThis.ScreenReaderConfig || {}

    root.createWidget(widget.SCROLL_LIST, {
      x: 0,
      y: 70,
      w: width,
      h: height - 70,
      item_height: 90,
      item_space: 10,
      item_config: [
        {
          type_id: 1,
          item_bg_color: 0x333333,
          item_bg_radius: 10,
          text_view: [
            {
              x: 20,
              y: 10,
              w: width - 40,
              h: 40,
              key: 'name',
              color: 0xffffff,
              text_size: 22,
              align_v: 2
            },
            {
              x: 20,
              y: 50,
              w: width - 40,
              h: 30,
              key: 'displayValue',
              color: 0xaaaaaa,
              text_size: 18,
              align_v: 2
            }
          ]
        }
      ],
      data_array: this.gestures.map((g) => ({
        ...g,
        displayValue: config[g.key] || g.value,
        type_id: 1
      })),
      data_count: this.gestures.length,
      item_click_func: (list, index) => {
        const item = this.gestures[index]
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
