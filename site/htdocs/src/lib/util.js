/**
 * Escapes the XML special characters (titles and descriptions inside RSS).
 * @param {unknown} value
 * @returns {string}
 */
export function escapeXml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Paginates an array of data.
 *
 * @param {any[]} data
 * @param {{ page?: number, limit?: number }} [args]
 * @returns {any[]}
 */
export function paginate(data, { page = 1, limit } = {}) {
  if (limit) {
    return data.slice((page - 1) * limit, page * limit)
  }

  return data
}
