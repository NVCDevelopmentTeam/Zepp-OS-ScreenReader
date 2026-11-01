/**
 * How a user turns ZSR on or off, and how to open ZSR in the first place.
 *
 * From Zepp OS 4.2 the watch settings have an Accessibility menu, which is where a screen reader
 * is meant to be turned on. ZSR cannot be activated there yet: the Zepp OS API gives apps no way
 * to provide an accessibility service or to ask for that permission. When Zepp OS adds it, it
 * will be integrated here. Until then there are two separate questions:
 *
 *  - OPENING ZSR (manual, depends on the Zepp OS version): app list, shortcut card, or a button
 *    the user has assigned to ZSR; from 4.2 the guide also says where the Accessibility menu
 *    route will be. See `openingGuide()`.
 *  - TURNING THE READER ON/OFF once ZSR is open (the same on every version), three ways, each
 *    switchable in settings:
 *      1. crown: press three times quickly       (config.accessibilityShortcut)
 *      2. accessibility button: bottom corner    (config.accessibilityButton)
 *      3. gesture: swipe up, down, up            (config.activationGesture)
 */
import { gettext } from '../utils/i18n.js'
import { safeDeviceInfo } from '../utils/deviceInfo.js'
import { getApiCapabilityLevel } from '../utils/apiCapability.js'

/** Press the crown (Home key) this many times to toggle, per `accessibilityShortcut`. */
export const CROWN_CLICKS = { double_click_home: 2, triple_click_home: 3 }

/** @returns {{ crown: string, button: boolean, gesture: string }} */
export function activationStatus() {
  const config = globalThis.ScreenReaderConfig || {}
  return {
    crown: config.accessibilityShortcut || 'off',
    button: config.accessibilityButton !== false,
    gesture: config.activationGesture || 'off'
  }
}

/** @returns {string[]} one sentence per way that is currently switched on */
export function describeActivation() {
  const status = activationStatus()
  const lines = []
  if (status.crown === 'triple_click_home') {
    lines.push(gettext('Crown: press the crown three times quickly.'))
  } else if (status.crown === 'double_click_home') {
    lines.push(gettext('Crown: press the crown twice quickly.'))
  } else if (status.crown === 'long_press_home') {
    lines.push(gettext('Crown: press and hold the crown.'))
  }
  if (status.button) {
    lines.push(
      gettext(
        'Accessibility button: the ZSR button in the bottom corner of the screen. Double tap it, or press and hold it for the menu.'
      )
    )
  }
  if (status.gesture === 'zigzag') {
    lines.push(gettext('Gesture: swipe up, then down, then up.'))
  }
  if (lines.length === 0) {
    lines.push(gettext('No shortcut is switched on. Turn one on in Settings, Activation.'))
  }
  return lines
}

/**
 * Steps to open ZSR on this watch. The wording follows the Zepp OS version and the number of
 * keys; menu names are not given because they differ between versions.
 * @returns {string[]}
 */
export function openingGuide() {
  const level = getApiCapabilityLevel()
  const { keyNumber } = safeDeviceInfo()
  const steps = [gettext('To open ZSR, press the crown to open the app list and choose ZSR.')]
  steps.push(
    gettext(
      'You can also add the ZSR shortcut card to your watch from the Zepp app on your phone, then open it by swiping.'
    )
  )
  if (keyNumber >= 2) {
    steps.push(
      gettext(
        'If your watch lets you choose what a button does, set one button to open ZSR. Look for button or shortcut options in the watch settings; the menu names differ between Zepp OS versions.'
      )
    )
  }
  if (level >= 4.2) {
    steps.push(
      gettext(
        'On Zepp OS 4.2 and later, Settings, Accessibility is where ZSR is meant to be turned on. It is not available yet, because Zepp OS does not let apps provide an accessibility service. Until it is, open ZSR with the steps above.'
      )
    )
  }
  steps.push(
    gettext(
      'Once ZSR is open, turn the reader on or off with the crown, the accessibility button or the gesture.'
    )
  )
  return steps
}
