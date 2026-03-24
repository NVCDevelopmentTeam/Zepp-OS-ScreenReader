import { log } from '@zos/utils'
import { VibrationManager } from '../feedback/vibrateFeedback.js'
import * as ble from '@zos/ble'

/**
 * Braille Service for ZSR
 * Provides Vibration Braille output and Bluetooth Braille Display support
 */
class BrailleService {
  constructor() {
    this.vibration = new VibrationManager()
    this.connectedDisplay = null
    this.isScanning = false
    this.tables = {
      'en-US': {
        a: [1],
        b: [1, 2],
        c: [1, 4],
        d: [1, 4, 5],
        e: [1, 5],
        f: [1, 2, 4],
        g: [1, 2, 4, 5],
        h: [1, 2, 5],
        i: [2, 4],
        j: [2, 4, 5],
        k: [1, 3],
        l: [1, 2, 3],
        m: [1, 3, 4],
        n: [1, 3, 4, 5],
        o: [1, 3, 5],
        p: [1, 2, 3, 4],
        q: [1, 2, 3, 4, 5],
        r: [1, 2, 3, 5],
        s: [2, 3, 4],
        t: [2, 3, 4, 5],
        u: [1, 3, 6],
        v: [1, 2, 3, 6],
        w: [2, 4, 5, 6],
        x: [1, 3, 4, 6],
        y: [1, 3, 4, 5, 6],
        z: [1, 3, 5, 6],
        ' ': []
      },
      'zh-CN': {
        // Simplified Pinyin patterns (Placeholder)
        a: [1],
        b: [1, 2],
        c: [1, 4],
        d: [1, 4, 5],
        e: [1, 5]
      },
      'ja-JP': {
        a: [1],
        i: [1, 2],
        u: [1, 4],
        e: [1, 2, 4],
        o: [2, 4]
      },
      'ko-KR': {
        a: [1, 2, 6],
        ya: [3, 4, 5],
        eo: [2, 3, 4],
        yeo: [1, 5, 6]
      }
    }
    this.currentTable = 'en-US'
  }

  setTable(lang) {
    if (this.tables[lang]) {
      this.currentTable = lang
      return true
    }
    return false
  }

  getPatterns() {
    return this.tables[this.currentTable] || this.tables['en-US']
  }

  async output(text) {
    log.info('Braille output:', text)
    if (this.connectedDisplay) {
      this.sendToDisplay(text)
    }

    if (globalThis.ScreenReaderConfig?.vibrationBraille) {
      for (const char of text) {
        await this.vibrateCharacter(char)
      }
    }
  }

  async vibrateCharacter(char) {
    const patterns = this.getPatterns()
    const dots = patterns[char.toLowerCase()] || []
    for (const dot of dots) {
      await this.vibrateDot(dot)
    }
  }

  async vibrateDot(dotIndex) {
    for (let i = 0; i < dotIndex; i++) {
      await this.vibration.vibrate('info')
      await new Promise((r) => setTimeout(r, 150))
    }
    await new Promise((r) => setTimeout(r, 300))
  }

  async startDiscovery() {
    if (this.isScanning) return
    this.isScanning = true
    log.info('Scanning for Braille displays...')

    if (ble.startScan) {
      ble.startScan({
        success: (res) => {
          log.info('Found device:', res.deviceName)
          if (res.deviceName?.toLowerCase().includes('braille')) {
            this.connectToDisplay(res.deviceId)
          }
        }
      })
    }
  }

  async connectToDisplay(deviceId) {
    log.info('Connecting to Braille display:', deviceId)
    this.connectedDisplay = deviceId
    this.isScanning = false
    if (ble.stopScan) ble.stopScan()
  }

  sendToDisplay(text) {
    log.info('Sending text to Braille display:', text)
  }

  async inputDots(dots) {
    const char = this.translateDotsToChar(dots)
    if (char) {
      log.info('Braille input translated:', char)
      return char
    }
    return ''
  }

  translateDotsToChar(dots) {
    const patterns = this.getPatterns()
    const sortedDots = dots.sort((a, b) => a - b).join(',')

    for (const [char, pattern] of Object.entries(patterns)) {
      if (pattern.sort((a, b) => a - b).join(',') === sortedDots) {
        return char
      }
    }
    return null
  }
}

export default new BrailleService()
