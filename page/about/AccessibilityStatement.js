import { widget, text_style } from '@zos/ui'
import { gettext } from '../../lib/utils/i18n.js'
import { getDeviceInfo } from '@zos/device'
import { loadSettings } from '../../lib/core/config.js'

import { ZSRPage } from '../../lib/core/zsrPage.js'
import { createWidget, createChild } from '../../lib/core/zsrWidgets.js'
const { width, height } = getDeviceInfo()

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
      text: gettext('Accessibility'),
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
      text: gettext(
        'ZSR is committed to WCAG 2.1 Level AA compliance.\n\nOur goal is to make every interface element on Zepp OS fully accessible to blind and low-vision users.\n\nStatement: https://zeppreader.com/accessibility-statement'
      ),
      color: 0xaaaaaa,
      text_size: 20,
      text_style: text_style.WRAP
    })

    return root
  }
})
