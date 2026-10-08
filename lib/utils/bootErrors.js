/**
 * Start-up problems that a person can SEE.
 *
 * On a real watch the console is hard to reach, and a failure while the app
 * starts looks like a blank screen. Every start-up step records what failed here
 * (a global list shared by all bundles), and a page that cannot be built draws the
 * messages on screen so a sighted helper can photograph them for a bug report.
 */
import { widget, text_style, createWidget } from '@zos/ui'
import { safeDeviceInfo } from './deviceInfo.js'
import { getApiCapabilityLevel } from './apiCapability.js'
import { getMedia } from '../equipment/mediaSupport.js'
import { ZSR_VERSION } from './version.js'

const MAX_KEPT = 12

/**
 * @param {string} stage short name of the step that failed
 * @param {any} error
 */
export function recordBootError(stage, error) {
  try {
    const list = globalThis.ZSRBootErrors || (globalThis.ZSRBootErrors = [])
    const message = String((error && error.message) || error || 'unknown error')
    if (list.length < MAX_KEPT) list.push({ stage: String(stage), message: message.slice(0, 160) })
    console.log('[ZSR boot] ' + stage + ': ' + message)
  } catch (_e) {
    /* recording must never throw */
  }
}

/** @returns {{ stage: string, message: string }[]} */
export function getBootErrors() {
  return globalThis.ZSRBootErrors || []
}

/** One line identifying this build and what the watch supports. */
export function bootSummary() {
  try {
    const { width, height } = safeDeviceInfo()
    return `ZSR ${ZSR_VERSION} | API ${getApiCapabilityLevel()} | audio ${getMedia() ? 'yes' : 'no'} | ${width}x${height}`
  } catch (_e) {
    return `ZSR ${ZSR_VERSION}`
  }
}

/**
 * Cover the screen with the recorded errors. Safe to call at any time; if even
 * drawing fails there is nothing more to do.
 * @param {string} [title]
 */
export function drawErrorPanel(title = 'ZSR could not start fully') {
  try {
    const { width, height } = safeDeviceInfo()
    const lines = getBootErrors()
      .slice(0, 5)
      .map((e) => `- ${e.stage}: ${e.message}`)
    createWidget(widget.FILL_RECT, { x: 0, y: 0, w: width, h: height, color: 0x330000 })
    createWidget(widget.TEXT, {
      x: 16,
      y: Math.round(height * 0.12),
      w: width - 32,
      h: Math.round(height * 0.76),
      text: [title, bootSummary(), ...lines].join('\n'),
      color: 0xffffff,
      text_size: 18,
      text_style: text_style.WRAP
    })
  } catch (_e) {
    /* nothing left to try */
  }
}
