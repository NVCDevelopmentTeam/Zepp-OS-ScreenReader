/**
 * Keeps one failing callback from stopping the whole app.
 *
 * On a watch an exception that escapes a button handler, key handler, gesture
 * handler, timer or sensor callback can close the app. A blind user then loses
 * the screen reader with no way to find out why, so every callback ZSR
 * registers goes through `guard`: a failure is recorded, ZSR keeps running, and
 * the user feels one error vibration.
 */
import { log } from '@zos/utils'
import { pushError } from './errorBuffer.js'

/** Error pulses are rate limited so a callback that fails in a loop cannot buzz endlessly. */
const MIN_BUZZ_GAP_MS = 5000
let lastBuzz = 0

/**
 * @param {string} label where the failure happened
 * @param {any} error
 */
function report(label, error) {
  const message = String((error && error.message) || error)
  pushError(label, message)
  log.warn(`[ZSR] ${label} failed: ${message}`)
  try {
    const now = Date.now()
    const vibration = globalThis.ScreenReaderInstance && globalThis.ScreenReaderInstance.vibration
    if (vibration && now - lastBuzz > MIN_BUZZ_GAP_MS) {
      lastBuzz = now
      vibration.vibrate('error')
    }
  } catch (_e) {
    /* feedback is optional */
  }
}

/**
 * Wrap a callback. Anything that is not a function (e.g. an optional handler that
 * is undefined) is returned unchanged. The return value and `this` are kept.
 * @template T
 * @param {T} fn
 * @param {string} [label]
 * @returns {T}
 */
export function guard(fn, label = 'callback') {
  if (typeof fn !== 'function') return fn
  const wrapped = function (/** @type {any[]} */ ...args) {
    try {
      const result = fn.apply(this, args)
      if (result && typeof result.catch === 'function') {
        result.catch((/** @type {any} */ e) => report(label, e))
      }
      return result
    } catch (e) {
      report(label, e)
      return undefined
    }
  }
  return /** @type {any} */ (wrapped)
}

/**
 * setTimeout whose callback cannot throw into the system.
 * @param {(...args: any[]) => void} fn
 * @param {number} [ms]
 */
export function safeTimeout(fn, ms) {
  return setTimeout(guard(fn, 'timer'), ms)
}

/**
 * setInterval whose callback cannot throw into the system.
 * @param {(...args: any[]) => void} fn
 * @param {number} [ms]
 */
export function safeInterval(fn, ms) {
  return setInterval(guard(fn, 'interval'), ms)
}
