/**
 * ZSRPage - drop-in replacement for the global `Page(...)` used by every ZSR
 * page. It performs, explicitly and deterministically, what the old
 * global-monkey-patching PageInterceptor tried (and could not reliably) do:
 *
 *  - reset the navigable-element list for the new page,
 *  - run the page's own build(),
 *  - attach the touch-exploration layer ON TOP of the finished page,
 *  - announce the page and focus its first element,
 *  - tear everything down on destroy.
 *
 * Only official page config keys (onInit / build / onDestroy) are used, so it
 * behaves the same on Zepp OS 2.0 through the newest release.
 */
import { log } from '@zos/utils'

// Shared instances created by app.js (see zsrWidgets.js for why no imports).
const nav = () => globalThis.NavigationManagerInstance
const reader = () => globalThis.ScreenReaderInstance
const ui = () => globalThis.ScreenReaderUIInstance
const gestures = () => globalThis.GestureHandlerInstance
const shortcuts = () => globalThis.ShortcutHandlerInstance
import { gettext } from '../utils/i18n.js'

/**
 * @param {any} config Standard Zepp OS Page config
 */
export function ZSRPage(config) {
  const originalOnInit = config.onInit
  const originalBuild = config.build
  const originalOnDestroy = config.onDestroy

  // Tell the global PageInterceptor this page is already handled.
  config.__zsrWrapped = true

  config.onInit = function (params) {
    try {
      nav()?.clearElements()
      // onKey/onGesture allow a single listener: (re)bind on every page so the
      // hardware shortcut and swipes work on whichever page is showing.
      gestures()?.bindSystemGestures()
      shortcuts()?.initHardwareShortcut()
    } catch (e) {
      log.warn('ZSRPage onInit setup failed: ' + (e && e.message))
    }
    // Spec item 50: speech and queued announcements of the PREVIOUS screen must
    // not carry on into this one. (The page's own onInit announcements follow.)
    try {
      const r = reader()
      if (r && typeof r.stop === 'function') r.stop(true)
    } catch (e) {
      log.warn('ZSRPage speech cancel failed: ' + (e && e.message))
    }
    return originalOnInit ? originalOnInit.call(this, params) : undefined
  }

  config.build = function () {
    let result
    try {
      result = originalBuild ? originalBuild.call(this) : undefined
    } catch (e) {
      // Keep the reader alive even if a page fails to build fully.
      log.error('Page build failed: ' + (e && e.message))
    }

    try {
      ui()?.attach()
    } catch (e) {
      log.error('ScreenReaderUI attach failed: ' + (e && e.message))
    }

    try {
      if (reader()?.enabled) {
        reader()?.speak(gettext('Entering page'), { priority: 'high' })
        if (nav() && nav().elements.length > 0) {
          nav().focusElement(0)
        }
      }
    } catch (e) {
      log.warn('Page announce failed: ' + (e && e.message))
    }
    return result
  }

  config.onDestroy = function () {
    try {
      ui()?.detach()
      nav()?.clearElements()
    } catch (e) {
      log.warn('ZSRPage teardown failed: ' + (e && e.message))
    }
    return originalOnDestroy ? originalOnDestroy.call(this) : undefined
  }

  return Page(config)
}

export default ZSRPage
