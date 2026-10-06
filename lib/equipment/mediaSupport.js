/**
 * Safe access to '@zos/media' (audio player / recorder).
 *
 * '@zos/media' starts at API_LEVEL 3.0. A static `import` of it makes the whole
 * app fail to load on Zepp OS 2.0 devices (ZSR's minimum), so it is loaded with
 * a guarded dynamic import instead. On firmware without it, getMedia() returns
 * null and every audio feature degrades to haptic feedback.
 */
import { log } from '@zos/utils'
import { getApiOverride } from '../utils/apiCapability.js'

/** True when the developer option simulates an OS older than audio support (3.0). */
function simulatedNoAudio() {
  const override = getApiOverride()
  return override > 0 && override < 3
}

/** @type {{ create: Function, id: any } | null} */
let media = globalThis.ZSRMediaSupport ? globalThis.ZSRMediaSupport.media : null
/** Full module namespace, for optional members such as a future native `Tts`. */
/** @type {any} */
let mediaModule = globalThis.ZSRMediaSupport ? globalThis.ZSRMediaSupport.mod : null
let attempted = media !== null
/** @type {Promise<any> | null} */
let pending = null

/**
 * Resolve '@zos/media' once. Call (and await) early in app startup.
 * @returns {Promise<boolean>} true when audio playback is available
 */
export function loadMedia() {
  if (attempted) return Promise.resolve(media !== null)
  if (pending) return pending.then(() => media !== null)
  pending = (async () => {
    try {
      const mod = await import('@zos/media')
      if (mod && typeof mod.create === 'function' && mod.id) {
        media = { create: mod.create, id: mod.id }
        mediaModule = mod
        // Pages are bundled separately: share the result with their module copies.
        globalThis.ZSRMediaSupport = { media, mod }
      }
    } catch (e) {
      log.info('Audio playback unavailable on this firmware (@zos/media): ' + String(e))
    }
    attempted = true
    pending = null
  })()
  return pending.then(() => media !== null)
}

/** @returns {{ create: Function, id: any } | null} */
export function getMedia() {
  return simulatedNoAudio() ? null : media
}

/** @returns {any} the '@zos/media' namespace, or null when unavailable */
export function getMediaModule() {
  return simulatedNoAudio() ? null : mediaModule
}

/** Create a player, or null when audio is not supported / not loaded yet. */
export function createPlayer() {
  if (!media) return null
  try {
    return media.create(media.id.PLAYER)
  } catch (e) {
    log.error('Failed to create audio player:', e)
    return null
  }
}
