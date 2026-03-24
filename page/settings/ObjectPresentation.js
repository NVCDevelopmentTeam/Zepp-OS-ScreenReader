import { createWidget, widget } from '@zos/ui'
import { gettext } from '@zos/i18n'
import { getDeviceInfo } from '@zos/device'
import { replace } from '@zos/router'
import { loadSettings, saveSettings } from '../../lib/core/config.js'

const { width, height } = getDeviceInfo()

export default Page({
  onInit() {
    globalThis.ScreenReaderConfig = loadSettings()
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
      text: gettext('Object Presentation'),
      color: 0xffffff,
      align_h: 2,
      align_v: 2,
      text_size: 28
    })

    this.createToggle(root, 100, gettext('Read Emoji'), !!config.readEmoji, (val) => {
      config.readEmoji = val
      saveSettings(config)
    })

    this.createToggle(root, 180, gettext('Read Symbols'), !!config.readSymbols, (val) => {
      config.readSymbols = val
      saveSettings(config)
    })

    this.createToggle(
      root,
      260,
      gettext('Report Passwords'),
      config.reportPasswords === 'spell',
      (val) => {
        config.reportPasswords = val ? 'spell' : 'mask'
        saveSettings(config)
        replace({ url: 'page/settings/ObjectPresentation' })
      }
    )

    this.createToggle(root, 340, gettext('Announce Day'), !!config.announceDayOfWeek, (val) => {
      config.announceDayOfWeek = val
      saveSettings(config)
    })

    // Password Reporting Mode Status
    root.createWidget(widget.TEXT, {
      x: 40,
      y: 420,
      w: width - 80,
      h: 40,
      text: `${gettext('Passwords')}: ${config.reportPasswords === 'spell' ? gettext('Spell') : gettext('Mask')}`,
      color: 0xaaaaaa,
      text_size: 22,
      align_v: 2
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
