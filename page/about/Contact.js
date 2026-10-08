import { widget, text_style } from '@zos/ui'
import { gettext } from '../../lib/utils/i18n.js'
import { safeDeviceInfo } from '../../lib/utils/deviceInfo.js'
import { loadSettings } from '../../lib/core/config.js'
import { describeDiagnostics } from '../../lib/utils/featureSupport.js'
import ScreenReader from '../../lib/core/readerProxy.js'

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
      text: gettext('Contact & Feedback'),
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
        'We value your feedback to make ZSR better.\n\nPlease visit our website to report bugs or request features:\n\nhttps://zeppreader.com/contact\n\nEmail: support@zeppreader.com'
      ),
      color: 0xaaaaaa,
      text_size: 20,
      text_style: text_style.WRAP
    })

    // Diagnostics to attach to a bug report: ZSR version, Zepp OS API level,
    // device model and which features this watch supports. No personal data.
    createChild(root, widget.BUTTON, {
      x: 40,
      y: height - 110,
      w: width - 80,
      h: 60,
      text: gettext('Read diagnostics'),
      color: 0xffffff,
      normal_color: 0x333333,
      press_color: 0x666666,
      radius: 30,
      click_func: () => ScreenReader.speak(describeDiagnostics(), { priority: 'high' })
    })

    return root
  }
})
