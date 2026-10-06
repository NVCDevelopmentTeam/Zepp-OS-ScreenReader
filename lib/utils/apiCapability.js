import { log } from '@zos/utils'

/**
 * Zepp OS API_LEVEL feature detection.
 *
 * Per the Zepp OS team's own guidance (Zepp OS 3.0 workshop Q&A,
 * github.com/orgs/zepp-health/discussions/159): "In API_LEVEL 2.1, we
 * added a new API getSystemInfo. If this API is detected, it means our
 * API_LEVEL version is higher than 2.0." - i.e. the officially-endorsed
 * way to adapt behavior per OS version is to detect the PRESENCE of an
 * API that's known to have shipped starting at a specific API_LEVEL,
 * never to check a device/OS version NUMBER directly (per Zepp OS's own
 * compatibility model: "developers do not need to care about the
 * firmware version number... they only need to make compatibility
 * adaptations to API_LEVEL").
 *
 * This lets ZSR run the SAME codebase across every supported device
 * (minVersion 2.0.0 up to whatever the newest device supports) and use
 * newer capabilities where available without breaking older devices -
 * matching the project's stated requirement that "each OS version only
 * uses what's appropriate for it".
 */

let cachedLevel = null

/**
 * Best-effort estimate of the running device's Zepp OS API_LEVEL, based
 * on which APIs are actually present at runtime. Returns the highest
 * level we can confirm; the true level may be higher if we haven't added
 * a detection probe for it yet.
 */
/**
 * Developer option 'apiVersionOverride' ('default' | '3.0.0' | '2.0.0'):
 * pretend to be an OLDER Zepp OS so the fallbacks (no audio, no recorder...)
 * can be tested on a newer watch or the simulator. It can only lower the level;
 * APIs that do not exist can never be switched on.
 * @returns {number} requested level, or 0 for none
 */
export function getApiOverride() {
  const value = globalThis.ScreenReaderConfig && globalThis.ScreenReaderConfig.apiVersionOverride
  if (!value || value === 'default') return 0
  const n = parseFloat(value)
  return Number.isFinite(n) ? n : 0
}

/** The API level to act on: the real one, or a lower simulated one. */
export function getApiCapabilityLevel() {
  const real = getRealApiLevel()
  const override = getApiOverride()
  return override > 0 ? Math.min(override, real) : real
}

function getRealApiLevel() {
  if (cachedLevel !== null) return cachedLevel

  let level = 2.0

  // API_LEVEL 2.1: getSystemInfo (@zos/settings)
  if (typeof globalThis.__ZSR_HAS_GET_SYSTEM_INFO__ === 'boolean') {
    if (globalThis.__ZSR_HAS_GET_SYSTEM_INFO__) level = Math.max(level, 2.1)
  }

  // API_LEVEL 3.0: checkSensor (@zos/sensor)
  if (typeof globalThis.__ZSR_HAS_CHECK_SENSOR__ === 'boolean') {
    if (globalThis.__ZSR_HAS_CHECK_SENSOR__) level = Math.max(level, 3.0)
  }

  // API_LEVEL 4.2: Custom Keyboard / SYSTEM_KEYBOARD (@zos/interaction)
  if (typeof globalThis.__ZSR_HAS_SYSTEM_KEYBOARD__ === 'boolean') {
    if (globalThis.__ZSR_HAS_SYSTEM_KEYBOARD__) level = Math.max(level, 4.2)
  }

  cachedLevel = level
  return level
}

/**
 * Call once at app startup (before other init() calls that might want to
 * branch on API level) to populate the presence flags this module reads.
 * Split out from getApiCapabilityLevel() itself because the actual
 * imports needed to probe each API are conditional/module-specific and
 * better resolved once, up front, than repeatedly.
 *
 * @param {object} probes - results of `typeof X !== 'undefined'` checks
 *   for each API, gathered by the caller (app.js) since dynamically
 *   importing @zos/* modules conditionally isn't reliable across bundler
 *   targets - callers already have static imports available.
 */
export function registerApiCapabilityProbes(probes = {}) {
  if (typeof probes.getSystemInfo !== 'undefined') {
    globalThis.__ZSR_HAS_GET_SYSTEM_INFO__ = typeof probes.getSystemInfo === 'function'
  }
  if (typeof probes.checkSensor !== 'undefined') {
    globalThis.__ZSR_HAS_CHECK_SENSOR__ = typeof probes.checkSensor === 'function'
  }
  if (typeof probes.SYSTEM_KEYBOARD !== 'undefined') {
    globalThis.__ZSR_HAS_SYSTEM_KEYBOARD__ = probes.SYSTEM_KEYBOARD !== undefined
  }
  cachedLevel = null // force recompute on next getApiCapabilityLevel() call
  log.info(`ZSR: detected API capability level >= ${getApiCapabilityLevel()}`)
}

/**
 * Safely construct a sensor, preferring the real checkSensor() API
 * (API_LEVEL 3.0+) to know in advance whether it's worth trying, and
 * falling back to a plain try/catch construct-and-see for older API
 * levels where checkSensor() doesn't exist yet. Either way, a sensor
 * that isn't available on this device returns null instead of throwing -
 * see lib/core/sensorReader.js and lib/core/accessibility.js for why a
 * single unsupported sensor must never crash the whole module.
 *
 * @param {Function} SensorClass
 * @param {string} name - for logging only
 * @param {Function} [checkSensorFn] - pass the real checkSensor import if
 *   the caller has it (only exists API_LEVEL 3.0+); omit to always fall
 *   back to try/catch.
 */
export function createSensorSafely(SensorClass, name, checkSensorFn) {
  try {
    if (typeof checkSensorFn === 'function') {
      const available = checkSensorFn(SensorClass)
      if (!available) {
        log.info(`Sensor "${name}" reported unavailable by checkSensor() - skipping.`)
        return null
      }
    }
    return new SensorClass()
  } catch (e) {
    log.error(`Sensor "${name}" is unavailable on this device`, e)
    return null
  }
}
