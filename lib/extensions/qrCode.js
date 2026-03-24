import { getDeviceInfo } from '@zos/device'
import { createQRCode } from '@zos/qrcode'
import ScreenReader from '../core/screenReader.js'

export class QRCode {
  constructor() {
    this.deviceInfo = getDeviceInfo()
  }

  generateQR(text, options = {}) {
    const defaultOptions = {
      width: this.deviceInfo.width,
      height: this.deviceInfo.height,
      backgroundColor: 0x000000,
      foregroundColor: 0xffffff,
      correctionLevel: 'M'
    }

    const mergedOptions = { ...defaultOptions, ...options }
    const qrCode = createQRCode(text, mergedOptions)
    this.speakMessage('QR code generated successfully')
    return qrCode
  }

  isValidQRText(text) {
    return typeof text === 'string' && text.length > 0
  }

  async readQRWithVoice(qrData) {
    try {
      if (!this.isValidQRText(qrData)) {
        await this.speakMessage('No valid QR code detected')
        return false
      }

      await this.speakMessage('QR code detected. Content: ' + qrData)
      return true
    } catch (__) {
      await this.speakMessage('Error reading QR code')
      return false
    }
  }

  async speakMessage(message) {
    try {
      await ScreenReader.speak(message)
    } catch (error) {
      console.error('Text to speech failed:', error)
    }
  }
}
