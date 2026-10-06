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
import { gettext, format } from '../utils/i18n.js'

/**
 * Parse "WIFI:T:WPA;S:name;P:secret;;" into its fields. Written without regex
 * lookbehind so it runs on older JS engines too; "\\;" is an escaped ";".
 */
function parseWifi(content) {
  const fields = {}
  const body = content.slice(5)
  let part = ''
  const flush = () => {
    const idx = part.indexOf(':')
    if (idx > 0) fields[part.slice(0, idx)] = part.slice(idx + 1)
    part = ''
  }
  for (let i = 0; i < body.length; i++) {
    const ch = body[i]
    if (ch === '\\' && i + 1 < body.length) {
      part += body[++i]
    } else if (ch === ';') {
      flush()
    } else {
      part += ch
    }
  }
  flush()
  return fields
}

/**
 * Turn raw QR content into a sentence that is useful when spoken.
 * A Wi-Fi password is only spoken when the user has enabled "read passwords".
 * @param {string} content
 * @returns {string}
 */
export function describeQrContent(content) {
  const text = String(content || '').trim()
  if (!text) return gettext('QR code, empty')

  if (/^https?:\/\//i.test(text)) {
    const host = text.replace(/^https?:\/\//i, '').split(/[/?#]/)[0]
    return format(gettext('QR code, web link to {0}'), host)
  }
  if (/^WIFI:/i.test(text)) {
    const wifi = parseWifi(text)
    const config = globalThis.ScreenReaderConfig || {}
    const base = format(gettext('QR code, Wi-Fi network {0}'), wifi.S || gettext('Unknown'))
    return config.readPasswords === true && wifi.P
      ? base + '. ' + format(gettext('Password {0}'), wifi.P)
      : base
  }
  if (/^tel:/i.test(text)) return format(gettext('QR code, phone number {0}'), text.slice(4))
  if (/^mailto:/i.test(text)) return format(gettext('QR code, email address {0}'), text.slice(7))
  return format(gettext('QR code: {0}'), text)
}

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
      console.error('Text to speech failed:', error)
    }
  }
}

export default new QRCode()
