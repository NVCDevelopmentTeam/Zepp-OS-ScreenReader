/**
 * Favorites: the places in ZSR a user jumps to most, listed first on the home screen.
 *
 * Stored as the setting `favorites` (a list of `{ url, name }`), so they are kept with the other
 * settings and are part of the settings backup and restore. Only pages listed in
 * lib/utils/destinations.js are accepted, and the list is bounded.
 *
 * add, remove, rename, move (reorder), open (the home screen), export and import (a JSON text).
 */
import { saveSettings } from './config.js'
import {
  destinationCatalog,
  destinationName,
  isDestination,
  homeItems
} from '../utils/destinations.js'
import { gettext } from '../utils/i18n.js'

export const MAX_FAVORITES = 20
const MAX_NAME_LENGTH = 40

/** @typedef {{ url: string, name: string }} Favorite */

/** @param {string} text */
function parseJson(text) {
  try {
    return JSON.parse(text)
  } catch (_e) {
    return null
  }
}

/**
 * Make any value safe to store: only known pages, no duplicates, names trimmed, list bounded.
 * @param {any} value
 * @returns {Favorite[]}
 */
export function sanitizeFavorites(value) {
  const list = typeof value === 'string' ? parseJson(value) : value
  if (!Array.isArray(list)) return []
  /** @type {Favorite[]} */
  const clean = []
  list.forEach((entry) => {
    if (clean.length >= MAX_FAVORITES || !entry || typeof entry.url !== 'string') return
    if (!isDestination(entry.url) || clean.some((f) => f.url === entry.url)) return
    const name = typeof entry.name === 'string' ? entry.name.trim().slice(0, MAX_NAME_LENGTH) : ''
    clean.push({ url: entry.url, name })
  })
  return clean
}

/** @returns {Favorite[]} the stored favorites (a custom name, or '' for the page's own name) */
export function listFavorites() {
  const config = globalThis.ScreenReaderConfig || {}
  return sanitizeFavorites(config.favorites)
}

/** @param {Favorite[]} list */
function save(list) {
  const config = globalThis.ScreenReaderConfig || (globalThis.ScreenReaderConfig = {})
  config.favorites = sanitizeFavorites(list)
  saveSettings(config)
}

/** @param {string} url @returns {boolean} */
export function isFavorite(url) {
  return listFavorites().some((f) => f.url === url)
}

/** @param {Favorite} favorite @returns {string} what is shown and spoken */
export function favoriteName(favorite) {
  return favorite.name || destinationName(favorite.url)
}

/**
 * @param {string} url
 * @returns {'added' | 'exists' | 'full' | 'unknown'}
 */
export function addFavorite(url) {
  if (!isDestination(url)) return 'unknown'
  const list = listFavorites()
  if (list.some((f) => f.url === url)) return 'exists'
  if (list.length >= MAX_FAVORITES) return 'full'
  list.push({ url, name: '' })
  save(list)
  return 'added'
}

/** @param {string} url @returns {boolean} true when it was a favorite */
export function removeFavorite(url) {
  const list = listFavorites()
  const kept = list.filter((f) => f.url !== url)
  if (kept.length === list.length) return false
  save(kept)
  return true
}

/**
 * @param {string} url
 * @param {string} name a new name; empty goes back to the page's own name
 * @returns {boolean}
 */
export function renameFavorite(url, name) {
  const list = listFavorites()
  const favorite = list.find((f) => f.url === url)
  if (!favorite) return false
  favorite.name = String(name || '')
    .trim()
    .slice(0, MAX_NAME_LENGTH)
  save(list)
  return true
}

/**
 * @param {string} url
 * @param {number} delta -1 = one place earlier, 1 = one place later
 * @returns {boolean} false when it cannot move that way
 */
export function moveFavorite(url, delta) {
  const list = listFavorites()
  const from = list.findIndex((f) => f.url === url)
  const to = from + delta
  if (from < 0 || to < 0 || to >= list.length) return false
  const moved = list.splice(from, 1)[0]
  list.splice(to, 0, moved)
  save(list)
  return true
}

/** @returns {string} the favorites as one JSON text (for a plugin, or to keep elsewhere) */
export function exportFavorites() {
  return JSON.stringify({ app: 'ZSR', kind: 'favorites', favorites: listFavorites() })
}

/**
 * Replace the favorites with an exported text. Nothing changes when the text is not valid.
 * @param {any} text
 * @returns {{ ok: boolean, count: number }}
 */
export function importFavorites(text) {
  if (typeof text !== 'string' || text.length > 5000) return { ok: false, count: 0 }
  const data = parseJson(text)
  if (!data || typeof data !== 'object' || data.app !== 'ZSR' || data.kind !== 'favorites') {
    return { ok: false, count: 0 }
  }
  const list = sanitizeFavorites(data.favorites)
  save(list)
  return { ok: true, count: list.length }
}

/** @returns {{ name: string, url: string }[]} the home list: favorites first, then the fixed entries */
export function homeListItems() {
  const favorites = listFavorites().map((f) => ({
    name: `${gettext('Favorite')}: ${favoriteName(f)}`,
    url: f.url
  }))
  return favorites.concat(homeItems())
}

export { destinationCatalog }
