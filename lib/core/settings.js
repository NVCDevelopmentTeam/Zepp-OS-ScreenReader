import { getDeviceInfo } from '@zos/device'
import { Storage } from '@zos/storage'
import { log } from '@zos/utils'

class SettingsManager {
  constructor() {
    this.storage = new Storage()
    this.defaults = {
      screenReader: true,
      speechRate: 1.0,
      volume: 0.8,
      feedback: true
    }
  }

  async load() {
    try {
      const settings = await this.storage.get('accessibility-settings')
      return settings ? JSON.parse(settings) : this.defaults
    } catch (error) {
      log.error('Settings load failed:', error)
      return this.defaults
    }
  }

  async save(settings) {
    try {
      await this.storage.set('accessibility-settings', JSON.stringify(settings))
      return true
    } catch (error) {
      log.error('Settings save failed:', error)
      return false
    }
  }
}

export default new SettingsManager()
