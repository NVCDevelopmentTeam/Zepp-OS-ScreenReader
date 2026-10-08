import { widget, text_style } from '@zos/ui'
import { gettext } from '../../lib/utils/i18n.js'
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
      text: gettext('Introduction'),
      color: 0xffffff,
      align_h: 2,
      align_v: 2,
      text_size: 28
    })

    createChild(root, widget.TEXT, {
      x: 20,
      y: 80,
      w: width - 40,
      h: 600,
      text: gettext(
        'ZSR (Zepp OS Screen Reader) is a mission-critical accessibility service for blind and low-vision users on Amazfit devices.\n\nOur mission is to enable independent use of 100% of smartwatch features without sighted assistance.\n\nDeveloped by NVCDevelopmentTeam.'
      ),
      color: 0xaaaaaa,
      text_size: 20,
      text_style: text_style.WRAP
    })

    return root
  }
})
