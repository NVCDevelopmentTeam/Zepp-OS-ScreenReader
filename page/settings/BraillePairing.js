import '../../lib/utils/polyfills.js'
import { widget } from '@zos/ui'
import { gettext, format } from '../../lib/utils/i18n.js'
import { safeDeviceInfo } from '../../lib/utils/deviceInfo.js'
import { replace, back } from '@zos/router'
import { loadSettings } from '../../lib/core/config.js'
import BrailleService from '../../lib/core/braille.js'
import ScreenReader from '../../lib/core/readerProxy.js'

import { ZSRPage } from '../../lib/core/zsrPage.js'
import { createWidget, createChild } from '../../lib/core/zsrWidgets.js'
import { guard, safeTimeout } from '../../lib/utils/safeCall.js'
import { px } from '../../lib/utils/px.js'
const { width, height } = safeDeviceInfo()

export default ZSRPage({
  onInit() {
    globalThis.ScreenReaderConfig = loadSettings()
    this.devices = []
    this.isScanning = false
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
      y: px(10),
      w: width,
      h: px(50),
      text: gettext('Braille Pairing'),
      color: 0xffffff,
      align_h: 2,
      align_v: 2,
      text_size: px(28)
    })

    const statusText = this.isScanning ? gettext('Scanning...') : gettext('Ready to scan')
    createChild(root, widget.TEXT, {
      x: px(20),
      y: px(60),
      w: width - px(40),
      h: px(40),
      text: statusText,
      color: 0xaaaaaa,
      align_h: 2,
      text_size: px(20)
    })

    if (this.devices.length === 0) {
      createChild(root, widget.TEXT, {
        x: px(20),
        y: px(150),
        w: width - px(40),
        h: px(100),
        text: gettext('No displays found'),
        color: 0x666666,
        align_h: 2,
        align_v: 2,
        text_size: px(22)
      })
    } else {
      createChild(root, widget.SCROLL_LIST, {
        x: 0,
        y: px(110),
        w: width,
        h: height - px(200),
        item_height: px(80),
        item_space: 5,
        item_config: [
          {
            type_id: 1,
            item_bg_color: 0x333333,
            item_bg_radius: 10,
            text_view: [
              {
                x: px(20),
                y: 0,
                w: width - px(40),
                h: px(80),
                key: 'name',
                color: 0xffffff,
                text_size: px(22),
                align_v: 2
              }
            ]
          }
        ],
        data_array: this.devices,
        data_count: this.devices.length,
        item_click_func: (list, index) => {
          const device = this.devices[index]
          this.connect(device)
        }
      })
    }

    createChild(root, widget.BUTTON, {
      x: px(40),
      y: height - px(80),
      w: width - px(80),
      h: px(60),
      text: this.isScanning ? gettext('Stop Scan') : gettext('Start Scan'),
      color: 0xffffff,
      normal_color: this.isScanning ? 0xaa0000 : 0x00aa00,
      press_color: 0x666666,
      radius: px(30),
      click_func: guard(() => {
        if (this.isScanning) this.stopScan()
        else this.startScan()
      }, 'click_func')
    })

    return root
  },

  async startScan() {
    this.isScanning = true
    this.devices = []
    ScreenReader.speak(gettext('Scanning for Braille displays'), { priority: 'high' })

    // Refresh UI
    replace({ url: 'page/settings/BraillePairing' })

    // Simulating finding a device
    safeTimeout(() => {
      this.devices = [{ name: 'Braille Focus 40', id: '12:34:56:78' }]
      replace({ url: 'page/settings/BraillePairing' })
    }, 2000)
  },

  stopScan() {
    this.isScanning = false
    replace({ url: 'page/settings/BraillePairing' })
  },

  async connect(device) {
    ScreenReader.speak(format(gettext('Connecting to {0}'), device.name), { priority: 'high' })
    await BrailleService.connectToDisplay(device.id)
    ScreenReader.speak(format(gettext('Connected to {0}'), device.name), { priority: 'high' })
    back()
  }
})
