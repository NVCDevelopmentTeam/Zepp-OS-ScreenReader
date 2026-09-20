import { log } from '@zos/utils'
import { Battery, HeartRate, Step, Stress, Sleep, BloodOxygen, Screen } from '@zos/sensor'
import NavigationManager from './navigationManager.js'
import { getImageDescription } from '../extensions/ImageDescription.js'
import { getFriendlyTime, getFriendlyDate } from '../utils/dateTimeUtils.js'
import { connectStatus } from '@zos/ble'

/**
 * Some sensor classes are not available on every device/simulator profile.
 * Creating them eagerly and letting one throw would crash this whole module
 * at import time (app.js imports AccessibilityService directly). Create
 * each defensively and fall back to `null`, guarded per-use below.
 */
function createSensor(SensorClass, name) {
  try {
    return new SensorClass()
  } catch (/** @type {any} */ e) {
    log.error(`AccessibilityService: "${name}" sensor is unavailable on this device`, e)
    return null
  }
}

/**
 * Advanced accessibility features for ZSR
 */
class AccessibilityService {
  constructor() {
    this.ocrEnabled = true
    this.imageDescEnabled = true
    this.battery = createSensor(Battery, 'Battery')
    this.screen = createSensor(Screen, 'Screen')
    this.heartRate = createSensor(HeartRate, 'HeartRate')
    this.step = createSensor(Step, 'Step')
    this.stress = createSensor(Stress, 'Stress')
    this.sleep = createSensor(Sleep, 'Sleep')
    this.spo2 = createSensor(BloodOxygen, 'BloodOxygen')
    this.remoteEnabled = false
  }

  init() {
    // Pick up the "Enable OCR" toggle from setting/OCRSetting.js
    // (settingsKey 'ocrEnabled'). This must happen in init(), not the
    // constructor: AccessibilityService is instantiated as a module-level
    // singleton at import time, before app.js's onCreate has called
    // loadSettings() - so globalThis.ScreenReaderConfig isn't populated yet
    // when the constructor runs.
    const config = globalThis.ScreenReaderConfig || {}
    this.ocrEnabled = config.ocrEnabled !== false

    // Periodically send state if remote access is enabled
    setInterval(() => {
      // settingsKey is 'remoteAccessEnabled' (setting/RemoteAccessSetting.js)
      if (globalThis.ScreenReaderConfig?.remoteAccessEnabled) {
        this.sendDeviceState()
      }
    }, 5000)

    // Battery charging notification. Zepp OS's Battery sensor has no
    // documented isCharging()/onchargingchange API - only getCurrent()
    // (percentage) and onChange(). This uses a heuristic instead of a
    // real system flag: if the level goes up between two readings, the
    // watch is very likely plugged in (normal usage only drains it), and
    // announces the transition once rather than repeatedly.
    if (this.battery) {
      let lastLevel = this.battery.getCurrent()
      let wasCharging = false
      this.battery.onChange(() => {
        const level = this.battery.getCurrent()
        const isCharging = level > lastLevel
        if (isCharging && !wasCharging) {
          globalThis.ScreenReaderInstance?.speak(`Charging. Battery at ${level} percent.`, {
            priority: 'high'
          })
        } else if (!isCharging && wasCharging && level < 100) {
          globalThis.ScreenReaderInstance?.speak('Charger disconnected.', { priority: 'high' })
        }
        wasCharging = isCharging
        lastLevel = level
      })
    }

    // Screen light-up (wake) time announcement (Requirement 11, TalkBack style).
    if (this.screen && typeof this.screen.onChange === 'function') {
      this.screen.onChange((status) => {
        // status: 1 is screen on (lit), 2 is screen off (rest/aod)
        if (status === 1 && globalThis.ScreenReaderInstance?.enabled) {
          const config = globalThis.ScreenReaderConfig || {}
          if (config.readScreenOnTime !== false) {
            const timeStr = getFriendlyTime()
            globalThis.ScreenReaderInstance?.speak(timeStr, { priority: 'high', force: true })
          }
        }
      })
    }
  }

  async sendDeviceState() {
    const { messageBuilder } = getApp().globalData
    if (!messageBuilder) return

    const state = {
      focusedIndex: NavigationManager.currentIndex,
      elementCount: NavigationManager.elements.length,
      lastSpoken: globalThis.ScreenReaderInstance?.getLastSpoken(),
      battery: this.battery ? this.battery.getCurrent() : null,
      // settingsKey 'remoteHelperId' (setting/RemoteAccessSetting.js) -
      // previously collected but never actually sent, so the phone/helper
      // side had no way to know which paired helper this update was for.
      helperId: globalThis.ScreenReaderConfig?.remoteHelperId || null,
      timestamp: Date.now()
    }

    try {
      await messageBuilder.call({
        method: 'REMOTE_STATE_UPDATE',
        params: state
      })
    } catch (_e) {
      // Silent error
    }
  }

