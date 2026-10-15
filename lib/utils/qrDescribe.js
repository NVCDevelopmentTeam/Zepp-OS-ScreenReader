import { gettext, format } from './i18n.js'

/**
 * Parse "WIFI:T:WPA;S:name;P:secret;;" into its fields. Written without regex
 * lookbehind so it runs on older JS engines too; "\\;" is an escaped ";".
 * @param {string} content
 * @returns {Record<string, string>}
 */
function parseWifi(content) {
  /** @type {Record<string, string>} */
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
 * Kept free of UI imports so the navigation layer can use it for any QR code on screen.
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
