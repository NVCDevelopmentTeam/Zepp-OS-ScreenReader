import { createWidget, widget } from '@zos/ui'
import { gettext } from '@zos/i18n'
import { getDeviceInfo } from '@zos/device'
import { Battery } from '@zos/sensor'
import { replace, push } from '@zos/router'
import ScreenReader from '../../lib/core/screenReader.js'
import { loadSettings } from '../../lib/core/config.js'

const { width, height } = getDeviceInfo()

export default Page({
  onInit() {
    this.state = {
      battery: new Battery()
    }
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

    const batteryLevel = this.state.battery ? this.state.battery.getCurrent() : '--'
    const srStatus = ScreenReader.enabled ? gettext('Enabled') : gettext('Disabled')
    const config = globalThis.ScreenReaderConfig || {}
    const activeTTS = config.primaryTTSEngine || 'Espeak'

    // Background or header area
    root.createWidget(widget.FILL_RECT, {
      x: 0,
      y: 0,
      w: width,
      h: 80,
      color: 0x111111
    })

    root.createWidget(widget.TEXT, {
      x: 0,
      y: 10,
      w: width,
      h: 40,
      text: gettext('ZSR Dashboard'),
      color: 0xffffff,
      align_h: 2,
      align_v: 2,
      text_size: 28
    })

    // Status Section
    const statusText = `${gettext('Status')}: ${srStatus} | TTS: ${activeTTS.toUpperCase()}\n${gettext('Battery')}: ${batteryLevel}%`
    root.createWidget(widget.TEXT, {
      x: 20,
      y: 85,
      w: width - 40,
      h: 60,
      text: statusText,
      color: 0xaaaaaa,
      text_size: 20,
      text_style: widget.TEXT_STYLE_WRAP,
      align_h: 2
    })

    const buttonWidth = width - 80
    const buttonX = 40

    // Quick Toggle ZSR
    root.createWidget(widget.BUTTON, {
      x: buttonX,
      y: 155,
      w: buttonWidth,
      h: 65,
      text: ScreenReader.enabled ? gettext('Turn OFF ZSR') : gettext('Turn ON ZSR'),
      color: 0xffffff,
      normal_color: ScreenReader.enabled ? 0xaa0000 : 0x00aa00,
      press_color: 0x666666,
      radius: 32,
      click_func: () => {
        ScreenReader.toggleEnabled()
        replace({ url: 'page/home/Welcome' })
      }
    })

    // Navigation Items
    const navItems = [
      { name: gettext('Settings'), url: 'page/home/Settings', type_id: 1 },
      { name: gettext('User Guide'), url: 'page/userGuide/userGuide', type_id: 1 },
      { name: gettext('Sensors'), url: 'page/home/Sensors', type_id: 1 },
      { name: gettext('Speech History'), url: 'page/home/History', type_id: 1 },
      { name: gettext('About'), url: 'page/about/AppInfo', type_id: 1 }
    ]

    root.createWidget(widget.SCROLL_LIST, {
      x: 20,
      y: 235,
      w: width - 40,
      h: height - 235,
      item_height: 75,
      item_space: 8,
      item_config: [
        {
          type_id: 1,
          item_bg_color: 0x222222,
          item_bg_radius: 12,
          text_view: [
            {
              x: 20,
              y: 0,
              w: width - 80,
              h: 75,
              key: 'name',
              color: 0xffffff,
              text_size: 24,
              align_h: 1,
              align_v: 2
            }
          ]
        }
      ],
      data_array: navItems,
      data_count: navItems.length,
      item_click_func: (list, index) => {
        push({ url: navItems[index].url })
      }
    })

    return root
  }
})
