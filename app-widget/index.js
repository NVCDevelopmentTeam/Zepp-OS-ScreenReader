import { createWidget, widget } from '@zos/ui'
import { push } from '@zos/router'
import { localStorage } from '@zos/storage'
import { gettext } from '../lib/utils/i18n.js'
import { safeDeviceInfo } from '../lib/utils/deviceInfo.js'

import { px } from '../lib/utils/px.js'
const { width } = safeDeviceInfo()
// `hmStorage` is a Zepp OS 1.0 global and does not exist on API 2.0+, so the old
// code always fell back to a no-op store and the card always showed DISABLED.
// Same persistence API as lib/core/config.js (`localStorage`), no-op if unavailable.
const storage = localStorage || { setItem: () => {}, getItem: () => null }

AppWidget({
  build() {
    const configStr = storage.getItem('screenReaderConfig')
    let isEnabled = false
    if (configStr) {
      try {
        const config = JSON.parse(configStr)
        // settingsKey is 'screenReaderEnabled' (setting/GeneralSetting.js),
        // not 'enabled' - reading the wrong key meant this always showed
        // DISABLED regardless of the real state.
        isEnabled = config.screenReaderEnabled !== false
      } catch (_e) {
        // Silently ignore parsing errors
      }
    }

    createWidget(widget.TEXT, {
      x: 0,
      y: px(10),
      w: width,
      h: px(40),
      text: gettext('ZSR Status'),
      color: 0xffffff,
      align_h: 2
    })

    createWidget(widget.TEXT, {
      x: 0,
      y: px(50),
      w: width,
      h: px(60),
      text: isEnabled ? gettext('ENABLED') : gettext('DISABLED'),
      color: isEnabled ? 0x00ff00 : 0xff0000,
      align_h: 2,
      text_size: px(30)
    })

    createWidget(widget.BUTTON, {
      x: (width - px(200)) / 2,
      y: px(120),
      w: px(200),
      h: px(60),
      text: gettext('Open ZSR'),
      color: 0xffffff,
      normal_color: 0x333333,
      press_color: 0x666666,
      radius: px(30),
      click_func: () => {
        push({
          url: 'page/index',
          params: { from: 'widget' }
        })
      }
    })
  }
})
