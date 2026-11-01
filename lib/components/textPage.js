/**
 * Shared layout for the read-only text pages (policies, notices, support).
 * Every line is created through zsrWidgets, so the screen reader can focus and
 * read the title and the body.
 */
import { widget, text_style } from '@zos/ui'
import { getDeviceInfo } from '@zos/device'
import { createWidget, createChild } from '../core/zsrWidgets.js'
import { px } from '../utils/px.js'

/**
 * @param {string} title
 * @param {string} body
 */
export function buildTextPage(title, body) {
  const { width, height } = getDeviceInfo()
  const root = createWidget(widget.GROUP, { x: 0, y: 0, w: width, h: height })

  createChild(root, widget.TEXT, {
    x: 0,
    y: px(20),
    w: width,
    h: px(50),
    text: title,
    color: 0xffffff,
    align_h: 2,
    align_v: 2,
    text_size: px(28)
  })

  createChild(root, widget.TEXT, {
    x: px(20),
    y: px(80),
    w: width - px(40),
    h: Math.max(height - 100, 300),
    text: body,
    color: 0xaaaaaa,
    text_size: px(20),
    text_style: text_style.WRAP
  })

  return root
}
