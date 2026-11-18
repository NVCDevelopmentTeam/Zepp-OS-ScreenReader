/**
 * The places in ZSR a user can jump to, and the order of the home screen list.
 * Favorites (lib/core/favorites.js) can only point at these, so a restored or imported favorite can
 * never open a page that does not exist (`npm run check:targets` checks every address below).
 */
import { gettext } from './i18n.js'

/** @returns {{ url: string, name: string }[]} the pages that can be made favorites */
export function destinationCatalog() {
  return [
    { url: 'page/home/Settings', name: gettext('Settings') },
    { url: 'page/userGuide/userGuide', name: gettext('User Guide') },
    { url: 'page/home/Sensors', name: gettext('Sensors') },
    { url: 'page/tools/TextEditor', name: gettext('Text Editor') },
    { url: 'page/home/History', name: gettext('Speech History') },
    { url: 'page/about/AppInfo', name: gettext('About') },
    { url: 'page/settings/General', name: gettext('General') },
    { url: 'page/settings/Activation', name: gettext('Activation') },
    { url: 'page/settings/Speech', name: gettext('Speech') },
    { url: 'page/settings/Vision', name: gettext('Vision') },
    { url: 'page/settings/GesturesInput', name: gettext('Gestures & Input') },
    { url: 'page/settings/Notifications', name: gettext('Notifications') },
    { url: 'page/settings/ObjectPresentation', name: gettext('Object Presentation') },
    { url: 'page/settings/Navigation', name: gettext('Cursor & Navigation') },
    { url: 'page/settings/AudioBraille', name: gettext('Audio & Braille') },
    { url: 'page/settings/InputComposition', name: gettext('Input Composition') },
    { url: 'page/settings/RemoteAccess', name: gettext('Remote Access') },
    { url: 'page/settings/Document', name: gettext('Document Settings') },
    { url: 'page/about/UpdateChecker', name: gettext('Check for Updates') },
    { url: 'page/settings/AdvancedSettings', name: gettext('Developer Options') }
  ]
}

/** @param {string} url @returns {boolean} */
export function isDestination(url) {
  return destinationCatalog().some((entry) => entry.url === url)
}

/** @param {string} url @returns {string} the page's own name, or '' when it is not a destination */
export function destinationName(url) {
  const found = destinationCatalog().find((entry) => entry.url === url)
  return found ? found.name : ''
}

/** @returns {{ name: string, url: string }[]} the fixed entries of the home list */
export function homeItems() {
  return [
    { name: gettext('Settings'), url: 'page/home/Settings' },
    { name: gettext('User Guide'), url: 'page/userGuide/userGuide' },
    { name: gettext('Sensors'), url: 'page/home/Sensors' },
    { name: gettext('Text Editor'), url: 'page/tools/TextEditor' },
    { name: gettext('Speech History'), url: 'page/home/History' },
    { name: gettext('Favorites'), url: 'page/home/Favorites' },
    { name: gettext('About'), url: 'page/about/AppInfo' }
  ]
}
