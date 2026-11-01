/**
 * Performance / battery saver.
 *
 * Saver mode is on when the user chose it (`performanceMode: 'saver'`) or, unless switched off
 * (`autoBatterySaver: false`), when the battery is at or below SAVER_BELOW_PERCENT. It lowers
 * what the watch does in the background, while speech, vibration and navigation keep working:
 *   - optional parts do not start (voice control, accessibility extras, speech-engine warm-up,
 *     offline voice download), as in safe mode;
 *   - the phone-link status timer runs every 30 s instead of every 5 s;
 *   - interface sounds (earcons) are not played (the sound uses power, speech and haptics remain).
 */
import { Battery } from '@zos/sensor'

/** Below this battery level (percent) saver mode starts by itself. */
export const SAVER_BELOW_PERCENT = 15
const NORMAL_STATE_INTERVAL_MS = 5000
const SAVER_STATE_INTERVAL_MS = 30000
/** The battery is not read more often than this. */
const BATTERY_CACHE_MS = 60000

let cachedLevel = -1
let cachedAt = 0

/** @returns {number} battery percent, or -1 when it cannot be read */
export function batteryLevel() {
  const now = Date.now()
  if (cachedAt && now - cachedAt < BATTERY_CACHE_MS) return cachedLevel
  cachedAt = now
  try {
    cachedLevel = new Battery().getCurrent()
  } catch (_e) {
    cachedLevel = -1
  }
  return cachedLevel
}

/** Forget the cached battery level (used when the screen turns on). */
export function refreshBatteryLevel() {
  cachedAt = 0
}

/** @returns {boolean} true while saver mode is in effect */
export function isSaverMode() {
  const config = globalThis.ScreenReaderConfig || {}
  if (config.performanceMode === 'saver') return true
  if (config.autoBatterySaver === false) return false
  const level = batteryLevel()
  return level >= 0 && level <= SAVER_BELOW_PERCENT
}

/** @returns {number} how often the phone-link status is sent, in milliseconds */
export function remoteStateIntervalMs() {
  return isSaverMode() ? SAVER_STATE_INTERVAL_MS : NORMAL_STATE_INTERVAL_MS
}
