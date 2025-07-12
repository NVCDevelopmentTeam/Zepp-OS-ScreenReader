import { getDeviceInfo } from '@zos/device'
import { createQRCode } from '@zos/qrcode'
import { textToSpeech } from '@zos/sensor'

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
    } catch (_) { // eslint-disable-line no-unused-vars
      await this.speakMessage('Error reading QR code')
      return false
    }
  }

  async speakMessage(message) {
    try {
      await textToSpeech.speak(message)
    } catch (error) {
      console.error('Text to speech failed:', error)
    }
  }
}
