import { createWidget, widget } from '@zos/ui'
import { gettext } from '@zos/i18n'
import { getDeviceInfo } from '@zos/device'
import { replace, back } from '@zos/router'
import { loadSettings } from '../../lib/core/config.js'
import BrailleService from '../../lib/core/braille.js'
import ScreenReader from '../../lib/core/screenReader.js'

const { width, height } = getDeviceInfo()

export default Page({
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

    root.createWidget(widget.TEXT, {
      x: 0,
      y: 10,
      w: width,
      h: 50,
      text: gettext('Braille Pairing'),
      color: 0xffffff,
      align_h: 2,
      align_v: 2,
      text_size: 28
    })

    const statusText = this.isScanning ? gettext('Scanning...') : gettext('Ready to scan')
    root.createWidget(widget.TEXT, {
      x: 20,
      y: 60,
      w: width - 40,
      h: 40,
      text: statusText,
      color: 0xaaaaaa,
      align_h: 2,
      text_size: 20
    })

    if (this.devices.length === 0) {
      root.createWidget(widget.TEXT, {
        x: 20,
        y: 150,
        w: width - 40,
        h: 100,
        text: gettext('No displays found'),
        color: 0x666666,
        align_h: 2,
        align_v: 2,
        text_size: 22
      })
    } else {
      root.createWidget(widget.SCROLL_LIST, {
        x: 0,
        y: 110,
        w: width,
        h: height - 200,
        item_height: 80,
        item_space: 5,
        item_config: [
          {
            type_id: 1,
            item_bg_color: 0x333333,
            item_bg_radius: 10,
            text_view: [
              {
                x: 20,
                y: 0,
                w: width - 40,
                h: 80,
                key: 'name',
                color: 0xffffff,
                text_size: 22,
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

    root.createWidget(widget.BUTTON, {
      x: 40,
      y: height - 80,
      w: width - 80,
      h: 60,
      text: this.isScanning ? gettext('Stop Scan') : gettext('Start Scan'),
      color: 0xffffff,
      normal_color: this.isScanning ? 0xaa0000 : 0x00aa00,
      press_color: 0x666666,
      radius: 30,
      click_func: () => {
        if (this.isScanning) this.stopScan()
        else this.startScan()
      }
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
    setTimeout(() => {
      this.devices = [{ name: 'Braille Focus 40', id: '12:34:56:78' }]
      replace({ url: 'page/settings/BraillePairing' })
    }, 2000)
  },

  stopScan() {
    this.isScanning = false
    replace({ url: 'page/settings/BraillePairing' })
  },

  async connect(device) {
    ScreenReader.speak(`${gettext('Connecting to')} ${device.name}`, { priority: 'high' })
    await BrailleService.connectToDisplay(device.id)
    ScreenReader.speak(`${gettext('Connected to')} ${device.name}`, { priority: 'high' })
    back()
  }
})
