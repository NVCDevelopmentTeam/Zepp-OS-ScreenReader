/**
 * Translation of text on the watch (manual, and optionally automatic).
 *
 * The watch cannot translate by itself: the text goes to the phone (method TRANSLATE), where the
 * online service the user set up does the work. The setting `translationMode` is:
 *   'off'     nothing is translated;
 *   'manual'  the menu entry "Translate" translates the focused text;
 *   'auto'    every text that gets focus is also spoken in the target language (the original is
 *             always spoken first, so navigation never waits for the network).
 * Languages: `translationSource` ('auto' lets the service find it) and `translationTarget` (empty =
 * the interface language).
 *
 * Offline: a phrasebook of translations, kept only when the user allows it (`translationRemember`),
 * answers without the network and when the phone cannot be reached. It holds at most MAX_PHRASES
 * entries, can be exported and imported as text, and is part of the settings backup. Texts leave the
 * watch only when translation is on and the user has configured a service on the phone.
 */
import { log } from '@zos/utils'
import { gettext } from '../utils/i18n.js'
import { saveSettings } from './config.js'
import { fireAndForget } from '../utils/safeCall.js'

export const MAX_PHRASES = 50
/** Longest text sent for translation; longer texts are refused instead of cut short. */
export const MAX_TRANSLATE_CHARS = 300
const CACHE_LIMIT = 50

/** Names the online service understands, for the languages ZSR has an interface in. */
const LANGUAGE_NAMES = {
  'en-US': 'English',
  'vi-VN': 'Vietnamese',
  'zh-CN': 'Chinese (Simplified)'
}

/** @typedef {{ text: string, translation: string, target: string }} Phrase */

/** @param {string} code @returns {string} */
export function languageName(code) {
  return /** @type {any} */ (LANGUAGE_NAMES)[code] || code || 'English'
}

/** @returns {{ mode: string, source: string, target: string, remember: boolean }} */
export function translationSettings() {
  const config = globalThis.ScreenReaderConfig || {}
  return {
    mode: config.translationMode || 'off',
    source: config.translationSource || 'auto',
    target: config.translationTarget || config.language || 'en-US',
    remember: config.translationRemember === true
  }
}

/**
 * @param {any} value
 * @returns {Phrase[]} only well formed entries, at most MAX_PHRASES
 */
export function sanitizePhrasebook(value) {
  let list = value
  if (typeof value === 'string') {
    try {
      list = JSON.parse(value)
    } catch (_e) {
      return []
    }
  }
  if (!Array.isArray(list)) return []
  /** @type {Phrase[]} */
  const clean = []
  list.forEach((entry) => {
    if (clean.length >= MAX_PHRASES || !entry) return
    const { text, translation, target } = entry
    if (typeof text !== 'string' || typeof translation !== 'string' || typeof target !== 'string')
      return
    if (!text.trim() || !translation.trim() || text.length > MAX_TRANSLATE_CHARS * 2) return
    clean.push({
      text: text.trim().slice(0, MAX_TRANSLATE_CHARS),
      translation: translation.trim().slice(0, MAX_TRANSLATE_CHARS * 2),
      target: target.slice(0, 20)
    })
  })
  return clean
}

/** @returns {Phrase[]} */
export function getPhrasebook() {
  return sanitizePhrasebook((globalThis.ScreenReaderConfig || {}).phrasebook)
}

/** @param {Phrase[]} list */
function savePhrasebook(list) {
  const config = globalThis.ScreenReaderConfig || (globalThis.ScreenReaderConfig = {})
  config.phrasebook = sanitizePhrasebook(list)
  saveSettings(config)
}

/** @param {string} text @param {string} target @returns {string | null} */
export function lookupPhrase(text, target) {
  const wanted = text.trim().toLowerCase()
  const found = getPhrasebook().find((p) => p.target === target && p.text.toLowerCase() === wanted)
  return found ? found.translation : null
}

/** Keep a translation for offline use (only when the user allows it); the oldest is dropped when full. */
function rememberPhrase(text, translation, target) {
  if (!translationSettings().remember) return
  const list = getPhrasebook().filter((p) => !(p.target === target && p.text === text.trim()))
  list.push({ text: text.trim(), translation, target })
  while (list.length > MAX_PHRASES) list.shift()
  savePhrasebook(list)
}

/** @returns {string} the phrasebook as a JSON text */
export function exportPhrasebook() {
  return JSON.stringify({ app: 'ZSR', kind: 'phrasebook', phrases: getPhrasebook() })
}

