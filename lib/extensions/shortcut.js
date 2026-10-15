/**
 * Shortcuts for operating ZSR from an external keyboard or a key pad that reports the key
 * codes in `KEY_MAP` (see keyboard.js). Zepp OS does not document external keyboard events,
 * so this only acts when a firmware delivers them; the watch's own buttons are handled by
 * lib/interaction/shortcut.js.
 */
import { KEY_MAP } from './keyboard.js'

/**
 * @param {number} keyCode one of KEY_MAP
 * @returns {boolean} true when the key was used
 */
export function handleExternalKey(keyCode) {
  const navigation = globalThis.NavigationManagerInstance
  if (!navigation) return false
  switch (keyCode) {
    case KEY_MAP.UP:
    case KEY_MAP.LEFT:
      navigation.navigate('previous')
      return true
    case KEY_MAP.DOWN:
    case KEY_MAP.RIGHT:
      navigation.navigate('next')
      return true
    case KEY_MAP.SELECT:
      navigation.handleSelection()
      return true
    default:
      return false
  }
}

export default handleExternalKey
