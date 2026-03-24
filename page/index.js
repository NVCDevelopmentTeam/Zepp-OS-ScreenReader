/* global px */
import { createWidget, widget } from '@zos/ui'
import { getDeviceInfo } from '@zos/device'
import { log } from '@zos/utils'
import { replace } from '@zos/router'
import ScreenReader from '../lib/core/screenReader.js'
import { logger } from '../lib/utils/logger.js'

export default Page({
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
    replace({
      url: 'page/home/Welcome',
      params: { initialized: true }
    })
  },

  build() {
    const { width, height } = getDeviceInfo()
    const style = {
      x: 0,
      y: 0,
      w: width,
      h: height
    }
    const group = createWidget(widget.GROUP, style)

    group.createWidget(widget.TEXT, {
      x: 0,
      y: (height - px(40)) / 2 - px(40),
      w: width,
      h: px(40),
      text: 'ZSR',
      color: 0xffffff,
      align_h: 2,
      text_size: px(36)
    })

    group.createWidget(widget.TEXT, {
      x: 0,
      y: (height - px(40)) / 2 + px(20),
      w: width,
      h: px(40),
      text: 'Initializing...',
      color: 0xaaaaaa,
      align_h: 2,
      text_size: px(20)
    })

    return group
  }
})
