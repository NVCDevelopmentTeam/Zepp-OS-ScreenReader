/**
 * Verbosity: how much ZSR says when focus lands on an element.
 *
 *   minimal   the label, and the state of a control (a switch that is off must say so)
 *   standard  label, role and state
 *   detailed  label, role, state, position in a list, screen region and usage hint
 *   custom    each part is switched separately (`speakRoles`, `speakStates`, `speakUnlabeled`,
 *             `readListPosition`, `announceRegions`, `readUsageHints`)
 *
 * Punctuation, status-bar and progress reading keep their own settings in the speech settings.
 */
import { gettext, format } from '../utils/i18n.js'
import { saveSettings } from './config.js'
import { log } from '@zos/utils'

export const VERBOSITY_LEVELS = ['minimal', 'standard', 'detailed', 'custom']

/** @typedef {{ roles: boolean, states: boolean, hints: boolean, listPosition: boolean, regions: boolean, unlabeled: boolean }} VerbosityFlags */

/** @type {Record<string, VerbosityFlags>} */
const PRESETS = {
  minimal: {
    roles: false,
    states: true,
    hints: false,
    listPosition: false,
    regions: false,
    unlabeled: false
  },
  standard: {
    roles: true,
    states: true,
    hints: false,
    listPosition: false,
    regions: false,
    unlabeled: true
  },
  detailed: {
    roles: true,
    states: true,
    hints: true,
    listPosition: true,
    regions: true,
    unlabeled: true
  }
}

/**
 * @param {any} config the ScreenReaderConfig
 * @returns {VerbosityFlags} which parts of an announcement are spoken
 */
export function resolveVerbosity(config) {
  const settings = config || {}
  if (settings.verbosity === 'custom') {
    return {
      roles: settings.speakRoles !== false,
      states: settings.speakStates !== false,
      hints: settings.readUsageHints !== false,
      listPosition: settings.readListPosition !== false,
      regions: settings.announceRegions !== false,
      unlabeled: settings.speakUnlabeled !== false
    }
  }
  return PRESETS[settings.verbosity] || PRESETS.detailed
}

/** @param {string} level @returns {string} the next level, wrapping around */
export function nextVerbosity(level) {
  const at = VERBOSITY_LEVELS.indexOf(level)
  return VERBOSITY_LEVELS[(at + 1) % VERBOSITY_LEVELS.length]
}

/** @param {string} level @returns {string} the level's name in the user's language */
export function verbosityName(level) {
  switch (level) {
    case 'minimal':
      return gettext('Minimal')
    case 'standard':
      return gettext('Standard')
    case 'custom':
      return gettext('Custom')
    default:
      return gettext('Detailed')
  }
}

/**
 * Set and save the verbosity level.
 * @param {string} level one of VERBOSITY_LEVELS
 * @param {boolean} [announce] say the new level aloud
 * @returns {string} the level now in effect
 */
export function setVerbosity(level, announce = false) {
  const config = globalThis.ScreenReaderConfig || (globalThis.ScreenReaderConfig = {})
  config.verbosity = VERBOSITY_LEVELS.includes(level) ? level : 'detailed'
  try {
    saveSettings(config)
  } catch (e) {
    log.warn('Verbosity could not be saved: ' + String(e))
  }
  if (announce) {
    const reader = globalThis.ScreenReaderInstance
    if (reader && typeof reader.speak === 'function') {
      reader.speak(format(gettext('Verbosity: {0}'), verbosityName(config.verbosity)), {
        priority: 'high'
      })
    }
  }
  return config.verbosity
}

/**
 * Move to the next level (minimal, standard, detailed, custom).
 * @param {boolean} [announce] say the new level aloud
 * @returns {string} the level now in effect
 */
export function cycleVerbosity(announce = true) {
  const config = globalThis.ScreenReaderConfig || {}
  return setVerbosity(nextVerbosity(config.verbosity || 'detailed'), announce)
}
