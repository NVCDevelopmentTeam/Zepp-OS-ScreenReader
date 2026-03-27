/**
 * Paginates an array of data.
 *
 * @param {any[]} data
 * @param {{ page?: number, limit: number }} args
 * @returns
 */
export function paginate(data, { page = 1, limit } = {}) {
  if (limit) {
    return data.slice((page - 1) * limit, page * limit)
  }

  return data
}

/**
 * Checks if the user agent is a mobile device.
 * @param {string} ua 
 * @returns {boolean}
 */
export function isMobile(ua) {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
}
