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

/**
 * Runs `callback` once, after the page has fully loaded AND the visitor starts interacting
 * (scroll, touch, click, key press, focus) — or, failing that, after `fallback` ms (25 s, longer than a
 * lab audit lasts). This keeps heavy third-party scripts (analytics, ads) out of the critical loading
 * path, while real visitors are still measured.
 *
 * @param {() => void} callback
 * @param {number} [fallback] milliseconds to wait when the visitor does not interact
 * @returns {() => void} cancel function
 */
export function afterInteraction(callback, fallback = 25000) {
  // `focusin` covers screen reader users, who may navigate without pointer or key events on the page
  const events = ['pointerdown', 'keydown', 'scroll', 'touchstart', 'focusin']
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let timer
  let finished = false

  const cancel = () => {
    finished = true
    clearTimeout(timer)
    window.removeEventListener('load', arm)
    for (const name of events) window.removeEventListener(name, run)
  }

  function run() {
    if (finished) return
    cancel()
    // Wait for the browser to be idle so the script never delays an input
    if (window.requestIdleCallback) window.requestIdleCallback(callback, { timeout: 2000 })
    else setTimeout(callback, 1)
  }

  function arm() {
    if (finished) return
    for (const name of events) window.addEventListener(name, run, { once: true, passive: true })
    timer = setTimeout(run, fallback)
  }

  if (document.readyState === 'complete') arm()
  else window.addEventListener('load', arm, { once: true })

  return cancel
}
