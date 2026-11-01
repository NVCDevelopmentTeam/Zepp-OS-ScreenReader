/**
 * Backup and restore of ZSR's settings.
 *
 * A backup is one JSON text: `{ app: 'ZSR', schema, version, settings }`.
 *  - `schema` is the layout of the settings. When the settings change shape, raise
 *    SETTINGS_SCHEMA_VERSION and add a step to MIGRATIONS; older backups are then migrated
 *    on restore. A backup from a NEWER schema is refused (it may mean something different).
 *  - Restoring validates everything: only settings ZSR knows are accepted, each is converted to
 *    the type of its default, and a backup that fails any check changes nothing.
 *  - A backup holds no personal data and no secrets: only the settings listed in ServerConfig.
 *
 * One backup can also be kept on the watch (`saveLocalBackup`), and a copy is stored on the phone
 * for the user to keep (see AdvancedSettings in the phone settings).
 */
import { ServerConfig, saveSettings } from './config.js'
import { coerceSettingValue } from '../utils/settingValue.js'
import { getStored, setStored } from '../utils/storage.js'
import { ZSR_VERSION } from '../utils/version.js'

export const SETTINGS_SCHEMA_VERSION = 2

/** Refuse anything bigger: a settings backup is a few kilobytes. */
const MAX_BACKUP_CHARS = 20000
const LOCAL_BACKUP_KEY = 'zsr_settings_backup'

/**
 * Steps that bring settings from one schema to the next; the key is the schema the data comes
 * FROM. Schema 1 was the original layout.
 * @type {Record<number, (settings: Record<string, any>) => Record<string, any>>}
 */
const MIGRATIONS = {
  1: (settings) => {
    // Gesture actions were once stored as 'read_screen'; the action is now 'read_all'.
    const migrated = Object.assign({}, settings)
    Object.keys(migrated).forEach((key) => {
      if (/^gesture_/.test(key) && migrated[key] === 'read_screen') migrated[key] = 'read_all'
    })
    return migrated
  }
}

/**
 * @param {Record<string, any>} settings
 * @param {number} fromSchema
 * @returns {Record<string, any>} the settings in the current schema
 */
export function migrateSettings(settings, fromSchema) {
  let current = settings
  for (let schema = fromSchema; schema < SETTINGS_SCHEMA_VERSION; schema++) {
    const step = MIGRATIONS[schema]
    if (step) current = step(current)
  }
  return current
}

/**
 * @param {Record<string, any>} config the settings in use
 * @returns {string} the backup text
 */
export function createBackup(config) {
  /** @type {Record<string, any>} */
  const settings = {}
  Object.keys(ServerConfig).forEach((key) => {
    if (config && config[key] !== undefined) settings[key] = config[key]
  })
  return JSON.stringify({
    app: 'ZSR',
    schema: SETTINGS_SCHEMA_VERSION,
    version: ZSR_VERSION,
    settings
  })
}

/**
 * Check a backup and turn it into settings that are safe to apply. Nothing is changed here.
 * @param {any} text
 * @returns {{ ok: true, settings: Record<string, any>, ignored: number, schema: number } | { ok: false, error: 'EMPTY' | 'TOO_LARGE' | 'NOT_JSON' | 'NOT_ZSR' | 'NEWER_SCHEMA' | 'NO_SETTINGS' }}
 */
export function parseBackup(text) {
  if (typeof text !== 'string' || text.trim() === '') return { ok: false, error: 'EMPTY' }
  if (text.length > MAX_BACKUP_CHARS) return { ok: false, error: 'TOO_LARGE' }

  let data
  try {
    data = JSON.parse(text)
  } catch (_e) {
    return { ok: false, error: 'NOT_JSON' }
  }
  if (!data || typeof data !== 'object' || data.app !== 'ZSR')
    return { ok: false, error: 'NOT_ZSR' }

  const schema = Number(data.schema)
  if (!Number.isInteger(schema) || schema < 1) return { ok: false, error: 'NOT_ZSR' }
  if (schema > SETTINGS_SCHEMA_VERSION) return { ok: false, error: 'NEWER_SCHEMA' }
  if (!data.settings || typeof data.settings !== 'object' || Array.isArray(data.settings)) {
    return { ok: false, error: 'NO_SETTINGS' }
  }

  const migrated = migrateSettings(data.settings, schema)
  /** @type {Record<string, any>} */
  const settings = {}
  let ignored = 0
  Object.keys(migrated).forEach((key) => {
    // Only settings ZSR knows, and never keys that could reach Object.prototype
    if (!Object.prototype.hasOwnProperty.call(ServerConfig, key)) {
      ignored++
      return
    }
    const fallback = /** @type {any} */ (ServerConfig)[key]
    const value = coerceSettingValue(migrated[key], fallback)
    const sameKind =
      typeof value === typeof fallback && (typeof value !== 'number' || Number.isFinite(value))
    if (sameKind) settings[key] = value
    else ignored++
  })
  return { ok: true, settings, ignored, schema }
}

/**
 * Validate and apply a backup. Either all valid settings are applied and saved, or nothing is.
 * @param {any} text
 * @returns {ReturnType<typeof parseBackup>}
 */
export function restoreBackup(text) {
  const result = parseBackup(text)
  if (!result.ok) return result
  const config = globalThis.ScreenReaderConfig || (globalThis.ScreenReaderConfig = {})
  Object.assign(config, result.settings)
  saveSettings(config)
  return result
}

/** Keep one backup on the watch. @param {Record<string, any>} config */
export function saveLocalBackup(config) {
  const backup = createBackup(config)
  setStored(LOCAL_BACKUP_KEY, backup)
  return backup
}

/** @returns {string | undefined} the backup kept on the watch, if any */
export function loadLocalBackup() {
  return getStored(LOCAL_BACKUP_KEY)
}
