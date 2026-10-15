/**
 * Detects that the previous run of ZSR ended without closing normally (for example the
 * system stopped it after an error) and keeps a crash loop from locking the user out.
 *
 * A blind user cannot read an error and cannot restart a stopped screen reader, so:
 *   - every start leaves a marker in local storage ("running", plus the last stage reached);
 *   - a normal close removes it;
 *   - if the next start still finds the marker and that run had not yet lasted STABLE_AFTER_MS,
 *     the previous run died: it is recorded
 *     (and reported to the user by vibration and speech, see bootErrors.js);
 *   - after SAFE_MODE_AFTER crashes in a row ZSR starts in SAFE MODE: only the core reader,
 *     gestures and shortcuts run; optional parts (voice commands, accessibility extras,
 *     speech engine warm-up) stay off until a run lasts STABLE_AFTER_MS.
 */
import { getStored, setStored } from './storage.js'
import { log } from '@zos/utils'
import { pushError } from './errorBuffer.js'
import { safeTimeout } from './safeCall.js'

const STORAGE_KEY = 'zsr_run_state'
/** Consecutive unexpected endings before optional features are switched off. */
const SAFE_MODE_AFTER = 2
/** A run this long without dying counts as healthy and clears the crash counter. */
const STABLE_AFTER_MS = 30000

/** @returns {{ running?: boolean, stable?: boolean, stage?: string, crashes?: number }} */
function readState() {
  try {
    const raw = getStored(STORAGE_KEY)
    const parsed = raw ? JSON.parse(raw) : null
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch (_e) {
    return {}
  }
}

/** @param {object} state */
function writeState(state) {
  try {
    setStored(STORAGE_KEY, JSON.stringify(state))
  } catch (e) {
    log.debug('Run state could not be saved: ' + String(e))
  }
}

/**
 * Call once, first thing at start-up.
 * @returns {{ crashes: number, stage: string, safeMode: boolean }}
 */
export function beginRun() {
  const previous = readState()
  // A run that lasted STABLE_AFTER_MS counts as healthy: if the system later stopped it without
  // a normal close, that is not a start-up crash and must not raise an alarm.
  const diedBefore = previous.running === true && previous.stable !== true
  const crashes = diedBefore ? (previous.crashes || 0) + 1 : 0
  const stage = diedBefore ? previous.stage || 'unknown' : ''
  const safeMode = crashes >= SAFE_MODE_AFTER

  globalThis.ZSRPreviousCrash = diedBefore ? { crashes, stage } : null
  globalThis.ZSRSafeMode = safeMode
  if (diedBefore) {
    pushError('previous run', `ended unexpectedly at "${stage}" (${crashes} in a row)`)
  }

  writeState({ running: true, stable: false, stage: 'start', crashes })
  safeTimeout(() => {
    const current = readState()
    if (current.running) writeState(Object.assign({}, current, { stable: true, crashes: 0 }))
    if (globalThis.ZSRSafeMode)
      log.info('Run is stable; optional features return at the next start')
  }, STABLE_AFTER_MS)
  return { crashes, stage, safeMode }
}

/**
 * Remember how far start-up / the current page got. If the system stops the app, the next
 * start knows where it happened.
 * @param {string} stage
 */
export function markStage(stage) {
  writeState(Object.assign({}, readState(), { running: true, stage }))
}

/** Call when ZSR closes normally. */
export function endRun() {
  writeState({ running: false, stable: true, stage: 'closed', crashes: 0 })
}

/** @returns {boolean} true while only the core reader should run */
export function isSafeMode() {
  return globalThis.ZSRSafeMode === true
}
