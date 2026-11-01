import '../../lib/utils/polyfills.js'
import { widget } from '@zos/ui'
import { gettext } from '../../lib/utils/i18n.js'
import { safeDeviceInfo } from '../../lib/utils/deviceInfo.js'
import { replace } from '@zos/router'
import { loadSettings, saveSettings } from '../../lib/core/config.js'
import SpeechHistory from '../../lib/utils/speechHistory.js'
import ScreenReader from '../../lib/core/readerProxy.js'

import { ZSRPage } from '../../lib/core/zsrPage.js'
import { createWidget, createChild } from '../../lib/core/zsrWidgets.js'
import { guard } from '../../lib/utils/safeCall.js'
import { px } from '../../lib/utils/px.js'
import { sendReportAndSpeakResult } from '../../lib/utils/diagnosticReport.js'
import {
  backupSettingsAndSpeak,
  restoreSettingsAndSpeak
} from '../../lib/core/settingsBackupActions.js'
const { width, height } = safeDeviceInfo()
/** The second press of "Restore settings" must come within this time. */
const RESTORE_CONFIRM_MS = 5000

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
      y: px(20),
      w: width,
      h: px(60),
      text: gettext('Advanced Settings'),
      color: 0xffffff,
      align_h: 2,
      align_v: 2,
      text_size: px(32)
    })

    const buttonWidth = width - px(80)
    const buttonX = px(40)

    // Debug Logging Toggle
    createChild(root, widget.BUTTON, {
      x: buttonX,
      y: px(100),
      w: buttonWidth,
      h: px(70),
      text: `${gettext('Debug Log')}: ${config.debugLogging ? 'ON' : 'OFF'}`,
      color: 0xffffff,
      normal_color: config.debugLogging ? 0x00aa00 : 0x333333,
      press_color: 0x666666,
      radius: px(35),
      click_func: guard(() => {
        config.debugLogging = !config.debugLogging
        saveSettings(config)
        replace({ url: 'page/settings/AdvancedSettings' })
      }, 'click_func')
    })

    // Verbose Speech Toggle
    createChild(root, widget.BUTTON, {
      x: buttonX,
      y: px(180),
      w: buttonWidth,
      h: px(70),
      text: `${gettext('Verbose')}: ${config.verboseSpeech ? 'ON' : 'OFF'}`,
      color: 0xffffff,
      normal_color: config.verboseSpeech ? 0x00aa00 : 0x333333,
      press_color: 0x666666,
      radius: px(35),
      click_func: guard(() => {
        config.verboseSpeech = !config.verboseSpeech
        saveSettings(config)
        replace({ url: 'page/settings/AdvancedSettings' })
      }, 'click_func')
    })

    // Export Log Button
    createChild(root, widget.BUTTON, {
      x: buttonX,
      y: px(260),
      w: buttonWidth,
      h: px(70),
      text: gettext('Export Logs'),
      color: 0xffffff,
      normal_color: 0x555555,
      press_color: 0x666666,
      radius: px(35),
      click_func: guard(() => {
        // The problem report goes to the phone, where the Zepp app offers it as an e-mail
        sendReportAndSpeakResult()
      }, 'click_func')
    })

    // Clear History Button
    createChild(root, widget.BUTTON, {
      x: buttonX,
      y: px(340),
      w: buttonWidth,
      h: px(70),
      text: gettext('Clear Speech History'),
      color: 0xffffff,
      normal_color: 0xaa5500,
      press_color: 0x666666,
      radius: px(35),
      click_func: guard(() => {
        SpeechHistory.clear()
        ScreenReader.speak(gettext('Speech history cleared'), { priority: 'high' })
      }, 'click_func')
    })

    // Performance: normal, or battery saver (less background work)
    createChild(root, widget.BUTTON, {
      x: buttonX,
      y: px(420),
      w: buttonWidth,
      h: px(70),
      text: `${gettext('Performance')}: ${config.performanceMode === 'saver' ? gettext('Battery saver') : gettext('Normal')}`,
      color: 0xffffff,
      normal_color: config.performanceMode === 'saver' ? 0x00aa00 : 0x333333,
      press_color: 0x666666,
      radius: px(35),
      click_func: guard(() => {
        config.performanceMode = config.performanceMode === 'saver' ? 'normal' : 'saver'
        saveSettings(config)
        replace({ url: 'page/settings/AdvancedSettings' })
      }, 'click_func')
    })

    // Back up the settings (kept on the watch, and a copy goes to the phone)
    createChild(root, widget.BUTTON, {
      x: buttonX,
      y: px(500),
      w: buttonWidth,
      h: px(70),
      text: gettext('Back up settings'),
      color: 0xffffff,
      normal_color: 0x555555,
      press_color: 0x666666,
      radius: px(35),
      click_func: guard(() => {
        backupSettingsAndSpeak()
      }, 'click_func')
    })

    // Restore replaces the settings, so it asks to be pressed twice
    let restoreAskedAt = 0
    createChild(root, widget.BUTTON, {
      x: buttonX,
      y: px(580),
      w: buttonWidth,
      h: px(70),
      text: gettext('Restore settings'),
      color: 0xffffff,
      normal_color: 0xaa5500,
      press_color: 0x666666,
      radius: px(35),
      click_func: guard(() => {
        const now = Date.now()
        if (restoreAskedAt && now - restoreAskedAt < RESTORE_CONFIRM_MS) {
          restoreAskedAt = 0
          restoreSettingsAndSpeak()
        } else {
          restoreAskedAt = now
          ScreenReader.speak(
            gettext('Press Restore settings again within five seconds to replace your settings.'),
            { priority: 'high' }
          )
        }
      }, 'click_func')
    })

    return root
  }
})
