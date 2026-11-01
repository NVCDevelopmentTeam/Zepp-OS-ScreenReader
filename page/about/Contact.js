import '../../lib/utils/polyfills.js'
import { widget, text_style } from '@zos/ui'
import { gettext } from '../../lib/utils/i18n.js'
import { safeDeviceInfo } from '../../lib/utils/deviceInfo.js'
import { loadSettings } from '../../lib/core/config.js'
import { describeDiagnostics } from '../../lib/utils/featureSupport.js'
import { sendReportAndSpeakResult } from '../../lib/utils/diagnosticReport.js'
import ScreenReader from '../../lib/core/readerProxy.js'

import { ZSRPage } from '../../lib/core/zsrPage.js'
import { createWidget, createChild } from '../../lib/core/zsrWidgets.js'
import { guard } from '../../lib/utils/safeCall.js'
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
      text: gettext('Contact & Feedback'),
      color: 0xffffff,
      align_h: 2,
      align_v: 2,
      text_size: px(28)
    })

    createChild(root, widget.TEXT, {
      x: px(20),
      y: px(80),
      w: width - px(40),
      h: px(400),
      text: gettext(
        'We value your feedback to make ZSR better.\n\nPlease visit our website to report bugs or request features:\n\nhttps://zeppreader.com/contact\n\nEmail: support@zeppreader.com'
      ),
      color: 0xaaaaaa,
      text_size: px(20),
      text_style: text_style.WRAP
    })

    // Diagnostics to attach to a bug report: ZSR version, Zepp OS API level,
    // device model and which features this watch supports. No personal data.
    createChild(root, widget.BUTTON, {
      x: px(40),
      y: height - px(110),
      w: width - px(80),
      h: px(60),
      text: gettext('Read diagnostics'),
      color: 0xffffff,
      normal_color: 0x333333,
      press_color: 0x666666,
      radius: px(30),
      click_func: guard(
        () => ScreenReader.speak(describeDiagnostics(), { priority: 'high' }),
        'click_func'
      )
    })

    // Hands the same report to the phone, where the Zepp app offers it as a
    // ready-made e-mail. This is how a blind user reports a problem alone.
    createChild(root, widget.BUTTON, {
      x: px(40),
      y: height - px(180),
      w: width - px(80),
      h: px(60),
      text: gettext('Send report to phone'),
      color: 0xffffff,
      normal_color: 0x333333,
      press_color: 0x666666,
      radius: px(30),
      click_func: guard(() => sendReportAndSpeakResult(), 'click_func')
    })

    return root
  }
})
