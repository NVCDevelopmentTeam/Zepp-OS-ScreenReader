/**
 * Home (dashboard): on/off toggle, status and the main menu.
 * The first-run welcome screen is page/home/Welcome.js.
 */
import { widget, text_style } from '@zos/ui'
import { getDeviceInfo } from '@zos/device'
import { Battery } from '@zos/sensor'
import { replace, push } from '@zos/router'
import { log } from '@zos/utils'
import { gettext, format } from '../../lib/utils/i18n.js'
import { px } from '../../lib/utils/px.js'
import ScreenReader from '../../lib/core/readerProxy.js'
import { loadSettings } from '../../lib/core/config.js'
import { ZSRPage } from '../../lib/core/zsrPage.js'
import { createWidget, createChild } from '../../lib/core/zsrWidgets.js'

const ENGINE_LABELS = { espeak: 'eSpeak', native: 'Native TTS', none: 'None' }

/** Battery level, or null when the sensor/permission is unavailable. */
function readBattery() {
  try {
    return new Battery().getCurrent()
  } catch (e) {
    log.warn('Battery unavailable: ' + (e && e.message))
    return null
  }
}

export default ZSRPage({
  onInit() {
    if (!globalThis.ScreenReaderConfig) {
      globalThis.ScreenReaderConfig = loadSettings()
    }
  },

  build() {
    const { width, height } = getDeviceInfo()
    const margin = px(40)
    const enabled = !!ScreenReader.enabled
    const config = globalThis.ScreenReaderConfig || {}
    const engine = ENGINE_LABELS[config.primaryTTSEngine] || config.primaryTTSEngine || 'eSpeak'
    const battery = readBattery()

    const root = createWidget(widget.GROUP, { x: 0, y: 0, w: width, h: height })

    createChild(root, widget.FILL_RECT, {
      x: 0,
      y: 0,
      w: width,
      h: px(80),
      color: 0x111111
    })
    createChild(root, widget.TEXT, {
      x: 0,
      y: px(10),
      w: width,
      h: px(40),
      text: gettext('ZSR Dashboard'),
      color: 0xffffff,
      align_h: 2,
      align_v: 2,
      text_size: px(28)
    })

    const statusLine = format(
      gettext('Status: {0} | Speech engine: {1}'),
      enabled ? gettext('Enabled') : gettext('Disabled'),
      engine
    )
    const batteryLine = battery === null ? '' : '\n' + format(gettext('Battery: {0}%'), battery)
    createChild(root, widget.TEXT, {
      x: px(20),
      y: px(85),
      w: width - px(40),
      h: px(60),
      text: statusLine + batteryLine,
      color: 0xaaaaaa,
      text_size: px(20),
      text_style: text_style.WRAP,
      align_h: 2
    })

    createChild(root, widget.BUTTON, {
      x: margin,
      y: px(155),
      w: width - margin * 2,
      h: px(65),
      text: enabled ? gettext('Turn OFF ZSR') : gettext('Turn ON ZSR'),
      color: 0xffffff,
      normal_color: enabled ? 0xaa0000 : 0x00aa00,
      press_color: 0x666666,
      radius: px(32),
      click_func: () => {
        ScreenReader.toggleEnabled()
        replace({ url: 'page/home/index' })
      }
    })

    const navItems = [
      { name: gettext('Settings'), url: 'page/home/Settings' },
      { name: gettext('User Guide'), url: 'page/userGuide/userGuide' },
      { name: gettext('Sensors'), url: 'page/home/Sensors' },
      { name: gettext('Speech History'), url: 'page/home/History' },
      { name: gettext('About'), url: 'page/about/AppInfo' }
    ]

    // Each row is registered as its own focusable, activatable element by
    // zsrWidgets (see registerListItems), so it can be browsed and opened.
    createChild(root, widget.SCROLL_LIST, {
      x: px(20),
      y: px(235),
      w: width - px(40),
      h: height - px(235),
      item_height: px(75),
      item_space: px(8),
      item_config: [
        {
          type_id: 1,
          item_bg_color: 0x222222,
          item_bg_radius: px(12),
          text_view: [
            {
              x: px(20),
              y: 0,
              w: width - px(80),
              h: px(75),
              key: 'name',
              color: 0xffffff,
              text_size: px(24)
            }
          ],
          text_view_count: 1
        }
      ],
      item_config_count: 1,
      data_array: navItems,
      data_count: navItems.length,
      item_click_func: (_list, index) => {
        push({ url: navItems[index].url })
      }
    })
  }
})
