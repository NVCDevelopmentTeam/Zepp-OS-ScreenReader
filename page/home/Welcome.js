import { push, replace } from '@zos/router'
import { gettext } from '../../lib/utils/i18n.js'
import { loadSettings, saveSettings } from '../../lib/core/config.js'
import ScreenReader from '../../lib/core/readerProxy.js'
import { ZSRPage } from '../../lib/core/zsrPage.js'
import { buildWelcomeLayout } from './Welcome.layout.js'

/**
 * First launch must never need a sighted helper. The welcome page therefore
 *  - signals that ZSR started with a haptic pulse (works even when speech is
 *    not available yet),
 *  - speaks the whole introduction on its own,
 *  - and continues to Home automatically, so no button has to be found.
 */
const AUTO_CONTINUE_MS = 20000

/** @type {any} */
let autoTimer = null
let leaving = false

function goHome() {
  if (leaving) return
  leaving = true
  if (autoTimer) clearTimeout(autoTimer)
  // Remember that the welcome page was shown so later launches go
  // straight to Home.
  const config = globalThis.ScreenReaderConfig || {}
  config.welcomeSeen = true
  saveSettings(config)
  replace({ url: 'page/home/index' })
}

export default ZSRPage({
  onInit() {
    leaving = false
    if (!globalThis.ScreenReaderConfig) {
      globalThis.ScreenReaderConfig = loadSettings()
    }
    try {
      ScreenReader.vibration.vibrate('success')
    } catch (_e) {
      /* haptics are optional */
    }
    ScreenReader.speak(gettext('Welcome to Zepp OS Screen Reader'), { priority: 'high' })
    ScreenReader.speak(
      gettext(
        'ZSR speaks and vibrates as you touch the screen. Touch to explore, double tap to activate, swipe to move between items.'
      ),
      { priority: 'normal' }
    )
    autoTimer = setTimeout(goHome, AUTO_CONTINUE_MS)
  },

  build() {
    buildWelcomeLayout({
      onOpenGuide: () => {
        if (autoTimer) clearTimeout(autoTimer)
        push({ url: 'page/userGuide/userGuide' })
      },
      onContinue: goHome
    })
  },

  onDestroy() {
    if (autoTimer) clearTimeout(autoTimer)
  }
})
