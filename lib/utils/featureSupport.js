/**
 * Feature availability for THIS watch and Zepp OS version ("varies with
 * device"), and the diagnostics text users can send with a bug report.
 *
 * Every optional capability has one of five states, so the UI never presents a
 * non-working control as if it worked and always says why something is missing:
 *   supported | limited | experimental | unavailable-os | unavailable-device
 * States that depend on the system (audio, recording, API level) are computed
 * from what is really present at runtime; the others record documented
 * platform limits.
 */
import { getDeviceInfo } from '@zos/device'
import { getApiCapabilityLevel } from './apiCapability.js'
import { getMedia, getMediaModule } from '../equipment/mediaSupport.js'
import { ZSR_VERSION } from './version.js'
import { gettext, format } from './i18n.js'

export const STATE = {
  SUPPORTED: 'supported',
  LIMITED: 'limited',
  EXPERIMENTAL: 'experimental',
  UNAVAILABLE_OS: 'unavailable-os',
  UNAVAILABLE_DEVICE: 'unavailable-device'
}

const STATE_LABEL = {
  [STATE.SUPPORTED]: () => gettext('Supported'),
  [STATE.LIMITED]: () => gettext('Supported with limitations'),
  [STATE.EXPERIMENTAL]: () => gettext('Experimental'),
  [STATE.UNAVAILABLE_OS]: () => gettext('Unavailable on this OS'),
  [STATE.UNAVAILABLE_DEVICE]: () => gettext('Unavailable on this watch')
}

/**
 * @typedef {{ id: string, name: string, state: string, reason?: string }} FeatureEntry
 * @returns {FeatureEntry[]}
 */
export function getFeatureRegistry() {
  const level = getApiCapabilityLevel()
  const audio = getMedia() !== null
  const media = getMediaModule()
  const recorder = !!(media && media.id && media.id.RECORDER && media.codec)
  const noAudio = gettext('Needs the audio player, available from Zepp OS 3.0 (API level 3.0).')

  /** @type {FeatureEntry[]} */
  const list = [
    { id: 'touch', name: gettext('Touch exploration and gestures'), state: STATE.SUPPORTED },
    { id: 'haptics', name: gettext('Vibration feedback'), state: STATE.SUPPORTED },
    { id: 'reading', name: gettext('Reading modes and navigation'), state: STATE.SUPPORTED },
    { id: 'regions', name: gettext('Screen regions'), state: STATE.SUPPORTED },
    { id: 'listPosition', name: gettext('List position'), state: STATE.SUPPORTED },
    {
      id: 'readingControl',
      name: gettext('Pause, resume and speech mode'),
      state: STATE.SUPPORTED
    },
    {
      id: 'textOptions',
      name: gettext('Punctuation, capitals and progress announcements'),
      state: STATE.SUPPORTED
    },
    { id: 'languages', name: gettext('Multilingual speech'), state: STATE.SUPPORTED },
    { id: 'health', name: gettext('Health and fitness reading'), state: STATE.SUPPORTED },
    audio
      ? {
          id: 'speech',
          name: gettext('Speech output'),
          state: STATE.LIMITED,
          reason: gettext(
            'Sentences that are not in the offline voice need the phone and an internet connection the first time.'
          )
        }
      : {
          id: 'speech',
          name: gettext('Speech output'),
          state: STATE.UNAVAILABLE_OS,
          reason: noAudio
        },
    audio
      ? { id: 'offlineVoice', name: gettext('Offline voice'), state: STATE.SUPPORTED }
      : {
          id: 'offlineVoice',
          name: gettext('Offline voice'),
          state: STATE.UNAVAILABLE_OS,
          reason: noAudio
        },
    audio
      ? { id: 'touchSounds', name: gettext('Touch sounds'), state: STATE.SUPPORTED }
      : {
          id: 'touchSounds',
          name: gettext('Touch sounds'),
          state: STATE.UNAVAILABLE_OS,
          reason: noAudio
        },
    {
      id: 'volume',
      name: gettext('Separate speech volume'),
      state: audio ? STATE.LIMITED : STATE.UNAVAILABLE_OS,
      reason: audio
        ? gettext('Sets the volume of the ZSR player. Zepp OS may share it with the system volume.')
        : noAudio
    },
    {
      id: 'ducking',
      name: gettext('Audio ducking'),
      state: STATE.UNAVAILABLE_OS,
      reason: gettext('Zepp OS has no audio-focus API, so other audio cannot be lowered.')
    },
    {
      id: 'screenSearch',
      name: gettext('Screen search'),
      state: STATE.LIMITED,
      reason: gettext('Works by voice command. Typing a search is not possible without a keyboard.')
    },
    {
      id: 'voiceControl',
      name: gettext('Voice commands (needs phone and internet)'),
      state: recorder ? STATE.EXPERIMENTAL : STATE.UNAVAILABLE_OS,
      reason: recorder
        ? gettext('Needs your own online speech service, set in the phone settings.')
        : gettext('Needs audio recording, available from Zepp OS 3.0 (API level 3.0).')
    },
    {
      id: 'imageReading',
      name: gettext('Image reading, OCR and CAPTCHA (needs internet)'),
      state: STATE.EXPERIMENTAL,
      reason: gettext(
        'Zepp OS gives apps no camera or screenshot access, so an image must be supplied.'
      )
    },
    {
      id: 'brailleKeyboard',
      name: gettext('Braille keyboard'),
      state: STATE.EXPERIMENTAL,
      reason: gettext('Needs several fingers at once, but Zepp OS touch events report one finger.')
    },
    {
      id: 'multiTouch',
      name: gettext('Two and three finger gestures'),
      state: STATE.UNAVAILABLE_DEVICE,
      reason: gettext(
        'Zepp OS touch events report one finger, so these gestures cannot be detected.'
      )
    },
    {
      id: 'notifications',
      name: gettext('Reading phone notifications, messages and calls'),
      state: STATE.UNAVAILABLE_OS,
      reason: gettext('Zepp OS gives apps no way to receive phone notifications or calls.')
    },
    {
      id: 'otherApps',
      name: gettext('Reading other apps, unlocking and system screens'),
      state: STATE.UNAVAILABLE_OS,
      reason: gettext('Mini Programs are sandboxed and can only read their own screens.')
    },
    {
      id: 'systemRegistration',
      name: gettext('Listing in the system accessibility settings'),
      state: STATE.UNAVAILABLE_OS,
      reason: gettext('No public Zepp OS API lets an app register as an accessibility service.')
    },
    {
      id: 'updates',
      name: gettext('Automatic updates'),
      state: STATE.LIMITED,
      reason: gettext(
        'ZSR can check for a new version; Zepp OS installs updates only through the Zepp app.'
      )
    },
    {
      id: 'keyboard',
      name: gettext('System keyboard integration'),
      state: level >= 4.2 ? STATE.LIMITED : STATE.UNAVAILABLE_OS,
      reason:
        level >= 4.2
          ? gettext('Available from Zepp OS 4.2; ZSR only reads its own screens.')
          : gettext('Needs Zepp OS 4.2 or newer.')
    }
  ]
  return list
}

