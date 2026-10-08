import { widget, text_style, prop } from '@zos/ui'
import { gettext } from '../../lib/utils/i18n.js'
import { safeDeviceInfo } from '../../lib/utils/deviceInfo.js'
import AddonUpdater from '../../lib/utils/addonUpdater.js'
import ScreenReader from '../../lib/core/readerProxy.js'
import { loadSettings } from '../../lib/core/config.js'

import { ZSRPage } from '../../lib/core/zsrPage.js'
import { createWidget, createChild, showToast } from '../../lib/core/zsrWidgets.js'
const { width, height } = safeDeviceInfo()

export default ZSRPage({
  onInit() {
    if (!globalThis.ScreenReaderConfig) {
      globalThis.ScreenReaderConfig = loadSettings()
    }
    this.isChecking = false
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
      y: 40,
      w: width,
      h: 60,
      text: gettext('Check for Updates'),
      color: 0xffffff,
      align_h: 2,
      align_v: 2,
      text_size: 28
    })

    this.statusWidget = createChild(root, widget.TEXT, {
      x: 20,
      y: 120,
      w: width - 40,
      h: 100,
      text: gettext('Ready to scan'),
      color: 0xaaaaaa,
      text_size: 20,
      align_h: 2,
      text_style: text_style.WRAP
    })

    createChild(root, widget.BUTTON, {
      x: 40,
      y: height - 120,
      w: width - 80,
      h: 60,
      text: gettext('Check for Updates'),
      color: 0xffffff,
      normal_color: 0x00aa00,
      press_color: 0x666666,
      radius: 30,
      click_func: () => this.doCheck()
    })

    return root
  },

  async doCheck() {
    if (this.isChecking) return
    this.isChecking = true

    this.statusWidget.setProperty(prop.TEXT, gettext('Scanning...'))
    ScreenReader.speak(gettext('Scanning...'), { priority: 'high' })

    try {
      const result = await AddonUpdater.checkForUpdates()
      this.isChecking = false

      if (result.updated) {
        const msg = `${gettext('New version available')}: ${result.version}`
        this.statusWidget.setProperty(prop.TEXT, msg)
        ScreenReader.speak(msg, { priority: 'high' })
        showToast({ content: msg })
      } else if (result.error) {
        const msg = `Error: ${result.error}`
        this.statusWidget.setProperty(prop.TEXT, msg)
        ScreenReader.speak(msg, { priority: 'high' })
      } else {
        const msg = 'ZSR is up to date'
        this.statusWidget.setProperty(prop.TEXT, msg)
        ScreenReader.speak(msg, { priority: 'high' })
      }
    } catch (_error) {
      this.isChecking = false
      this.statusWidget.setProperty(prop.TEXT, 'Update check failed')
    }
  }
})
