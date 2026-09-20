import { createWidget, widget, prop, text_style } from '@zos/ui'
import { gettext } from '@zos/i18n'
import { getDeviceInfo } from '@zos/device'
import { loadSettings } from '../../lib/core/config.js'
import ScreenReader from '../../lib/core/screenReader.js'

const { width, height } = getDeviceInfo()

let currentPage = 0
/** @type {ZSRWidget | null} */
let titleWidget = null
/** @type {ZSRWidget | null} */
let contentWidget = null

const sections = [
  {
    title: gettext('Gestures'),
    content: gettext(
      'Swipe Right: Next item. Swipe Left: Previous item. Swipe Up/Down: Cycle reading mode by default, but you can reassign any swipe, tap, double-tap, long-press, or multi-finger gesture in Settings > Gestures & Input > Gesture Actions.'
    )
  },
  {
    title: gettext('Turning ZSR On or Off'),
    content: gettext(
      'You can enable or disable ZSR three ways: double or triple-click the physical Home button (set your preference in Settings > General > Accessibility Shortcut), assign a gesture to "Turn ZSR On/Off" in Gesture Actions, or tap the large ZSR shortcut card next to your watch faces.'
    )
  },
  {
    title: gettext('Context Menu'),
    content: gettext(
      'Long-press anywhere on the screen to open the context menu, with quick actions like reading sensors, spelling out text, opening the braille keyboard, and repeating the last thing spoken.'
    )
  },
  {
    title: gettext('Settings'),
    content: gettext(
      'Open Settings on your phone to manage speech rate and voice, gestures, notifications, braille, and privacy features like Screen Curtain.'
    )
  },
  {
    title: gettext('Practicing Gestures'),
    content: gettext(
      'Turn on Gesture Practice Mode from this guide or Settings to safely try gestures - ZSR will announce which gesture it detected instead of performing the action, so you can learn safely before using them for real.'
    )
  }
]

function navigate(dir) {
  let next = currentPage + dir
  if (next < 0) next = 0
  if (next >= sections.length) next = sections.length - 1

  if (next !== currentPage) {
    currentPage = next
    const section = sections[next]
    if (titleWidget && prop.TEXT) {
      titleWidget.setProperty(prop.TEXT, section.title)
    }
    if (contentWidget && prop.TEXT) {
      contentWidget.setProperty(prop.TEXT, section.content)
    }
    ScreenReader.speak(`${section.title}. ${section.content}`, { priority: 'high' })
  }
}

export default Page({
  onInit() {
    globalThis.ScreenReaderConfig = loadSettings()
    currentPage = 0

    ScreenReader.speak(
      `${gettext('User Guide')}. ${gettext('Section')} 1 ${gettext('of')} 5: ${sections[0].title}. ${gettext('Swipe right for next.')}`,
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

    titleWidget = rootGroup.createWidget(widget.TEXT, {
      x: 40,
      y: 40,
      w: width - 80,
      h: 60,
      text: sections[0].title,
      color: 0xffffff,
      text_size: 32,
      align_h: 2
    })

    contentWidget = rootGroup.createWidget(widget.TEXT, {
      x: 40,
      y: 110,
      w: width - 80,
      h: 240,
      text: sections[0].content,
      color: 0xaaaaaa,
      text_size: 20,
      text_style: text_style.WRAP,
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
      click_func: () => navigate(-1)
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
      click_func: () => navigate(1)
    })

    rootGroup.createWidget(widget.BUTTON, {
      x: 40,
      y: height - 170,
      w: width - 80,
      h: 55,
      text: gettext('Toggle Gesture Practice Mode'),
      color: 0xffffff,
      normal_color: 0x006600,
      press_color: 0x009900,
      radius: 27,
      click_func: () => {
        const config = globalThis.ScreenReaderConfig || {}
        config.gesturePracticeMode = !config.gesturePracticeMode
        ScreenReader.speak(
          config.gesturePracticeMode
            ? 'Gesture practice mode on. Try any gesture - ZSR will tell you what it detected instead of performing it.'
            : 'Gesture practice mode off. Gestures will now perform their normal actions again.',
          { priority: 'high', force: true }
        )
      }
    })

    return rootGroup
  }
})
