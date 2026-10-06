/**
 * Layout for the first-run Welcome page (page/home/Welcome.js).
 * Home (dashboard) layout lives in page/home/index.js.
 */
import { widget, text_style } from '@zos/ui'
import { getDeviceInfo } from '@zos/device'
import { gettext } from '../../lib/utils/i18n.js'
import { px } from '../../lib/utils/px.js'
import { createWidget, createChild } from '../../lib/core/zsrWidgets.js'

/**
 * @param {{ onOpenGuide: () => void, onContinue: () => void }} handlers
 */
export function buildWelcomeLayout({ onOpenGuide, onContinue }) {
  const { width, height } = getDeviceInfo()
  const margin = px(40)
  const root = createWidget(widget.GROUP, { x: 0, y: 0, w: width, h: height })

  createChild(root, widget.TEXT, {
    x: margin,
    y: px(50),
    w: width - margin * 2,
    h: px(90),
    text: gettext('Welcome to Zepp OS Screen Reader'),
    color: 0xffffff,
    text_size: px(30),
    text_style: text_style.WRAP,
    align_h: 2,
    align_v: 2
  })

  createChild(root, widget.TEXT, {
    x: margin,
    y: px(150),
    w: width - margin * 2,
    h: px(130),
    text: gettext(
      'ZSR speaks and vibrates as you touch the screen. Touch to explore, double tap to activate, swipe to move between items.'
    ),
    color: 0xaaaaaa,
    text_size: px(20),
    text_style: text_style.WRAP,
    align_h: 2
  })

  createChild(root, widget.BUTTON, {
    x: margin,
    y: height - px(190),
    w: width - margin * 2,
    h: px(65),
    text: gettext('Open User Guide'),
    color: 0xffffff,
    normal_color: 0x333333,
    press_color: 0x666666,
    radius: px(32),
    click_func: onOpenGuide
  })

  createChild(root, widget.BUTTON, {
    x: margin,
    y: height - px(110),
    w: width - margin * 2,
    h: px(65),
    text: gettext('Continue to Home'),
    color: 0xffffff,
    normal_color: 0x00aa00,
    press_color: 0x009900,
    radius: px(32),
    click_func: onContinue
  })

  return root
}
