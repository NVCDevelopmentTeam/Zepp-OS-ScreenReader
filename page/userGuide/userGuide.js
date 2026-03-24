import { createWidget, widget } from '@zos/ui'
import { gettext } from '@zos/i18n'
import { getDeviceInfo } from '@zos/device'
import { loadSettings } from '../../lib/core/config.js'
import ScreenReader from '../../lib/core/screenReader.js'

const { width, height } = getDeviceInfo()

export default Page({
  onInit() {
    globalThis.ScreenReaderConfig = loadSettings()
    this.currentPage = 0
    this.sections = [
      {
        title: gettext('Gestures'),
        content: gettext(
          'Swipe Right: Next element. Swipe Left: Previous element. Swipe Up: Cycle navigation mode (default, character, word). Single Tap: Select/Activate.'
        )
      },
      {
        title: gettext('Shortcuts'),
        content: gettext(
          'Long Press UP button: Enable or Disable Screen Reader. Long Press DOWN button: Mute or Unmute voice feedback.'
        )
      },
      {
        title: gettext('Settings'),
        content: gettext(
          'Go to Settings to manage voice feedback, mute, and enable the Screen Curtain for privacy.'
        )
      },
      {
        title: gettext('Sensors'),
        content: gettext(
          'Use the Sensors page to read your current Heart Rate, Blood Oxygen (SpO2), and Sleep data.'
        )
      },
      {
        title: gettext('Voice Control'),
        content: gettext(
          'Say "STOP" to pause speech, or "CHECK BATTERY" to hear your battery level. (More commands coming soon).'
        )
      }
    ]

    ScreenReader.speak(
      `${gettext('User Guide')}. ${gettext('Section')} 1 ${gettext('of')} 5: ${this.sections[0].title}. ${gettext('Swipe right for next.')}`,
      {
        priority: 'high'
      }
    )
  },

  build() {
    const rootGroup = createWidget(widget.GROUP, {
      x: 0,
      y: 0,
      w: width,
      h: height
    })

    this.titleWidget = rootGroup.createWidget(widget.TEXT, {
      x: 40,
      y: 40,
      w: width - 80,
      h: 60,
      text: this.sections[0].title,
      color: 0xffffff,
      text_size: 32,
      align_h: 2
    })

    this.contentWidget = rootGroup.createWidget(widget.TEXT, {
      x: 40,
      y: 110,
      w: width - 80,
      h: 240,
      text: this.sections[0].content,
      color: 0xaaaaaa,
      text_size: 20,
      text_style: widget.TEXT_STYLE_WRAP,
      align_h: 2
    })

    rootGroup.createWidget(widget.BUTTON, {
      x: 40,
      y: height - 100,
      w: (width - 100) / 2,
      h: 60,
      text: gettext('Previous'),
      color: 0xffffff,
      normal_color: 0x333333,
      press_color: 0x666666,
      radius: 30,
      click_func: () => this.navigate(-1)
    })

    rootGroup.createWidget(widget.BUTTON, {
      x: width / 2 + 10,
      y: height - 100,
      w: (width - 100) / 2,
      h: 60,
      text: gettext('Next'),
      color: 0xffffff,
      normal_color: 0x333333,
      press_color: 0x666666,
      radius: 30,
      click_func: () => this.navigate(1)
    })

    return rootGroup
  },

  navigate(dir) {
    let next = this.currentPage + dir
    if (next < 0) next = 0
    if (next >= this.sections.length) next = this.sections.length - 1

    if (next !== this.currentPage) {
      this.currentPage = next
      const section = this.sections[next]
      this.titleWidget.setProperty(widget.prop.TEXT, section.title)
      this.contentWidget.setProperty(widget.prop.TEXT, section.content)
      ScreenReader.speak(`${section.title}. ${section.content}`, { priority: 'high' })
    }
  }
})
