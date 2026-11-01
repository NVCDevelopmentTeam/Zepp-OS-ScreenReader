import '../../lib/utils/polyfills.js'
import { widget } from '@zos/ui'
import { gettext } from '../../lib/utils/i18n.js'
import { safeDeviceInfo } from '../../lib/utils/deviceInfo.js'
import { replace } from '@zos/router'
import { loadSettings, saveSettings } from '../../lib/core/config.js'

import { ZSRPage } from '../../lib/core/zsrPage.js'
import { createWidget, createChild } from '../../lib/core/zsrWidgets.js'
import { guard } from '../../lib/utils/safeCall.js'
import { px } from '../../lib/utils/px.js'
const { width, height } = safeDeviceInfo()

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
      y: px(20),
      w: width,
      h: px(50),
      text: gettext('Navigation Settings'),
      color: 0xffffff,
      align_h: 2,
      align_v: 2,
      text_size: px(28)
    })

    this.createToggle(root, 100, gettext('Review Cursor'), !!config.reviewCursor, (val) => {
      config.reviewCursor = val
      saveSettings(config)
    })

    // Browse Mode Type Status
    const browseModeType = config.browseModeType || 'heading'
    createChild(root, widget.TEXT, {
      x: px(40),
      y: px(180),
      w: width - px(80),
      h: px(40),
      text: `${gettext('Browse by')}: ${browseModeType.toUpperCase()}`,
      color: 0xaaaaaa,
      text_size: px(24),
      align_v: 2
    })

    createChild(root, widget.BUTTON, {
      x: px(40),
      y: px(230),
      w: width - px(80),
      h: px(60),
      text: gettext('Change Type'),
      color: 0xffffff,
      normal_color: 0x333333,
      press_color: 0x555555,
      radius: px(30),
      click_func: guard(() => {
        const types = ['heading', 'link', 'button', 'list_item', 'default']
        let nextIndex = (types.indexOf(browseModeType) + 1) % types.length
        config.browseModeType = types[nextIndex]
        saveSettings(config)
        replace({ url: 'page/settings/Navigation' })
      }, 'click_func')
    })

    return root
  },

  createToggle(root, y, label, checked, onChange) {
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
})
