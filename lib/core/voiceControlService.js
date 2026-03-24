import { log } from '@zos/utils'
import { push } from '@zos/router'
import SensorReader from '../extensions/sensorReader.js'

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

  async startListening() {
    if (this.isListening) return
    this.isListening = true
    const screenReader = this.getScreenReader()
    if (screenReader) await screenReader.speak('Listening...', { priority: 'high' })

    // In a production app, trigger actual Mic API if supported
    // For now, we simulate command reception
  }

  async processCommand(text) {
    const cmd = text.toLowerCase()
    const screenReader = this.getScreenReader()
    const nav = this.getNavigationManager()

    if (!screenReader) return

    log.info('Voice Command Received:', cmd)

    if (cmd.includes('read screen') || cmd.includes('what is on')) {
      await screenReader.speak('Reading screen', { priority: 'high' })
      if (nav) {
        nav.currentIndex = -1
        await nav.navigate('next')
      }
    } else if (cmd.includes('next item') || cmd.includes('go forward')) {
      if (nav) await nav.navigate('next')
    } else if (cmd.includes('previous item') || cmd.includes('go back')) {
      if (nav) await nav.navigate('prev')
    } else if (cmd.includes('open settings') || cmd.includes('go to settings')) {
      push({ url: 'page/home/Settings' })
    } else if (cmd.includes('silent mode') || cmd.includes('mute')) {
      screenReader.toggleMute()
    } else if (cmd.includes('turn off') || cmd.includes('disable screen reader')) {
      screenReader.toggleEnabled()
    } else if (cmd.includes('heart rate')) {
      await SensorReader.readHeartRate()
    } else if (cmd.includes('steps')) {
      await SensorReader.readSteps()
    } else if (cmd.includes('notifications')) {
      await screenReader.speak('No new notifications', { priority: 'high' })
    } else {
      await screenReader.speak("Sorry, I didn't catch that command", { priority: 'high' })
    }

    this.isListening = false
  }

  getScreenReaderUI() {
    return globalThis.ScreenReaderUIInstance
  }
}

export default new VoiceControlService()
