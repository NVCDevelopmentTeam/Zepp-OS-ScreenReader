import { createWidget, widget } from '@zos/ui'
import { gettext } from '@zos/i18n'
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
      text: gettext('Introduction'),
      color: 0xffffff,
      align_h: 2,
      align_v: 2,
      text_size: 28
    })

    root.createWidget(widget.TEXT, {
      x: 20,
      y: 80,
      w: width - 40,
      h: 600,
      text: gettext(
        'ZSR (Zepp OS Screen Reader) is a mission-critical accessibility service for blind and low-vision users on Amazfit devices.\n\nOur mission is to enable independent use of 100% of smartwatch features without sighted assistance.\n\nDeveloped by NVCDevelopmentTeam.'
      ),
      color: 0xaaaaaa,
      text_size: 20,
      text_style: widget.TEXT_STYLE_WRAP
    })

    return root
  }
})
