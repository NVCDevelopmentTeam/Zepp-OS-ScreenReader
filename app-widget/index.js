/* global px */
import { createWidget, widget } from '@zos/ui'
import { push } from '@zos/router'
import { getDeviceInfo } from '@zos/device'

const { width } = getDeviceInfo()
const storage =
  typeof globalThis.hmStorage !== 'undefined'
    ? globalThis.hmStorage
    : {
        setItem: () => {},
        getItem: () => null
      }

AppWidget({
  build() {
    const configStr = storage.getItem('screenReaderConfig')
    let isEnabled = false
    if (configStr) {
      try {
        const config = JSON.parse(configStr)
        isEnabled = !!config.enabled
      } catch (_e) {
        // Silently ignore parsing errors
      }
    }

    createWidget(widget.TEXT, {
      x: 0,
      y: px(10),
      w: width,
      h: px(40),
      text: 'ZSR Status',
      color: 0xffffff,
      align_h: 2
    })

    createWidget(widget.TEXT, {
      x: 0,
      y: px(50),
      w: width,
      h: px(60),
      text: isEnabled ? 'ENABLED' : 'DISABLED',
      color: isEnabled ? 0x00ff00 : 0xff0000,
      align_h: 2,
      text_size: px(30)
    })

    createWidget(widget.BUTTON, {
      x: (width - px(200)) / 2,
      y: px(120),
      w: px(200),
      h: px(60),
      text: 'Open ZSR',
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
