import '../../lib/utils/polyfills.js'
import { widget, text_style } from '@zos/ui'
import { safeDeviceInfo } from '../../lib/utils/deviceInfo.js'
import { loadSettings } from '../../lib/core/config.js'

import { ZSRPage } from '../../lib/core/zsrPage.js'
import { createWidget, createChild } from '../../lib/core/zsrWidgets.js'
import { px } from '../../lib/utils/px.js'
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
      y: px(20),
      w: width,
      h: px(50),
      text: "What's New",
      color: 0xffffff,
      align_h: 2,
      align_v: 2,
      text_size: px(28)
    })

    const news = [
      '• Added Amazfit Bip 6 support',
      '• Enhanced sensor readings',
      '• Fixed circular dependencies',
      '• Standardized settings menu',
      '• Dual TTS engine support',
      '• Performance optimizations'
    ]

    createChild(root, widget.TEXT, {
      x: px(20),
      y: px(80),
      w: width - px(40),
      h: px(400),
      text: news.join('\n\n'),
      color: 0xaaaaaa,
      text_size: px(20),
      text_style: text_style.WRAP
    })

    return root
  }
})
