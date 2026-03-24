import { createWidget, widget } from '@zos/ui'
import { getDeviceInfo } from '@zos/device'
import { loadSettings } from '../../lib/core/config.js'

const { width, height } = getDeviceInfo()

export default Page({
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

    root.createWidget(widget.TEXT, {
      x: 0,
      y: 20,
      w: width,
      h: 50,
      text: "What's New",
      color: 0xffffff,
      align_h: 2,
      align_v: 2,
      text_size: 28
    })

    const news = [
      '• Added Amazfit Bip 6 support',
      '• Enhanced sensor readings',
      '• Fixed circular dependencies',
      '• Standardized settings menu',
      '• Dual TTS engine support',
      '• Performance optimizations'
    ]

    root.createWidget(widget.TEXT, {
      x: 20,
      y: 80,
      w: width - 40,
      h: 400,
      text: news.join('\n\n'),
      color: 0xaaaaaa,
      text_size: 20,
      text_style: widget.TEXT_STYLE_WRAP
    })

    return root
  }
})
