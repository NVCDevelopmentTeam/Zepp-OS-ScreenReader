/**
 * Screen-size scaling helper that works on every supported API level.
 *
 * The global `px()` scaling helper belongs to the API_LEVEL 3.0 screen
 * adaptation scheme, so relying on it directly can throw a ReferenceError on
 * Zepp OS 2.0 devices (ZSR's minimum). This wrapper uses the platform `px`
 * when it exists and otherwise scales against the current screen width.
 */
import { getDeviceInfo } from '@zos/device'

/** Reference width the layouts were designed against. */
const DESIGN_WIDTH = 480

/**
 * @param {number} value size in design pixels
 * @returns {number}
 */
export function px(value) {
  try {
    if (typeof globalThis.px === 'function') return globalThis.px(value)
  } catch (_e) {
    /* fall through to manual scaling */
  }
  const { width } = getDeviceInfo()
  return Math.round((value * width) / DESIGN_WIDTH)
}

export default px
