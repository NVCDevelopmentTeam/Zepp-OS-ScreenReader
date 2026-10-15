/**
 * Bounded list of recent errors, kept in memory only.
 *
 * Deliberately has no imports so that the logger can use it without creating
 * import cycles. The list lives on globalThis because every page is bundled
 * separately but they share one JavaScript context.
 */
const MAX_KEPT = 20
const MAX_LENGTH = 160

/**
 * @param {string} source where the error came from (e.g. 'boot', 'error')
 * @param {any} message
 */
export function pushError(source, message) {
  try {
    const list = globalThis.ZSRErrorLog || (globalThis.ZSRErrorLog = [])
    list.push({ source: String(source), message: String(message).slice(0, MAX_LENGTH) })
    if (list.length > MAX_KEPT) list.shift()
  } catch (_e) {
    /* recording must never throw */
  }
}

/** @returns {{ source: string, message: string }[]} */
export function getRecentErrors() {
  return globalThis.ZSRErrorLog || []
}
