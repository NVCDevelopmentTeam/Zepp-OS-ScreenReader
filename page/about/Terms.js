import { widget, text_style } from '@zos/ui'
import { safeDeviceInfo } from '../../lib/utils/deviceInfo.js'
import { loadSettings } from '../../lib/core/config.js'

import { ZSRPage } from '../../lib/core/zsrPage.js'
import { createWidget, createChild } from '../../lib/core/zsrWidgets.js'
const { width, height } = safeDeviceInfo()

export default ZSRPage({
  onInit() {
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

    createChild(root, widget.TEXT, {
      x: 0,
      y: 20,
      w: width,
      h: 50,
      text: 'Terms of Service',
      color: 0xffffff,
      align_h: 2,
      align_v: 2,
      text_size: 28
    })

    createChild(root, widget.TEXT, {
      x: 20,
      y: 80,
      w: width - 40,
      h: 400,
      text: 'By using ZSR, you agree to the open-source terms of the MIT License.\n\nThe software is provided "AS IS", without warranty of any kind.\n\nFull terms: https://zeppreader.com',
      color: 0xaaaaaa,
      text_size: 20,
      text_style: text_style.WRAP
    })

    return root
  }
})
