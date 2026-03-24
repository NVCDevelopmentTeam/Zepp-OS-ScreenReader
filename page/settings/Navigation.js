import { createWidget, widget } from '@zos/ui'
import { gettext } from '@zos/i18n'
import { getDeviceInfo } from '@zos/device'
import { replace } from '@zos/router'
import { loadSettings, saveSettings } from '../../lib/core/config.js'

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
      text: gettext('Navigation Settings'),
      color: 0xffffff,
      align_h: 2,
      align_v: 2,
      text_size: 28
    })

    this.createToggle(root, 100, gettext('Review Cursor'), !!config.reviewCursor, (val) => {
      config.reviewCursor = val
      saveSettings(config)
    })

    // Browse Mode Type Status
    const browseModeType = config.browseModeType || 'heading'
    root.createWidget(widget.TEXT, {
      x: 40,
      y: 180,
      w: width - 80,
      h: 40,
      text: `${gettext('Browse by')}: ${browseModeType.toUpperCase()}`,
      color: 0xaaaaaa,
      text_size: 24,
      align_v: 2
    })

    root.createWidget(widget.BUTTON, {
      x: 40,
      y: 230,
      w: width - 80,
      h: 60,
      text: gettext('Change Type'),
      color: 0xffffff,
      normal_color: 0x333333,
      press_color: 0x555555,
      radius: 30,
      click_func: () => {
        const types = ['heading', 'link', 'button', 'list_item', 'default']
        let nextIndex = (types.indexOf(browseModeType) + 1) % types.length
        config.browseModeType = types[nextIndex]
        saveSettings(config)
        replace({ url: 'page/settings/Navigation' })
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
