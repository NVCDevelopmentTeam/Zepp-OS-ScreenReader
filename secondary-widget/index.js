/* global px */
import { createWidget, widget, prop } from '@zos/ui'
import { getDeviceInfo } from '@zos/device'

const { width } = getDeviceInfo()
const storage =
  typeof globalThis.hmStorage !== 'undefined'
    ? globalThis.hmStorage
    : {
        setItem: () => {},
        getItem: () => null
      }
SecondaryWidget({
  build() {
    const configStr = storage.getItem('screenReaderConfig')
    let isMuted = false
    if (configStr) {
      try {
        const config = JSON.parse(configStr)
        isMuted = !!config.muted
      } catch (_e) {
        console.log('Failed to parse config in widget')
      }
    }

    createWidget(widget.TEXT, {
      x: 0,
      y: px(10),
      w: width,
      h: px(40),
      text: 'ZSR Quick Actions',
      color: 0xffffff,
      align_h: 2
    })

    createWidget(widget.BUTTON, {
      x: px(40),
      y: px(60),
      w: width - px(80),
      h: px(60),
      text: isMuted ? 'Unmute' : 'Mute',
      color: 0xffffff,
      normal_color: isMuted ? 0x00aa00 : 0xaa0000,
      radius: px(30),
      click_func: (btn) => {
        // Toggle in storage - the app will pick it up via message or direct read
        isMuted = !isMuted
        const currentConfig = storage.getItem('screenReaderConfig')
        if (currentConfig) {
          try {
            const config = JSON.parse(currentConfig)
            config.muted = isMuted
            storage.setItem('screenReaderConfig', JSON.stringify(config))
          } catch (_e) {
            console.log('Failed to update config from widget')
          }
        }

        btn.setProperty(prop.TEXT, isMuted ? 'Unmute' : 'Mute')
        btn.setProperty(prop.MORE, {
          normal_color: isMuted ? 0x00aa00 : 0xaa0000
        })
      }
    })

    createWidget(widget.BUTTON, {
      x: px(40),
      y: px(130),
      w: width - px(80),
      h: px(60),
      text: 'Settings',
      color: 0xffffff,
      normal_color: 0x333333,
      radius: px(30),
      click_func: () => {
        // Handle settings navigation if possible from widget
      }
    })
  }
})
