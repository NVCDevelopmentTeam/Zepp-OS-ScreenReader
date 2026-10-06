import { log } from '@zos/utils'
import { push } from '@zos/router'
import { readFileSync, rmSync } from '@zos/fs'
import SensorReader from '../extensions/sensorReader.js'
import { getFriendlyTime } from '../utils/dateTimeUtils.js'
import { getMediaModule } from '../equipment/mediaSupport.js'
import { encodeBase64 } from '../utils/base64.js'
import { parseVoiceCommandFull } from './voiceCommands.js'

import { gettext, format } from '../utils/i18n.js'

const RECORD_FILE = 'zsr_voice.opus'
const RECORD_SECONDS = 5

/** Spoken explanation for each failure reason reported by the side service. */
function explainError(code) {
  switch (code) {
    case 'AI_NOT_CONFIGURED':
      return gettext(
        'Voice control needs an online speech service. Add your key in the phone settings.'
      )
    case 'NO_SPEECH_DETECTED':
      return gettext("I didn't hear anything. Please try again.")
    case 'AI_REQUEST_FAILED':
      return gettext(
        'The online speech service rejected the request. Check your key and connection.'
      )
    default:
      return gettext(
        'Voice control is unavailable right now. Check your phone connection and internet.'
      )
  }
}

class VoiceControlService {
  constructor() {
    this.isListening = false
  }

  getScreenReader() {
    return globalThis.ScreenReaderInstance
  }

  getNavigationManager() {
    return globalThis.NavigationManagerInstance
  }

  init() {
    log.info('Voice Control Service initialized')
  }

  /** The watch can record (needs '@zos/media', API_LEVEL 3.0+, and a microphone). */
  canRecord() {
    const media = getMediaModule()
    return !!(media && media.create && media.id && media.id.RECORDER && media.codec)
  }

  /**
   * Record a short command, send it to the phone for online speech-to-text,
   * then execute it. Requires internet (through the phone), like TalkBack's
   * and JAWS's voice commands.
   */
  async startListening() {
    if (this.isListening) return
    const screenReader = this.getScreenReader()
    const say = (text) => (screenReader ? screenReader.speak(text, { priority: 'high' }) : null)

    if (!this.canRecord()) {
      await say(gettext('Voice control is not supported on this watch.'))
      return
    }

    this.isListening = true
    try {
      await say(gettext('Listening...'))
      const recorded = await this.record()
      if (!recorded) {
        await say(
          gettext(
            'Voice control is unavailable right now. Check your phone connection and internet.'
          )
        )
        return
      }

      const app = getApp()
      const messageBuilder = app._options.globalData ? app._options.globalData.messageBuilder : null
      if (!messageBuilder) {
        await say(explainError('UNAVAILABLE'))
        return
      }

      const response = await messageBuilder.request(
        {
          method: 'VOICE_COMMAND',
          params: {
            audio: recorded,
            language: (globalThis.ScreenReaderConfig || {}).language
          }
        },
        { timeout: 30000 }
      )

      if (!response || response.result !== 'OK' || !response.text) {
        await say(explainError(response && response.code))
        return
      }
      await this.processCommand(response.text)
    } catch (error) {
      log.error('Voice command failed:', error)
      await say(explainError('UNAVAILABLE'))
    } finally {
      this.isListening = false
    }
  }

  /**
   * Record RECORD_SECONDS of audio with the official recorder (Opus, written
   * to the app's data directory) and return it as base64, or null on failure.
   */
  record() {
    const media = getMediaModule()
    return new Promise((resolve) => {
      let recorder = null
      try {
        recorder = media.create(media.id.RECORDER)
        recorder.setFormat(media.codec.OPUS, { target_file: `data://${RECORD_FILE}` })
        recorder.start()
      } catch (error) {
        log.error('Recorder start failed:', error)
        resolve(null)
        return
      }
      setTimeout(() => {
        try {
          recorder.stop()
          const buffer = readFileSync({ path: RECORD_FILE })
          try {
            rmSync({ path: RECORD_FILE })
          } catch (_e) {
            /* temp file already gone */
          }
          resolve(buffer ? encodeBase64(new Uint8Array(buffer)) : null)
        } catch (error) {
          log.error('Recorder stop/read failed:', error)
          resolve(null)
        }
      }, RECORD_SECONDS * 1000)
    })
  }

  async processCommand(text) {
    const screenReader = this.getScreenReader()
    const nav = this.getNavigationManager()

    if (!screenReader) return

    log.info('Voice Command Received:', text)
    const { intent, arg } = parseVoiceCommandFull(text)

    switch (intent) {
      case 'readScreen':
        await screenReader.speak(gettext('Reading screen'), { priority: 'high' })
        if (nav) {
          nav.currentIndex = -1
          await nav.navigate('next')
        }
        break
      case 'next':
        if (nav) await nav.navigate('next')
        break
      case 'previous':
        if (nav) await nav.navigate('prev')
        break
      case 'find':
        // Screen search: focus the next element whose text matches.
        if (nav) await nav.search(arg)
        break
      case 'activate':
        if (nav) nav.handleSelection()
        break
      case 'openMenu':
        if (globalThis.ContextMenuInstance) await globalThis.ContextMenuInstance.show()
        break
      case 'openSettings':
        push({ url: 'page/home/Settings' })
        break
      case 'mute':
        screenReader.toggleMute()
        break
      case 'turnOff':
        screenReader.toggleEnabled()
        break
      case 'heartRate':
        await SensorReader.readHeartRate()
        break
      case 'steps':
        await SensorReader.readSteps()
        break
      case 'time':
        await screenReader.speak(getFriendlyTime(), { priority: 'high' })
        break
      case 'curtain':
        if (globalThis.ScreenReaderUIInstance) {
          const on = globalThis.ScreenReaderUIInstance.toggleCurtain()
          await screenReader.speak(
            on ? gettext('Screen curtain enabled') : gettext('Screen curtain disabled'),
            { priority: 'high' }
          )
        }
        break
      case 'notifications':
        await screenReader.speak(gettext('No new notifications'), { priority: 'high' })
        break
      default:
        await screenReader.speak(format(gettext("Sorry, I didn't catch that command: {0}"), text), {
          priority: 'high'
        })
    }

    this.isListening = false
  }

  getScreenReaderUI() {
    return globalThis.ScreenReaderUIInstance
  }
}

export default new VoiceControlService()