/** @param {any} text @returns {{ ok: boolean, count: number }} */
export function importPhrasebook(text) {
  if (typeof text !== 'string' || text.length > 20000) return { ok: false, count: 0 }
  let data
  try {
    data = JSON.parse(text)
  } catch (_e) {
    return { ok: false, count: 0 }
  }
  if (!data || data.app !== 'ZSR' || data.kind !== 'phrasebook') return { ok: false, count: 0 }
  const list = sanitizePhrasebook(data.phrases)
  savePhrasebook(list)
  return { ok: true, count: list.length }
}

export function clearPhrasebook() {
  savePhrasebook([])
}

/** @type {Map<string, string>} translations of this session */
const cache = new Map()

/**
 * Translate a text into the target language.
 * @param {string} text
 * @param {{ target?: string, source?: string }} [overrides]
 * @returns {Promise<{ ok: true, text: string, offline: boolean } | { ok: false, code: string }>}
 */
export async function translateText(text, overrides = {}) {
  const settings = translationSettings()
  const target = overrides.target || settings.target
  const source = overrides.source || settings.source
  const clean = String(text || '').trim()
  if (!clean) return { ok: false, code: 'NO_TEXT' }
  if (clean.length > MAX_TRANSLATE_CHARS) return { ok: false, code: 'TEXT_TOO_LONG' }

  const known = lookupPhrase(clean, target)
  if (known) return { ok: true, text: known, offline: true }
  const cached = cache.get(`${target}|${clean}`)
  if (cached) return { ok: true, text: cached, offline: false }

  try {
    const app = getApp()
    const builder =
      app && app._options && app._options.globalData && app._options.globalData.messageBuilder
    if (!builder) return { ok: false, code: 'UNAVAILABLE' }
    const response = await builder.request(
      {
        method: 'TRANSLATE',
        params: {
          text: clean,
          source: source === 'auto' ? 'auto' : languageName(source),
          target: languageName(target)
        }
      },
      { timeout: 30000 }
    )
    if (!response || response.result !== 'OK' || !response.text) {
      return { ok: false, code: (response && response.code) || 'FAILED' }
    }
    const translated = String(response.text)
    if (cache.size >= CACHE_LIMIT) cache.delete(cache.keys().next().value)
    cache.set(`${target}|${clean}`, translated)
    rememberPhrase(clean, translated, target)
    return { ok: true, text: translated, offline: false }
  } catch (e) {
    log.info('Translation request failed: ' + String(e))
    return { ok: false, code: 'UNAVAILABLE' }
  }
}

/** @param {string} code error code from translateText @returns {string} what to say */
export function translationErrorText(code) {
  switch (code) {
    case 'NO_TEXT':
      return gettext('Nothing to translate')
    case 'TEXT_TOO_LONG':
      return gettext('The text is too long to translate')
    case 'AI_NOT_CONFIGURED':
      return gettext(
        'The online service is not set up. Open the ZSR settings on your phone, Advanced, Online services.'
      )
    default:
      return gettext('The translation could not be done. Check your phone connection and internet.')
  }
}

/** Translate the text of the focused element and say it (the menu entry "Translate"). */
export async function translateFocusedAndSpeak() {
  const reader = globalThis.ScreenReaderInstance
  const navigation = globalThis.NavigationManagerInstance
  if (!reader) return
  if (translationSettings().mode === 'off') {
    await reader.speak(gettext('Translation is off. Turn it on in the phone settings, Advanced.'), {
      priority: 'high'
    })
    return
  }
  const current = navigation && navigation.elements[navigation.currentIndex]
  const text = current
    ? navigation.getElementText(current.element, current.type, current.options)
    : ''
  const result = await translateText(text)
  await reader.speak('text' in result ? result.text : translationErrorText(result.code), {
    priority: 'high'
  })
}

/**
 * Automatic mode: after the original text was spoken, say its translation too, unless the
 * translation is the same text or focus has moved on. Never speaks an error.
 * @param {string} text what was just spoken
 * @param {() => boolean} stillCurrent true while the same element has focus
 */
export async function autoTranslate(text, stillCurrent) {
  if (translationSettings().mode !== 'auto') return
  const clean = String(text || '').trim()
  if (clean.length < 2 || clean.length > MAX_TRANSLATE_CHARS) return
  const result = await translateText(clean)
  if (!result.ok || !stillCurrent()) return
  if (result.text.trim().toLowerCase() === clean.toLowerCase()) return
  const reader = globalThis.ScreenReaderInstance
  if (reader) fireAndForget(reader.speak(result.text, { priority: 'normal' }), 'translation')
}
