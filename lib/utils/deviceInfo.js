/**
 * Device info that never throws.
 *
 * Many modules read the screen size when they LOAD. An exception during module
 * load stops the whole app from starting (a blank screen on the watch), so a
 * failing getDeviceInfo() must degrade to sensible defaults instead.
 */
import { getDeviceInfo } from '@zos/device'

const FALLBACK = {
  width: 390,
  height: 450,
  screenShape: 0,
  deviceName: 'unknown',
  deviceSource: 0,
  keyNumber: 0
}

/** @returns {{ width: number, height: number, screenShape: number, deviceName: any, deviceSource: any, keyNumber: number }} */
export function safeDeviceInfo() {
  try {
    const info = getDeviceInfo()
    if (info && info.width > 0 && info.height > 0) return info
  } catch (_e) {
    /* use the fallback below */
  }
  return FALLBACK
}
