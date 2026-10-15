/**
 * Values coming from the phone's Settings Storage.
 *
 * Settings Storage only holds strings, so a Toggle arrives as 'true' / 'false'
 * (the string 'false' is truthy!), a Slider as '5', and a Select may arrive as
 * the plain value or as JSON describing the selected option. This module is
 * pure (no imports) so the Settings App, the Side Service and the watch can all
 * use it.
 */

/**
 * Plain value of a Select: accepts the raw value, `{value}`, `{values:[{value}]}`
 * or `[{value}]` (as JSON text or already parsed).
 * @param {any} raw
 * @returns {any}
 */
export function unwrapSelection(raw) {
  let value = raw
  if (typeof value === 'string') {
    const text = value.trim()
    if (text[0] === '{' || text[0] === '[') {
      try {
        value = JSON.parse(text)
      } catch (_e) {
        return raw
      }
    } else {
      return raw
    }
  }
  if (Array.isArray(value)) value = value[0]
  if (value && typeof value === 'object') {
    if (Array.isArray(value.values) && value.values.length > 0) value = value.values[0]
    if (value && typeof value === 'object' && 'value' in value) return value.value
  }
  return value
}

/**
 * Convert a Settings Storage value to the type of the setting's default.
 * @param {any} raw value as stored (usually a string)
 * @param {any} defaultValue the setting's default; its type decides the result
 * @returns {any}
 */
export function coerceSettingValue(raw, defaultValue) {
  const value = unwrapSelection(raw)
  // Unknown setting (no default to learn the type from): keep the plain value.
  if (defaultValue === undefined) return value
  if (typeof defaultValue === 'boolean') {
    if (typeof value === 'boolean') return value
    const text = String(value).trim().toLowerCase()
    return text === 'true' || text === '1' || text === 'on'
  }
  if (typeof defaultValue === 'number') {
    const number = Number(value)
    return Number.isFinite(number) ? number : defaultValue
  }
  if (defaultValue !== null && typeof defaultValue === 'object') {
    if (typeof value !== 'string') return value
    try {
      return JSON.parse(value)
    } catch (_e) {
      return defaultValue
    }
  }
  return value === undefined || value === null ? defaultValue : String(value)
}
