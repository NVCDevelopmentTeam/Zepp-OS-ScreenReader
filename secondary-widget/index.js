import '../lib/utils/polyfills.js'
import { push } from '@zos/router'
import { createWidget, widget, prop } from '@zos/ui'
import { safeDeviceInfo } from '../lib/utils/deviceInfo.js'
import { localStorage } from '@zos/storage'
import { getStored } from '../lib/utils/storage.js'

import { px } from '../lib/utils/px.js'
import { gettext } from '../lib/utils/i18n.js'
import { guard } from '../lib/utils/safeCall.js'
const { width } = safeDeviceInfo()
// `hmStorage` is a Zepp OS 1.0-era global, not part of the 2.0 API this
// project targets - using the real `localStorage` from `@zos/storage`
// instead (same persistence API lib/core/config.js writes settings with,
// so this widget reads genuinely current state instead of always falling
// through to the no-op stub's `getItem() => null`).
const storage = localStorage
SecondaryWidget({
  build() {
    const configStr = getStored('screenReaderConfig')
    let isMuted = false
    let isEnabled = true
    if (configStr) {
      try {
        const config = JSON.parse(configStr)
        isMuted = config.speechMuted === true || config.muted === true
        isEnabled = config.screenReaderEnabled !== false
      } catch (_e) {
        // Ignore JSON parse errors
      }
    }

    // Visible ON/OFF status - lets a sighted person glance at this card
    // and immediately know whether ZSR is currently active, without
    // needing to understand any audio cues.
    createWidget(widget.TEXT, {
      x: 0,
      y: px(10),
      w: width,
      h: px(30),
      text: isEnabled ? gettext('ZSR: ON') : gettext('ZSR: OFF'),
      text_size: px(28),
      color: isEnabled ? 0x00ff00 : 0xff4444,
      align_h: 2
    })

    createWidget(widget.TEXT, {
      x: 0,
      y: px(42),
      w: width,
      h: px(30),
      text: gettext('ZSR Quick Actions'),
      color: 0xffffff,
      align_h: 2
    })

    const muteBtn = createWidget(widget.BUTTON, {
      x: px(40),
      y: px(80),
      w: width - px(80),
      h: px(60),
      text: isMuted ? gettext('Unmute') : gettext('Mute'),
      color: 0xffffff,
      normal_color: isMuted ? 0x00aa00 : 0xaa0000,
      radius: px(30),
      click_func: guard(() => {
        isMuted = !isMuted
        const currentConfig = getStored('screenReaderConfig')
        if (currentConfig) {
          try {
            const config = JSON.parse(currentConfig)
            config.speechMuted = isMuted
            storage.setItem('screenReaderConfig', JSON.stringify(config))
          } catch (_e) {
            // Ignore parse errors
          }
        }

        muteBtn.setProperty(prop.MORE, {
          text: isMuted ? gettext('Unmute') : gettext('Mute'),
          normal_color: isMuted ? 0x00aa00 : 0xaa0000
        })
      }, 'click_func')
    })

    createWidget(widget.BUTTON, {
      x: px(40),
      y: px(150),
      w: width - px(80),
      h: px(60),
      text: gettext('Settings'),
      color: 0xffffff,
      normal_color: 0x333333,
      radius: px(30),
      click_func: guard(() => {
        push({ url: 'page/home/Settings' })
      }, 'click_func')
    })
  }
})