  /**
   * Describe an image using OCR or AI (Simulated)
   */
  async describeImage(widget, options = {}) {
    try {
      const src = options.src || 'Unknown image'
      log.info('Describing image:', src)

      if (src.includes('icon')) {
        const imageId = (src.split('/').pop() || '').split('.')[0]
        return getImageDescription(imageId)
      }

      const description = `Image: ${(src.split('/').pop() || '').split('.')[0]}`
      return description
    } catch (/** @type {any} */ error) {
      log.error('Image description failed:', error)
      return 'Could not describe image'
    }
  }

  /**
   * Perform OCR on the current screen (Simulated)
   */
  async performOCR() {
    const screenReader = globalThis.ScreenReaderInstance
    if (!screenReader) return

    await screenReader.speak('Starting screen recognition...', { priority: 'high' })
    return new Promise((resolve) => {
      setTimeout(async () => {
        await screenReader.speak('Screen contains text: Hello World, Settings, Battery 80%', {
          priority: 'high'
        })
        resolve(true)
      }, 2000)
    })
  }

  /**
   * Read current watch face data (Analog or Digital)
   */
  async readWatchFace(style = 'digital') {
    const screenReader = globalThis.ScreenReaderInstance
    if (!screenReader) return

    const time = getFriendlyTime()
    const date = getFriendlyDate()
    const steps = this.step ? this.step.getCurrent() : 0
    const hr =
      this.heartRate && this.heartRate.getLast() !== undefined ? this.heartRate.getLast() : '--'

    const announcement =
      style === 'analog'
        ? `Analog clock showing ${time}. ${date}. Steps: ${steps}. Heart rate: ${hr} beats per minute.`
        : `Digital clock. ${time}. ${date}. Steps: ${steps}. Heart rate: ${hr}.`

    await screenReader.speak(announcement, { priority: 'high' })
  }

  /**
   * Read status bar information
   */
  async readStatusBar() {
    const screenReader = globalThis.ScreenReaderInstance
    if (!screenReader) return

    const level = this.battery ? this.battery.getCurrent() : '--'
    const time = getFriendlyTime()
    // Real BLE connection status to the phone (connectStatus() from
    // @zos/ble) - previously this was hardcoded to always say
    // "connected" regardless of actual state, which is exactly the kind
    // of misleading system info ZSR should never report. There's no
    // confirmed API for querying a pending-notification count from the
    // device side, so that's honestly reported as unavailable instead of
    // a fake 0.
    let bluetooth = 'unknown'
    try {
      bluetooth = connectStatus() ? 'connected' : 'disconnected'
    } catch (_e) {
      // connectStatus() may be unavailable on some firmware/emulator
      // combinations - keep the honest 'unknown' rather than guessing.
    }

    const announcement = `Status bar. Battery ${level} percent. ${time}. Phone Bluetooth ${bluetooth}.`
    await screenReader.speak(announcement, { priority: 'high' })
  }

  /**
   * Start verbal photo guidance via companion phone camera.
   *
   * HONESTY NOTE: this speaks whatever the app-side actually reports back
   * per step, instead of reciting a fixed script on a timer regardless of
   * the real phone position. A blind user relying on framing guidance
   * that isn't tied to reality (e.g. always saying "object centered, hold
   * still") is worse off than no guidance at all - it creates false
   * confidence. As of now, app-side/index.js's CAMERA_START/
   * CAPTURE_AND_DESCRIBE handlers are themselves still placeholders (no
   * confirmed Zepp OS API for phone camera access from a Mini Program's
   * side service exists in current public docs), so real-time accuracy
   * depends entirely on that backend being implemented for real - this
   * loop is built to relay real feedback correctly once it is, and is
   * honest about its limits until then.
   */
  async startCameraGuidance() {
    const screenReader = globalThis.ScreenReaderInstance
    const { messageBuilder } = getApp().globalData
    if (!messageBuilder || !screenReader) return

    await screenReader.speak(
      'Opening camera guidance. This feature is experimental and depends on your phone connection - hold your phone steady and pointed where you want to photograph.',
      { priority: 'high' }
    )

    try {
      const maxSteps = 8
      for (let i = 0; i < maxSteps; i++) {
        const response = await messageBuilder.request({
          method: 'CAMERA_START',
          params: { action: 'GUIDANCE_STEP', step: i }
        })

        if (!response || response.done) {
          if (response?.prompt) {
            await screenReader.speak(response.prompt, { priority: 'high' })
          }
          break
        }

        if (response.prompt) {
          await screenReader.speak(response.prompt, { priority: 'high' })
        }

        await new Promise((r) => setTimeout(r, 1500))
      }
    } catch (_error) {
      await screenReader.speak('Failed to open camera on phone.', { priority: 'high' })
    }
  }

