/**
 * Settings manager for the standalone server/ Express backend.
 *
 * IMPORTANT: same rule as server/utils/logger.js - this must never import
 * setting/utils.js (which pulls in `@zos/device`) or anything else from
 * the Zepp OS device/app-side/setting bundles. A Node server has no
 * direct access to a watch's real device info/capabilities; it can only
 * know about a device if a connected client reports state to it over
 * whatever real-time channel this server exposes. This stub reflects
 * that honestly instead of fabricating a fake success.
 */
export const settingsManager = {
  validate() {
    return {
      success: false,
      capabilities: {},
      reason: 'No device is connected to this server process directly.'
    }
  }
}
