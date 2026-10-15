/**
 * Start-up problems, reported through channels a blind user can perceive.
 *
 * ZSR users cannot read the watch screen, and the people who help them are
 * often not technical, so a problem is never drawn on screen. Instead every
 * failing step is:
 *   1. kept in a small bounded list (shared by all bundles through globalThis),
 *   2. written to the developer log (visible with `zeus dev` / `zeus bridge`),
 *   3. signalled by vibration (one pulse = ZSR opened, three = started with a
 *      problem), and spoken once as soon as the reader can speak,
 *   4. included in the spoken diagnostics ("Read diagnostics" on the Contact
 *      page), which is what the user can read out to a helper or send by mail.
 */
import { log } from '@zos/utils'
import { safeDeviceInfo } from './deviceInfo.js'
import { getApiCapabilityLevel } from './apiCapability.js'
import { getMedia } from '../equipment/mediaSupport.js'
import { ZSR_VERSION } from './version.js'
import { VibrationManager } from '../feedback/vibrateFeedback.js'
import { gettext, format } from './i18n.js'
import { pushError } from './errorBuffer.js'
import { safeTimeout } from './safeCall.js'

const MAX_KEPT = 12
const MAX_MESSAGE_LENGTH = 160
/** Delay between the three error pulses, in milliseconds. */
const PULSE_GAP_MS = 600

/**
 * @param {string} stage short name of the step that failed
 * @param {any} error
 */
export function recordBootError(stage, error) {
  try {
    const list = globalThis.ZSRBootErrors || (globalThis.ZSRBootErrors = [])
    const message = String((error && error.message) || error || 'unknown error')
    if (list.length < MAX_KEPT) {
      list.push({ stage: String(stage), message: message.slice(0, MAX_MESSAGE_LENGTH) })
    }
    pushError('boot ' + stage, message)
    log.warn('[ZSR boot] ' + stage + ': ' + message)
  } catch (_e) {
    /* recording must never throw */
  }
}

/** @returns {{ stage: string, message: string }[]} */
export function getBootErrors() {
  return globalThis.ZSRBootErrors || []
}

/**
 * Haptic status for a user who cannot read the screen. ONE pulse = ZSR has
 * opened; THREE pulses = ZSR started with a problem.
 * @param {'started' | 'problem'} kind
 */
export function signalBootStatus(kind) {
  try {
    const shared = globalThis.ScreenReaderInstance && globalThis.ScreenReaderInstance.vibration
    const vibrator = shared || new VibrationManager()
    if (kind === 'started') {
      vibrator.vibrate('success')
      return
    }
    vibrator.vibrate('error')
    safeTimeout(() => vibrator.vibrate('error'), PULSE_GAP_MS)
    safeTimeout(() => vibrator.vibrate('error'), PULSE_GAP_MS * 2)
  } catch (_e) {
    /* haptics are optional; never break start-up */
  }
}

/** One line identifying this build and what the watch supports. */
export function bootSummary() {
  try {
    const { width, height } = safeDeviceInfo()
    return `ZSR ${ZSR_VERSION} | API ${getApiCapabilityLevel()} | audio ${getMedia() ? 'yes' : 'no'} | ${width}x${height}`
  } catch (_e) {
    return `ZSR ${ZSR_VERSION}`
  }
}

/** Recorded problems as speakable text, or '' when everything started fine. */
export function describeBootErrors() {
  const errors = getBootErrors()
  if (errors.length === 0) return ''
  const lines = errors.slice(0, 5).map((e) => `${e.stage}: ${e.message}`)
  return [format(gettext('Start-up problems: {0}'), errors.length), ...lines].join('\n')
}

/**
 * Tell the user, once per session, that something went wrong: three pulses and
 * a short spoken hint. Speech is best effort (it may not be available yet).
 */
export function announceBootProblems() {
  if (getBootErrors().length === 0 || globalThis.ZSRBootProblemAnnounced) return
  globalThis.ZSRBootProblemAnnounced = true
  signalBootStatus('problem')
  try {
    const reader = globalThis.ScreenReaderInstance
    if (reader && typeof reader.speak === 'function') {
      Promise.resolve(
        reader.speak(
          globalThis.ZSRSafeMode
            ? gettext(
                'ZSR closed unexpectedly before, so it started in safe mode. Some extra features are off until it runs steadily.'
              )
            : gettext(
                'ZSR started with a problem. Open About, then Contact, then Read diagnostics.'
              ),
          { priority: 'high' }
        )
      ).catch((e) => log.warn('Boot problem announcement failed: ' + String(e)))
    }
  } catch (_e) {
    /* announcing is best effort */
  }
}
