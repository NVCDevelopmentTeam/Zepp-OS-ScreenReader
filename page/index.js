import { widget } from '@zos/ui'
import { safeDeviceInfo } from '../lib/utils/deviceInfo.js'
import { bootSummary, getBootErrors, drawErrorPanel } from '../lib/utils/bootErrors.js'
import { log } from '@zos/utils'
import { replace } from '@zos/router'
import ScreenReader from '../lib/core/readerProxy.js'
import { logger } from '../lib/utils/logger.js'

import { ZSRPage } from '../lib/core/zsrPage.js'
import { createWidget, createChild } from '../lib/core/zsrWidgets.js'
import { px } from '../lib/utils/px.js'
import { gettext } from '../lib/utils/i18n.js'
export default ZSRPage({
  onInit() {
    log.info('Page index onInit')
    const timeout = setTimeout(() => {
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
    // If anything failed while starting, keep the problem on screen for a while so a
    // sighted helper can read or photograph it, THEN carry on. (A silent blank or
    // vanishing screen gives nobody anything to report.)
    if (getBootErrors().length > 0 && !this.errorsShown) {
      this.errorsShown = true
      drawErrorPanel('ZSR started with problems')
      setTimeout(() => this.navigateToWelcome(), 20000)
      return
    }
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

    // Build + capability line, so a photo of this screen identifies the setup.
    createChild(group, widget.TEXT, {
      x: 0,
      y: height - px(70),
      w: width,
      h: px(30),
      text: bootSummary(),
      color: 0x777777,
      align_h: 2,
      text_size: px(14)
    })

    return group
  }
})
