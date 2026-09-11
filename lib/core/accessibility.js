import { log } from '@zos/utils'
import { Battery, HeartRate, Step, Stress, Sleep, BloodOxygen } from '@zos/sensor'
import NavigationManager from './navigationManager.js'
import { getImageDescription } from '../extensions/ImageDescription.js'
import { getFriendlyTime, getFriendlyDate } from '../utils/dateTimeUtils.js'

/**
 * Some sensor classes are not available on every device/simulator profile.
 * Creating them eagerly and letting one throw would crash this whole module
 * at import time (app.js imports AccessibilityService directly). Create
 * each defensively and fall back to `null`, guarded per-use below.
 */
function createSensor(SensorClass, name) {
  try {
    return new SensorClass()
  } catch (e) {
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
      if (globalThis.ScreenReaderConfig?.remoteAssistance) {
        this.sendDeviceState()
      }
    }, 5000)
  }

  async sendDeviceState() {
    const { messageBuilder } = getApp().globalData
    if (!messageBuilder) return

    const state = {
      focusedIndex: NavigationManager.currentIndex,
      elementCount: NavigationManager.elements.length,
      lastSpoken: globalThis.ScreenReaderInstance?.getLastSpoken(),
      battery: this.battery ? this.battery.getCurrent() : null,
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
        const imageId = src.split('/').pop().split('.')[0]
        return getImageDescription(imageId)
      }

      const description = `Image: ${src.split('/').pop().split('.')[0]}`
      return description
    } catch (error) {
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
    // Simulated Bluetooth and Notification count for now
    const bluetooth = 'connected'
    const notifications = 0

    const announcement = `Status bar. Battery ${level} percent. ${time}. Bluetooth ${bluetooth}. ${notifications} new notifications.`
    await screenReader.speak(announcement, { priority: 'high' })
  }

  /**
   * Start verbal photo guidance via companion phone camera
   */
  async startCameraGuidance() {
    const screenReader = globalThis.ScreenReaderInstance
    const { messageBuilder } = getApp().globalData
    if (!messageBuilder || !screenReader) return

    await screenReader.speak('Opening camera. Please hold your phone steady.', { priority: 'high' })

    try {
      await messageBuilder.request({ method: 'CAMERA_START' })

      const guidance = [
        'Move phone slightly up.',
        'Object centered. Hold still.',
        'Taking photo in 3, 2, 1.',
        'Photo captured and saved to gallery.'
      ]

      for (const step of guidance) {
        await new Promise((r) => setTimeout(r, 2000))
        await screenReader.speak(step, { priority: 'high' })
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
