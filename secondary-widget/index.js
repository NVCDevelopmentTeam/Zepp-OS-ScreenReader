import { createWidget, widget, prop } from '@zos/ui'
import { getDeviceInfo } from '@zos/device'
import { localStorage } from '@zos/storage'

const { width } = getDeviceInfo()
// `hmStorage` is a Zepp OS 1.0-era global, not part of the 2.0 API this
// project targets - using the real `localStorage` from `@zos/storage`
// instead (same persistence API lib/core/config.js writes settings with,
// so this widget reads genuinely current state instead of always falling
// through to the no-op stub's `getItem() => null`).
const storage = localStorage
SecondaryWidget({
  build() {
    const configStr = storage.getItem('screenReaderConfig')
    let isMuted = false
    let isEnabled = true
    if (configStr) {
      try {
        const config = JSON.parse(configStr)
        isMuted = !!config.muted
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
      text: isEnabled ? 'ZSR: ON' : 'ZSR: OFF',
      text_size: px(28),
      color: isEnabled ? 0x00ff00 : 0xff4444,
      align_h: 2
    })

    createWidget(widget.TEXT, {
      x: 0,
      y: px(42),
      w: width,
      h: px(30),
      text: 'ZSR Quick Actions',
      color: 0xffffff,
      align_h: 2
    })

    const muteBtn = createWidget(widget.BUTTON, {
      x: px(40),
      y: px(80),
      w: width - px(80),
      h: px(60),
      text: isMuted ? 'Unmute' : 'Mute',
      color: 0xffffff,
      normal_color: isMuted ? 0x00aa00 : 0xaa0000,
      radius: px(30),
      click_func: () => {
        isMuted = !isMuted
        const currentConfig = storage.getItem('screenReaderConfig')
        if (currentConfig) {
          try {
            const config = JSON.parse(currentConfig)
            config.muted = isMuted
            storage.setItem('screenReaderConfig', JSON.stringify(config))
          } catch (_e) {
            // Ignore parse errors
          }
        }

        muteBtn.setProperty(prop.TEXT, isMuted ? 'Unmute' : 'Mute')
        muteBtn.setProperty(prop.MORE, {
          normal_color: isMuted ? 0x00aa00 : 0xaa0000
        })
      }
    })

    createWidget(widget.BUTTON, {
      x: px(40),
      y: px(150),
      w: width - px(80),
      h: px(60),
      text: 'Settings',
      color: 0xffffff,
      normal_color: 0x333333,
      radius: px(30),
      click_func: () => {
        // Quick access to settings
      }
    })
  }
})
