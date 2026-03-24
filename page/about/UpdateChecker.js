import { createWidget, widget, showToast } from '@zos/ui'
import { gettext } from '@zos/i18n'
import { getDeviceInfo } from '@zos/device'
import AddonUpdater from '../../lib/utils/addonUpdater.js'
import ScreenReader from '../../lib/core/screenReader.js'
import { loadSettings } from '../../lib/core/config.js'

const { width, height } = getDeviceInfo()

export default Page({
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

    root.createWidget(widget.TEXT, {
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

    this.statusWidget = root.createWidget(widget.TEXT, {
      x: 20,
      y: 120,
      w: width - 40,
      h: 100,
      text: gettext('Ready to scan'),
      color: 0xaaaaaa,
      text_size: 20,
      align_h: 2,
      text_style: widget.TEXT_STYLE_WRAP
    })

    root.createWidget(widget.BUTTON, {
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

    this.statusWidget.setProperty(widget.prop.TEXT, gettext('Scanning...'))
    ScreenReader.speak(gettext('Scanning...'), { priority: 'high' })

    try {
      const result = await AddonUpdater.checkForUpdates()
      this.isChecking = false

      if (result.updated) {
        const msg = `${gettext('New version available')}: ${result.version}`
        this.statusWidget.setProperty(widget.prop.TEXT, msg)
        ScreenReader.speak(msg, { priority: 'high' })
        showToast({ content: msg })
      } else if (result.error) {
        const msg = `Error: ${result.error}`
        this.statusWidget.setProperty(widget.prop.TEXT, msg)
        ScreenReader.speak(msg, { priority: 'high' })
      } else {
        const msg = 'ZSR is up to date'
        this.statusWidget.setProperty(widget.prop.TEXT, msg)
        ScreenReader.speak(msg, { priority: 'high' })
      }
    } catch (_error) {
      this.isChecking = false
      this.statusWidget.setProperty(widget.prop.TEXT, 'Update check failed')
    }
  }
})
