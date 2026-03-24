import { createWidget, widget } from '@zos/ui'
import { gettext } from '@zos/i18n'
import { getDeviceInfo } from '@zos/device'
import { push } from '@zos/router'
import { loadSettings } from '../../lib/core/config.js'

const { width, height } = getDeviceInfo()

export default Page({
  onInit() {
    this.state = {
      categories: [
        { name: gettext('General'), url: 'page/settings/General', type_id: 1 },
        { name: gettext('Speech'), url: 'page/settings/Speech', type_id: 1 },
        { name: gettext('Vision'), url: 'page/settings/Vision', type_id: 1 },
        { name: gettext('Gestures & Input'), url: 'page/settings/GesturesInput', type_id: 1 },
        { name: gettext('Notifications'), url: 'page/settings/Notifications', type_id: 1 },
        {
          name: gettext('Object Presentation'),
          url: 'page/settings/ObjectPresentation',
          type_id: 1
        },
        { name: gettext('Cursor & Navigation'), url: 'page/settings/Navigation', type_id: 1 },
        { name: gettext('Audio & Braille'), url: 'page/settings/AudioBraille', type_id: 1 },
        { name: gettext('Input Composition'), url: 'page/settings/InputComposition', type_id: 1 },
        { name: gettext('Speech History'), url: 'page/settings/SpeechHistory', type_id: 1 },
        { name: gettext('Remote Access'), url: 'page/settings/RemoteAccess', type_id: 1 },
        { name: gettext('Document Settings'), url: 'page/settings/Document', type_id: 1 },
        { name: gettext('Check for Updates'), url: 'page/about/UpdateChecker', type_id: 1 },
        { name: gettext('Developer Options'), url: 'setting/AdvancedSettings', type_id: 1 }
      ]
    }
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
      text: gettext('ZSR Settings'),
      color: 0xffffff,
      align_h: 2,
      align_v: 2,
      text_size: 28
    })

    root.createWidget(widget.SCROLL_LIST, {
      x: 0,
      y: 70,
      w: width,
      h: height - 70,
      item_height: 80,
      item_space: 10,
      item_config: [
        {
          type_id: 1,
          item_bg_color: 0x333333,
          item_bg_radius: 10,
          text_view: [
            {
              x: 20,
              y: 0,
              w: width - 40,
              h: 80,
              key: 'name',
              color: 0xffffff,
              text_size: 24,
              align_h: 1,
              align_v: 2
            }
          ]
        }
      ],
      data_array: this.state.categories,
      data_count: this.state.categories.length,
      item_click_func: (list, index) => {
        const item = this.state.categories[index]
        push({ url: item.url })
      }
    })

    return root
  }
})
