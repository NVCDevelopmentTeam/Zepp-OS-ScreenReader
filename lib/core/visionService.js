import { widget } from '@zos/ui'
import { getDeviceInfo } from '@zos/device'
import { log } from '@zos/utils'

const { width, height } = getDeviceInfo()

class VisionService {
  constructor() {
    this.screenDimmed = false
    this.dimOverlay = null
  }

  toggleScreenDimming(rootGroup) {
    if (this.screenDimmed) {
      this.disableScreenDimming()
    } else {
      this.enableScreenDimming(rootGroup)
    }
    return this.screenDimmed
  }

  enableScreenDimming(rootGroup) {
    if (!rootGroup) return
    if (this.screenDimmed) return

    this.dimOverlay = rootGroup.createWidget(widget.FILL_RECT, {
      x: 0,
      y: 0,
      w: width,
      h: height,
      color: 0x000000,
      alpha: 255, // Full black for screen curtain
      z_index: 9999
    })

    // Block all touches on the overlay but we need to let gestures pass through?
    // Actually, screen curtain should still allow screen reader gestures.
    // If the overlay is on top, it might block gestures on the root group.
    // We should probably add the gestures to the overlay instead.

    this.screenDimmed = true
    log.info('Screen dimming (Curtain) enabled')
  }

  disableScreenDimming() {
    if (!this.screenDimmed) return
    if (this.dimOverlay) {
      if (typeof hmUI !== 'undefined') {
        hmUI.deleteWidget(this.dimOverlay)
      } else if (this.rootGroup && this.rootGroup.deleteWidget) {
        this.rootGroup.deleteWidget(this.dimOverlay)
      }
      this.dimOverlay = null
    }
    this.screenDimmed = false
    log.info('Screen dimming (Curtain) disabled')
  }
}

export default new VisionService()
