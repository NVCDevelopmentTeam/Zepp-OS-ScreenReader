import { widget } from '@zos/ui'
import { gettext } from '../../lib/utils/i18n.js'
import { getDeviceInfo } from '@zos/device'
import { replace } from '@zos/router'
import { loadSettings, saveSettings } from '../../lib/core/config.js'

import { ZSRPage } from '../../lib/core/zsrPage.js'
import { createWidget, createChild } from '../../lib/core/zsrWidgets.js'
const { width, height } = getDeviceInfo()

export default ZSRPage({
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

    createChild(root, widget.TEXT, {
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

    this.createToggle(
      root,
      180,
      gettext('Read Symbols'),
      !!config.readSymbols && config.readSymbols !== 'none',
      (val) => {
        // The core expects a tier ('full' | 'most' | 'some' | 'none'), not a boolean.
        config.readSymbols = val ? 'some' : 'none'
        saveSettings(config)
      }
    )

    this.createToggle(
      root,
      260,
      gettext('Report Passwords'),
      config.readPasswords === true,
      (val) => {
        // Same key the reader consults (navigationManager.getElementText).
        config.readPasswords = !!val
        saveSettings(config)
        replace({ url: 'page/settings/ObjectPresentation' })
      }
    )

    this.createToggle(root, 340, gettext('Announce Day'), !!config.announceDayOfWeek, (val) => {
      config.announceDayOfWeek = val
      saveSettings(config)
    })

    // Password Reporting Mode Status
    createChild(root, widget.TEXT, {
      x: 40,
      y: 420,
      w: width - 80,
      h: 40,
      text: `${gettext('Passwords')}: ${config.readPasswords === true ? gettext('Spell') : gettext('Mask')}`,
      color: 0xaaaaaa,
      text_size: 22,
      align_v: 2
    })

    return root
  },

  createToggle(root, y, label, checked, onChange) {
    createChild(root, widget.TEXT, {
      x: 40,
      y: y,
      w: width - 150,
      h: 60,
      text: label,
      color: 0xffffff,
      text_size: 24,
      align_v: 2
    })

    createChild(root, widget.SLIDE_SWITCH, {
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
