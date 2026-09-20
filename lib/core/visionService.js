import { widget } from '@zos/ui'
import { getDeviceInfo } from '@zos/device'
import { log } from '@zos/utils'

const { width, height } = getDeviceInfo()

class VisionService {
  constructor() {
    this.screenDimmed = false
    this.dimOverlay = null
    /** @type {any} Stored root group reference for overlay removal. */
    this.rootGroup = null
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

    this.rootGroup = rootGroup
    this.dimOverlay = rootGroup.createWidget(widget.FILL_RECT, {
      x: 0,
      y: 0,
      w: width,
      h: height,
      color: 0x000000,
      alpha: 255, // Full black for screen curtain
      z_index: 9999
    })

    this.screenDimmed = true
    log.info('Screen curtain enabled')
  }

  disableScreenDimming() {
    if (!this.screenDimmed) return
    if (this.dimOverlay) {
      // Prefer deleteWidget from the root group if available (Zepp OS 2.0+).
      // Fall back to hmUI.deleteWidget for older firmware.
      try {
        if (this.rootGroup && typeof this.rootGroup.deleteWidget === 'function') {
          this.rootGroup.deleteWidget(this.dimOverlay)
        } else if (typeof globalThis.hmUI !== 'undefined') {
          globalThis.hmUI.deleteWidget(this.dimOverlay)
        } else {
          // Last resort: hide via setProperty if available.
          this.dimOverlay.setProperty && this.dimOverlay.setProperty(widget.prop.VISIBLE, false)
        }
      } catch (e) {
        log.warn('Failed to delete screen curtain overlay:', e)
      }
      this.dimOverlay = null
    }
    this.screenDimmed = false
    this.rootGroup = null
    log.info('Screen curtain disabled')
  }
}

export default new VisionService()
