/**
 * Settings manager for the standalone server/ Express backend.
 *
 * IMPORTANT: same rule as server/utils/logger.js - this must never import lib/utils/settingsManager.js
 * (which pulls in `@zos/device`) or anything else from the Zepp OS device/app-side/setting
 * bundles. A Node server has no direct access to a watch, so every request that needs the
 * watch is answered with a clear 503 instead of pretending to succeed.
 */

/** @param {string} message @param {number} status */
function httpError(message, status) {
  const error = new Error(message)
  // @ts-ignore Express reads `status` from errors
  error.status = status
  return error
}

const NO_DEVICE = 'No watch is connected to this server process.'

export const settingsManager = {
  /** @returns {Promise<{ success: boolean, capabilities: object, reason: string }>} */
  async validateDevice() {
    return { success: false, capabilities: {}, reason: NO_DEVICE }
  },

  /**
   * Run a settings change; a failure is reported as `[false, error]`.
   * @param {(value: any) => Promise<any>} action
   * @param {any} value
   * @param {string} _setting
   */
  async handleSettingChange(action, value, _setting) {
    try {
      return [true, await action(value)]
    } catch (error) {
      return [false, error]
    }
  },

  /** @param {any} value 0-100 */
  async changeBrightness(value) {
    const number = Number(value)
    if (!Number.isFinite(number) || number < 0 || number > 100) {
      throw httpError('Brightness must be between 0 and 100', 400)
    }
    throw httpError(NO_DEVICE, 503)
  },

  async changeContrast(_value) {
    throw httpError('Contrast cannot be changed on Zepp OS', 501)
  }
}
