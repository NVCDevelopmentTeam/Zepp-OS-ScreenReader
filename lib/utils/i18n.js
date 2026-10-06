/**
 * Central i18n helper for every device-side ZSR module.
 *
 * `@zos/i18n` exposes `getText` (API_LEVEL 2.0+). It is NOT named `gettext`
 * on the device, so `import { gettext } from '@zos/i18n'` resolves to
 * `undefined` and throws on the first call. This wrapper:
 *   - uses the correct `getText` export,
 *   - never throws (falls back to the English key, which is also the .po msgid),
 *   - keeps the historical `gettext(...)` call sites unchanged.
 */
import { getText } from '@zos/i18n'

/**
 * @param {string} key English source string / msgid
 * @returns {string}
 */
export function gettext(key) {
  try {
    const value = getText(key)
    return typeof value === 'string' && value.length > 0 ? value : key
  } catch (_e) {
    return key
  }
}

/**
 * Fill {0}, {1}... placeholders. Translators may reorder placeholders, so
 * spoken sentences must use this instead of string concatenation.
 * @param {string} template
 * @param {...any} args
 * @returns {string}
 */
export function format(template, ...args) {
  return String(template).replace(/\{(\d+)\}/g, (m, i) =>
    args[Number(i)] === undefined || args[Number(i)] === null ? '' : String(args[Number(i)])
  )
}

export default gettext
