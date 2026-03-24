import { createWidget, widget } from '@zos/ui'
import { gettext } from '@zos/i18n'
import { getDeviceInfo } from '@zos/device'
import { replace } from '@zos/router'
import { log } from '@zos/utils'
import { loadSettings, saveSettings } from '../lib/core/config.js'
import SpeechHistory from '../lib/utils/speechHistory.js'
import ScreenReader from '../lib/core/screenReader.js'

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
      h: 60,
      text: gettext('Advanced Settings'),
      color: 0xffffff,
      align_h: 2,
      align_v: 2,
      text_size: 32
    })

    const buttonWidth = width - 80
    const buttonX = 40

    // Debug Logging Toggle
    root.createWidget(widget.BUTTON, {
      x: buttonX,
      y: 100,
      w: buttonWidth,
      h: 70,
      text: `${gettext('Debug Log')}: ${config.debugLogging ? 'ON' : 'OFF'}`,
      color: 0xffffff,
      normal_color: config.debugLogging ? 0x00aa00 : 0x333333,
      press_color: 0x666666,
      radius: 35,
      click_func: () => {
        config.debugLogging = !config.debugLogging
        saveSettings(config)
        replace({ url: 'setting/AdvancedSettings' })
      }
    })

    // Verbose Speech Toggle
    root.createWidget(widget.BUTTON, {
      x: buttonX,
      y: 180,
      w: buttonWidth,
      h: 70,
      text: `${gettext('Verbose')}: ${config.verboseSpeech ? 'ON' : 'OFF'}`,
      color: 0xffffff,
      normal_color: config.verboseSpeech ? 0x00aa00 : 0x333333,
      press_color: 0x666666,
      radius: 35,
      click_func: () => {
        config.verboseSpeech = !config.verboseSpeech
        saveSettings(config)
        replace({ url: 'setting/AdvancedSettings' })
      }
    })

    // Export Log Button
    root.createWidget(widget.BUTTON, {
      x: buttonX,
      y: 260,
      w: buttonWidth,
      h: 70,
      text: gettext('Export Logs'),
      color: 0xffffff,
      normal_color: 0x555555,
      press_color: 0x666666,
      radius: 35,
      click_func: () => {
        log.info('Exporting logs to phone side...')
        ScreenReader.speak(gettext('Exporting logs'), { priority: 'high' })
      }
    })

    // Clear History Button
    root.createWidget(widget.BUTTON, {
      x: buttonX,
      y: 340,
      w: buttonWidth,
      h: 70,
      text: gettext('Clear Speech History'),
      color: 0xffffff,
      normal_color: 0xaa5500,
      press_color: 0x666666,
      radius: 35,
      click_func: () => {
        SpeechHistory.clear()
        ScreenReader.speak(gettext('Speech history cleared'), { priority: 'high' })
      }
    })

    return root
  }
})
