/**
 * QR code support for blind users.
 *
 * Zepp OS watches have no camera, so ZSR cannot scan a QR code shown by
 * something else. What it CAN do - and what sighted-only UIs (and TalkBack)
 * cannot - is tell the user what a QR code shown on the watch actually
 * contains (for example the phone-pairing link), because the content is known
 * to the app that generates it.
 *
 * QR codes are drawn with the official QRCODE widget (`widget.QRCODE`); there
 * is no '@zos/qrcode' module.
 */
import { widget } from '@zos/ui'
import { getDeviceInfo } from '@zos/device'
import ScreenReader from '../core/screenReader.js'
import { createChild, createWidget } from '../core/zsrWidgets.js'
import { gettext } from '../utils/i18n.js'
import { log } from '@zos/utils'
import { describeQrContent } from '../utils/qrDescribe.js'
import DisplayController from '../equipment/displayController.js'
import { setPageBrightTime } from '@zos/display'

export { describeQrContent }

export class QRCode {
  constructor() {
    this.deviceInfo = getDeviceInfo()
  }

  /**
   * Draw a QR code that the screen reader can focus and describe.
   * @param {any} parent GROUP handle, or null for a top-level widget
   * @param {{content: string, x?: number, y?: number, size?: number}} options
   */
  generateQR(parent, options) {
    const size = options.size || Math.round(this.deviceInfo.width * 0.6)
    const x = options.x !== undefined ? options.x : Math.round((this.deviceInfo.width - size) / 2)
    const y = options.y !== undefined ? options.y : Math.round((this.deviceInfo.height - size) / 2)
    const opts = { x, y, w: size, h: size, content: options.content }
    const a11y = { label: describeQrContent(options.content) }
    return parent
      ? createChild(parent, widget.QRCODE, opts, a11y)
      : createWidget(widget.QRCODE, opts, a11y)
  }

  isValidQRText(text) {
    return typeof text === 'string' && text.length > 0
  }

  /** Speak what a QR code contains. */
  async readQRWithVoice(qrData) {
    try {
      if (!this.isValidQRText(qrData)) {
        await this.speakMessage(gettext('No valid QR code detected'))
        return false
      }
      await this.speakMessage(describeQrContent(qrData))
      return true
    } catch (_e) {
      await this.speakMessage(gettext('Error reading QR code'))
      return false
    }
  }

  async speakMessage(message) {
    try {
      await ScreenReader.speak(message)
    } catch (error) {
      log.warn('Text to speech failed: ' + String(error))
    }
  }
}

export default new QRCode()

/** How long the screen is kept lit at full brightness for a scan, in milliseconds. */
const SCAN_BRIGHT_TIME_MS = 60000

/**
 * Get the watch ready to have a QR code scanned by a phone (for example the pairing code that
 * connects ZSR to the Zepp app): full brightness, screen kept lit for a minute. A watch has no
 * camera, so ZSR cannot scan a code itself; it makes the code easy to scan and says how.
 * @returns {string} the instructions to read aloud
 */
export function prepareQrScan() {
  DisplayController.setBrightness(100)
  try {
    setPageBrightTime({ brightTime: SCAN_BRIGHT_TIME_MS })
  } catch (e) {
    log.debug('Screen could not be kept lit: ' + String(e))
  }
  return gettext(
    'The screen is at full brightness for one minute. Hold your phone with its camera facing the watch screen, about 20 centimeters away, and keep both still. Ask someone to help if it does not scan.'
  )
}