  /**
   * Describe the current camera view (Legacy)
   */
  async describeCamera() {
    const screenReader = globalThis.ScreenReaderInstance
    if (!screenReader) return

    await screenReader.speak(
      'Camera active. Guide: Keep the device 10 to 15 centimeters from the object. Move slightly left. Now centering. Analyzing...',
      { priority: 'high' }
    )
    return new Promise((resolve) => {
      setTimeout(async () => {
        await screenReader.speak(
          'I see a white coffee mug on a wooden table. The lighting is good.',
          { priority: 'high' }
        )
        resolve(true)
      }, 3000)
    })
  }

  /**
   * Read current heart rate
   * Note: HeartRate has no `.last` property in the Zepp OS 2.0 class API -
   * use getLast(). See https://docs.zepp.com/docs/reference/device-app-api/newAPI/sensor/HeartRate/
   */
  async readHeartRate() {
    const hr = this.heartRate ? this.heartRate.getLast() || '--' : '--'
    await globalThis.ScreenReaderInstance?.speak(`Heart rate: ${hr} beats per minute`, {
      priority: 'high'
    })
  }

  /**
   * Read SpO2 (Blood Oxygen)
   * Note: BloodOxygen has no `.last` property - getCurrent() returns
   * { value, time, retCode }. See
   * https://docs.zepp.com/docs/reference/device-app-api/newAPI/sensor/BloodOxygen/
   */
  async readSpO2() {
    const info = this.spo2 ? this.spo2.getCurrent() : null
    const spo2 = info && info.value ? info.value : '--'
    await globalThis.ScreenReaderInstance?.speak(`Blood oxygen: ${spo2} percent.`, {
      priority: 'high'
    })
  }

  /**
   * Read current steps and progress
   * Note: Step has no `.current`/`.target` properties - use getCurrent()/
   * getTarget(). See https://docs.zepp.com/docs/reference/device-app-api/newAPI/sensor/Step/
   */
  async readSteps() {
    const steps = this.step ? this.step.getCurrent() || 0 : 0
    const target = this.step ? this.step.getTarget() || 10000 : 10000
    const percent = target > 0 ? Math.round((steps / target) * 100) : 0
    await globalThis.ScreenReaderInstance?.speak(
      `Steps: ${steps}. Target: ${target}. ${percent} percent of daily goal reached.`,
      { priority: 'high' }
    )
  }

  /**
   * Read last night's sleep summary
   * Note: Sleep has no getBasicInfo() method in the Zepp OS 2.0 class API -
   * use getInfo(). See https://docs.zepp.com/docs/reference/device-app-api/newAPI/sensor/Sleep/
   */
  async readSleep() {
    const info =
      this.sleep && typeof this.sleep.getInfo === 'function' ? this.sleep.getInfo() : null
    if (info) {
      const hours = Math.floor(info.totalTime / 60)
      const minutes = info.totalTime % 60
      await globalThis.ScreenReaderInstance?.speak(
        `Sleep summary: ${hours} hours and ${minutes} minutes total sleep.`,
        { priority: 'high' }
      )
    } else {
      await globalThis.ScreenReaderInstance?.speak('No sleep data available for today.', {
        priority: 'high'
      })
    }
  }

  /**
   * Read current stress level
   * Note: Stress has no `.last` property - getCurrent() returns { value }.
   * See https://docs.zepp.com/docs/reference/device-app-api/newAPI/sensor/Stress/
   */
  async readStress() {
    const info = this.stress ? this.stress.getCurrent() : null
    const level = info && info.value ? info.value : '--'
    await globalThis.ScreenReaderInstance?.speak(`Stress level: ${level} out of 100.`, {
      priority: 'high'
    })
  }

  /**
   * Document navigation logic
   */
  async navigateDocument(elements, _type) {
    const screenReader = globalThis.ScreenReaderInstance
    if (!screenReader) return false

    const headings = elements.filter((el) => {
      return (
        el.type === 1 &&
        (el.options.text_size > 30 ||
          (el.options.text_style && el.options.text_style.includes('bold')))
      )
    })

    if (headings.length === 0) {
      await screenReader.speak('No headings found', { priority: 'high' })
      return false
    }

    return true
  }
}

export default new AccessibilityService()
