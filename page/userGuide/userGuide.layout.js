/**
 * Layout for the User Guide page (page/userGuide/userGuide.js).
 *
 * Kept separate from the page logic so the guide's content and visual layout
 * can change without touching navigation/speech code, and so it is never
 * confused with the app's Home layout (page/home/).
 */
import { widget, text_style } from '@zos/ui'
import { getDeviceInfo } from '@zos/device'
import { gettext } from '../../lib/utils/i18n.js'
import { px } from '../../lib/utils/px.js'
import { createWidget, createChild } from '../../lib/core/zsrWidgets.js'

/**
 * Sections are built on demand so every string is resolved with the language
 * that is active when the page opens (not when the module first loads).
 * @returns {{title: string, content: string}[]}
 */
export function getGuideSections() {
  return [
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
}

/**
 * @param {{
 *   first: {title: string, content: string},
 *   onPrevious: () => void,
 *   onNext: () => void,
 *   onTogglePractice: () => void
 * }} options
 * @returns {{titleWidget: any, contentWidget: any}}
 */
export function buildGuideLayout({ first, onPrevious, onNext, onTogglePractice }) {
  const { width, height } = getDeviceInfo()
  const margin = px(40)
  const buttonH = px(60)
  const root = createWidget(widget.GROUP, { x: 0, y: 0, w: width, h: height })

  const titleWidget = createChild(root, widget.TEXT, {
    x: margin,
    y: px(40),
    w: width - margin * 2,
    h: px(60),
    text: first.title,
    color: 0xffffff,
    text_size: px(32),
    align_h: 2
  })

  const contentWidget = createChild(root, widget.TEXT, {
    x: margin,
    y: px(110),
    w: width - margin * 2,
    h: height - px(110) - px(190),
    text: first.content,
    color: 0xaaaaaa,
    text_size: px(20),
    text_style: text_style.WRAP,
    align_h: 2
  })

  createChild(root, widget.BUTTON, {
    x: margin,
    y: height - px(170),
    w: width - margin * 2,
    h: px(55),
    text: gettext('Toggle Gesture Practice Mode'),
    color: 0xffffff,
    normal_color: 0x006600,
    press_color: 0x009900,
    radius: px(27),
    click_func: onTogglePractice
  })

  const half = (width - px(100)) / 2
  createChild(root, widget.BUTTON, {
    x: margin,
    y: height - px(100),
    w: half,
    h: buttonH,
    text: gettext('Previous'),
    color: 0xffffff,
    normal_color: 0x333333,
    press_color: 0x666666,
    radius: px(30),
    click_func: onPrevious
  })
  createChild(root, widget.BUTTON, {
    x: width / 2 + px(10),
    y: height - px(100),
    w: half,
    h: buttonH,
    text: gettext('Next'),
    color: 0xffffff,
    normal_color: 0x333333,
    press_color: 0x666666,
    radius: px(30),
    click_func: onNext
  })

  return { titleWidget, contentWidget }
}
