import { createWidget, widget } from '@zos/ui'
import { gettext } from '@zos/i18n'
import { getDeviceInfo } from '@zos/device'
import { replace } from '@zos/router'
import { saveSettings, loadSettings } from '../../lib/core/config.js'
import VisionService from '../../lib/core/visionService.js'

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

    const config = globalThis.ScreenReaderConfig

    root.createWidget(widget.TEXT, {
      x: 0,
      y: 20,
      w: width,
      h: 50,
      text: gettext('Vision Settings'),
      color: 0xffffff,
      align_h: 2,
      align_v: 2,
      text_size: 28
    })

    // Screen Curtain
    this.createToggle(
      root,
      100,
      gettext('Screen Curtain'),
      !!VisionService.screenDimmed,
      (_val) => {
        VisionService.toggleScreenDimming(root)
        replace({ url: 'page/settings/Vision' })
      }
    )

    // Explore Mode
    this.createToggle(root, 180, gettext('Explore Mode'), !!config.exploreMode, (val) => {
      config.exploreMode = val
      saveSettings(config)
    })

    // Magnification
    this.createToggle(root, 260, gettext('Magnification'), !!config.magnification, (val) => {
      config.magnification = val
      saveSettings(config)
    })

    return root
  },

  createToggle(root, y, label, checked, onChange) {
    root.createWidget(widget.TEXT, {
      x: 40,
      y: y,
      w: width - 150,
      h: 60,
      text: label,
      color: 0xffffff,
      text_size: 24,
      align_v: 2
    })

    root.createWidget(widget.SLIDE_SWITCH, {
      x: width - 110,
      y: y + 10,
      w: 80,
      h: 40,
      checked: checked,
      select_bg: 0x00aa00,
      unselect_bg: 0x666666,
      checked_change_func: (val) => {
        onChange(val)
      }
    })
  }
})
