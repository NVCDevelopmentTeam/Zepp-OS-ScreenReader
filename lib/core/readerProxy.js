/**
 * Light-weight access to the screen reader for pages.
 *
 * The reader itself is created and initialised once, in app.js. Every page is
 * bundled separately, so importing lib/core/screenReader.js from a page copies
 * the whole reader (speech engines, sound, haptics...) into that page's bundle
 * - dozens of KB per page. Pages use this facade instead; it forwards to the
 * shared instance at call time and does nothing if the reader is not up yet.
 *
 * (No Proxy object: older Zepp OS JavaScript engines may not provide it.)
 */
const reader = () => globalThis.ScreenReaderInstance

const readerProxy = {
  speak(...args) {
    const r = reader()
    return r ? r.speak(...args) : Promise.resolve(false)
  },
  toggleEnabled(...args) {
    const r = reader()
    return r ? r.toggleEnabled(...args) : undefined
  },
  toggleMute(...args) {
    const r = reader()
    return r ? r.toggleMute(...args) : undefined
  },
  on(...args) {
    const r = reader()
    return r ? r.on(...args) : undefined
  },
  init(...args) {
    const r = reader()
    // Always a Promise: callers chain .then() on it, and the reader may not exist
    // yet (for example if app.js failed to start). Never throw from here.
    return r ? Promise.resolve(r.init(...args)) : Promise.resolve(false)
  },
  get enabled() {
    const r = reader()
    return r ? r.enabled : false
  },
  get tts() {
    const r = reader()
    return r ? r.tts : undefined
  },
  get vibration() {
    const r = reader()
    return r ? r.vibration : undefined
  },
  get sound() {
    const r = reader()
    return r ? r.sound : undefined
  }
}

export default readerProxy
