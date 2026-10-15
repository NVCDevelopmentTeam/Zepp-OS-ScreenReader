/**
 * Typed access to the watch's local storage.
 *
 * The official typings declare `localStorage.getItem()` as returning `void`, although the
 * documentation says it returns the stored value (or the default). This module is the one
 * place that bridges that gap so callers get a plain string.
 */
import { localStorage } from '@zos/storage'

/**
 * @param {string} key
 * @returns {string | undefined} stored text, or undefined when nothing is stored
 */
export function getStored(key) {
  /** @type {any} */
  const value = localStorage.getItem(key)
  return typeof value === 'string' && value !== '' ? value : undefined
}

/**
 * @param {string} key
 * @param {string} value
 */
export function setStored(key, value) {
  localStorage.setItem(key, value)
}