/** Backwards compatible view: id, name and a simple supported flag. */
export function getFeatureSupport() {
  return getFeatureRegistry().map((f) => ({
    id: f.id,
    name: f.name,
    supported:
      f.state === STATE.SUPPORTED || f.state === STATE.LIMITED || f.state === STATE.EXPERIMENTAL
  }))
}

/** Text for the Device Support page / spoken summary, grouped by state. */
export function describeSupport() {
  const groups = {}
  getFeatureRegistry().forEach((f) => {
    ;(groups[f.state] = groups[f.state] || []).push(f)
  })
  const order = [
    STATE.SUPPORTED,
    STATE.LIMITED,
    STATE.EXPERIMENTAL,
    STATE.UNAVAILABLE_OS,
    STATE.UNAVAILABLE_DEVICE
  ]
  const lines = []
  order.forEach((state) => {
    const items = groups[state]
    if (!items) return
    lines.push(`${STATE_LABEL[state]()}:`)
    items.forEach((f) => lines.push(f.reason ? `- ${f.name}. ${f.reason}` : `- ${f.name}`))
    lines.push('')
  })
  if (!getMedia()) {
    lines.push(
      gettext('This watch has no audio player, so ZSR answers with vibration instead of speech.')
    )
  }
  return lines.join('\n').trim()
}

/**
 * Non-private facts that help developers reproduce a problem: ZSR version, API
 * level, device model and screen, language, and the state of each feature.
 * No personal or health data is included.
 */
export function describeDiagnostics() {
  let model = 'unknown'
  let screen = ''
  let buttons = ''
  try {
    const info = getDeviceInfo()
    model = String(info.deviceName || info.deviceSource || 'unknown')
    screen = `${info.width}x${info.height} shape ${info.screenShape}`
    buttons = String(info.keyNumber)
  } catch (_e) {
    /* device info unavailable */
  }
  const config = globalThis.ScreenReaderConfig || {}
  const lines = [
    format(gettext('ZSR version {0}'), ZSR_VERSION),
    format(gettext('Zepp OS API level {0}'), getApiCapabilityLevel()),
    format(gettext('Device {0}, screen {1}, buttons {2}'), model, screen, buttons),
    format(
      gettext('Language {0}, speech engine {1}'),
      config.language || 'default',
      config.primaryTTSEngine || 'espeak'
    )
  ]
  getFeatureRegistry().forEach((f) => lines.push(`${f.id}: ${f.state}`))
  return lines.join('\n')
}
