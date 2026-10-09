import { log } from '@zos/utils'
import { ZSR_VERSION } from './version.js'

class AddonUpdater {
  constructor() {
    this.addons = []
    this.isChecking = false
    this.currentVersion = ZSR_VERSION
  }

  async checkForUpdates() {
    if (this.isChecking) return { updated: false }
    this.isChecking = true
    log.info('Checking for ZSR updates...')

    const { messageBuilder } = getApp()._options.globalData
    if (!messageBuilder) {
      this.isChecking = false
      return { updated: false, error: 'No message builder' }
    }

    try {
      const response = await messageBuilder.request({
        method: 'CHECK_UPDATE'
      })

      this.isChecking = false
      if (response.result === 'OK') {
        const hasUpdate = this.compareVersions(response.version, this.currentVersion) > 0
        return {
          updated: hasUpdate,
          version: response.version,
          url: response.url
        }
      }
      return { updated: false, error: response.message }
    } catch (/** @type {any} */ error) {
      this.isChecking = false
      log.error('Update check failed:', error)
      return { updated: false, error: error.message }
    }
  }

  compareVersions(v1, v2) {
    const parts1 = v1.split('.').map(Number)
    const parts2 = v2.split('.').map(Number)
    for (let i = 0; i < 3; i++) {
      if (parts1[i] > parts2[i]) return 1
      if (parts1[i] < parts2[i]) return -1
    }
    return 0
  }

  registerAddon(name, version) {
    this.addons.push({ name, version })
  }
}

export default new AddonUpdater()
