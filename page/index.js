import '../lib/utils/polyfills.js'
import { widget } from '@zos/ui'
import { safeDeviceInfo } from '../lib/utils/deviceInfo.js'
import { getBootErrors, signalBootStatus } from '../lib/utils/bootErrors.js'
import { announceAndReportBootProblems } from '../lib/utils/diagnosticReport.js'
import { log } from '@zos/utils'
import { replace } from '@zos/router'
import ScreenReader from '../lib/core/readerProxy.js'
import { logger } from '../lib/utils/logger.js'

import { ZSRPage } from '../lib/core/zsrPage.js'
import { createWidget, createChild } from '../lib/core/zsrWidgets.js'
import { px } from '../lib/utils/px.js'
import { gettext } from '../lib/utils/i18n.js'
import { safeTimeout } from '../lib/utils/safeCall.js'
export default ZSRPage({
  onInit() {
    log.info('Page index onInit')
    // One pulse: ZSR has opened (felt, not seen or heard - speech needs the phone).
    signalBootStatus('started')
    const timeout = safeTimeout(() => {
      log.warn('Initialization timeout, forcing navigation')
      this.navigateToWelcome()
    }, 5000)

    ScreenReader.init()
      .then(() => {
        clearTimeout(timeout)
        this.navigateToWelcome()
      })
      .catch((error) => {
        clearTimeout(timeout)
        logger.error('Initialization failed:', error)
        // Re-render with error (if using a framework that supports it, otherwise we'd need to update widgets)
        // For standard Page, we just try to proceed or show something
        this.navigateToWelcome()
      })
  },

  navigateToWelcome() {
    // The 5 s timeout and a late init() result can both arrive; navigate only once.
    if (this.navigated) return
    this.navigated = true
    // A problem while starting is reported by vibration and speech (never drawn on
    // screen: the user cannot read it). Navigation continues so ZSR stays usable.
    if (getBootErrors().length > 0) announceAndReportBootProblems()
    // First launch shows the welcome page once; afterwards go straight Home.
    const seen = !!(globalThis.ScreenReaderConfig && globalThis.ScreenReaderConfig.welcomeSeen)
    replace({
      url: seen ? 'page/home/index' : 'page/home/Welcome',
      params: { initialized: true }
    })
  },

  build() {
    const { width, height } = safeDeviceInfo()
    const style = {
      x: 0,
      y: 0,
      w: width,
      h: height
    }
    const group = createWidget(widget.GROUP, style)

    createChild(group, widget.TEXT, {
      x: 0,
      y: (height - px(40)) / 2 - px(40),
      w: width,
      h: px(40),
      text: 'ZSR',
      color: 0xffffff,
      align_h: 2,
      text_size: px(36)
    })

    createChild(group, widget.TEXT, {
      x: 0,
      y: (height - px(40)) / 2 + px(20),
      w: width,
      h: px(40),
      text: gettext('Initializing...'),
      color: 0xaaaaaa,
      align_h: 2,
      text_size: px(20)
    })

    return group
  }
})
