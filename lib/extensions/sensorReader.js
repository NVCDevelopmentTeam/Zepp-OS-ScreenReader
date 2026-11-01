import { HeartRate, Sleep, BloodOxygen, Step, Stress, Calorie, Distance } from '@zos/sensor'
import ScreenReader from '../core/screenReader.js'
import { safeTimeout } from '../utils/safeCall.js'
import { log } from '@zos/utils'

import { gettext, format } from '../utils/i18n.js'
import * as sensors from '@zos/sensor'
/**
 * Some sensor classes are not available on every device/simulator profile
 * (e.g. certain Bip-series devices in the simulator). Constructing them
 * eagerly and letting one bad sensor throw would previously crash the
 * whole module at import time. We create each sensor defensively instead,
 * and fall back to `null` (handled per-method below) if it's unsupported.
 */
function createSensor(SensorClass, name) {
  try {
    return new SensorClass()
  } catch (e) {
    log.info(`SensorReader: "${name}" sensor is unavailable on this device`, e)
    return null
  }
}

/** How long to wait for a GPS fix, and how often to check. */
const LOCATION_WAIT_MS = 20000
const LOCATION_POLL_MS = 1000

class SensorReader {
  constructor() {
    this.hr = createSensor(HeartRate, 'HeartRate')
    this.sleep = createSensor(Sleep, 'Sleep')
    this.spo2 = createSensor(BloodOxygen, 'BloodOxygen')
    this.step = createSensor(Step, 'Step')
    this.stress = createSensor(Stress, 'Stress')
    this.calorie = createSensor(Calorie, 'Calorie')
    this.distance = createSensor(Distance, 'Distance')
  }

  async readCalories() {
    try {
      if (!this.calorie) throw new Error('Calorie sensor unavailable')
      const current = this.calorie.getCurrent()
      const text = format(gettext('Calories burned: {0} kilocalories.'), current)
      await ScreenReader.speak(text, { priority: 'high' })
      return current
    } catch (_e) {
      log.info('Calorie read failed')
      await ScreenReader.speak(gettext('Calorie data not available'), { priority: 'high' })
    }
  }

  async readDistance() {
    try {
      if (!this.distance) throw new Error('Distance sensor unavailable')
      const current = this.distance.getCurrent()
      const text = format(gettext('Distance traveled: {0} meters.'), current)
      await ScreenReader.speak(text, { priority: 'high' })
      return current
    } catch (_e) {
      log.info('Distance read failed')
      await ScreenReader.speak(gettext('Distance data not available'), { priority: 'high' })
    }
  }

  async readHeartRate() {
    try {
      if (!this.hr) throw new Error('HeartRate sensor unavailable')
      // Note: getCurrent() is only valid inside the onCurrentChange callback
      // (continuous measurement). For an instant on-demand reading, getLast()
      // is the correct API - see https://docs.zepp.com/docs/reference/device-app-api/newAPI/sensor/HeartRate/
      const last = this.hr.getLast()
      const text = format(gettext('Heart rate is {0} beats per minute.'), last || 0)
      await ScreenReader.speak(text, { priority: 'high' })
      return last
    } catch (e) {
      log.info('HR read failed', e)
      await ScreenReader.speak(gettext('Heart rate sensor not available'), { priority: 'high' })
    }
  }

  async readSpO2() {
    try {
      if (!this.spo2) throw new Error('SpO2 sensor unavailable')
      const info = this.spo2.getCurrent()
      const value = info ? info.value : 0
      const text = format(gettext('Blood oxygen level is {0} percent.'), value)
      await ScreenReader.speak(text, { priority: 'high' })
      return value
    } catch (e) {
      log.info('SpO2 read failed', e)
      await ScreenReader.speak(gettext('Blood oxygen sensor not available'), { priority: 'high' })
    }
  }

  async readSleep() {
    try {
      if (!this.sleep) throw new Error('Sleep sensor unavailable')
      // Sleep has no getSleepStageModel(); the real API exposes getInfo()
      // for totals, and getStage() + getStageConstantObj() for per-stage
      // durations (light/REM). See
      // https://docs.zepp.com/docs/reference/device-app-api/newAPI/sensor/Sleep/
      const { totalTime = 0, deepTime = 0 } = this.sleep.getInfo() || {}
      const stageConstants = this.sleep.getStageConstantObj() || {}
      const stages = this.sleep.getStage() || []

      let lightTime = 0
      let remTime = 0
      for (const seg of stages) {
        const duration = Math.max(0, (seg.stop || 0) - (seg.start || 0))
        if (seg.model === stageConstants.LIGHT_STAGE) lightTime += duration
        else if (seg.model === stageConstants.REM_STAGE) remTime += duration
      }

      const text = format(
        gettext(
          'Sleep summary: total {0} hours and {1} minutes. Deep sleep: {2} minutes. Light sleep: {3} minutes. REM: {4} minutes.'
        ),
        Math.floor(totalTime / 60),
        totalTime % 60,
        deepTime,
        lightTime,
        remTime
      )

      await ScreenReader.speak(text, { priority: 'high' })
      return { totalTime, deepTime, lightTime, remTime }
    } catch (e) {
      log.info('Sleep read failed', e)
      await ScreenReader.speak(gettext('Sleep data not available'), { priority: 'high' })
    }
  }

  async readSteps() {
    try {
      if (!this.step) throw new Error('Step sensor unavailable')
      const current = this.step.getCurrent()
      const target = this.step.getTarget() || 8000
      const percent = Math.floor((current / target) * 100)

      const text = format(
        gettext('Step count is {0}. Goal progress {1} percent.'),
        current,
        percent
      )
      await ScreenReader.speak(text, { priority: 'high' })
      return current
    } catch (e) {
      log.info('Step read failed', e)
      await ScreenReader.speak(gettext('Step counter not available'), { priority: 'high' })
    }
  }

  async readStress() {
    try {
      if (!this.stress) throw new Error('Stress sensor unavailable')
      const info = this.stress.getCurrent()
      const value = info ? info.value : 0
      let level = gettext('Relaxed')
      if (value > 80) level = gettext('High')
      else if (value > 60) level = gettext('Medium')
      else if (value > 30) level = gettext('Normal')

      const text = format(gettext('Stress level is {0}, {1}.'), value, level)
      await ScreenReader.speak(text, { priority: 'high' })
      return value
    } catch (e) {
      log.info('Stress read failed', e)
      await ScreenReader.speak(gettext('Stress sensor not available'), { priority: 'high' })
    }
  }

  /** Battery level. Zepp OS gives no "charging" flag, so only the level is reported. */
  async readBattery() {
    try {
      const level = new sensors.Battery().getCurrent()
      await ScreenReader.speak(format(gettext('Battery: {0} percent.'), level), {
        priority: 'high'
      })
      return level
    } catch (e) {
      log.info('Battery read failed: ' + String(e))
      await ScreenReader.speak(gettext('Battery data not available'), { priority: 'high' })
    }
  }

  /**
   * Where the user is (GPS). Only on request, never continuously: location is private and the
   * receiver uses a lot of power, so it is started, waited for (up to LOCATION_WAIT_MS) and
   * stopped again. Nothing is stored or sent. Needs the `device:os.geolocation` permission.
   */
  async readLocation() {
    const Geolocation = sensors.Geolocation
    if (typeof Geolocation !== 'function') {
      await ScreenReader.speak(gettext('Location is not available on this watch'), {
        priority: 'high'
      })
      return null
    }
    let geo = null
    try {
      geo = new Geolocation()
      if (typeof geo.getEnabled === 'function' && geo.getEnabled() === false) {
        await ScreenReader.speak(
          gettext('Location is turned off for ZSR. Allow it in the watch settings.'),
          { priority: 'high' }
        )
        return null
      }
      await ScreenReader.speak(gettext('Looking for GPS. This can take up to 20 seconds.'), {
        priority: 'high'
      })
      geo.start()
      const deadline = Date.now() + LOCATION_WAIT_MS
      // 'A' means a valid fix, 'V' means not yet
      while (geo.getStatus() !== 'A' && Date.now() < deadline) {
        await new Promise((resolve) => safeTimeout(resolve, LOCATION_POLL_MS))
      }
      if (geo.getStatus() !== 'A') {
        await ScreenReader.speak(
          gettext('GPS: no position yet. Go outside or near a window and try again.'),
          { priority: 'high' }
        )
        return null
      }
      const latitude = Number(geo.getLatitude({ format: 'DD' }))
      const longitude = Number(geo.getLongitude({ format: 'DD' }))
      const text = format(
        gettext('GPS: found. Latitude {0} degrees {1}, longitude {2} degrees {3}.'),
        Math.abs(latitude).toFixed(5),
        latitude >= 0 ? gettext('north') : gettext('south'),
        Math.abs(longitude).toFixed(5),
        longitude >= 0 ? gettext('east') : gettext('west')
      )
      await ScreenReader.speak(text, { priority: 'high' })
      return { latitude, longitude }
    } catch (e) {
      log.info('Location read failed: ' + String(e))
      await ScreenReader.speak(gettext('Location data not available'), { priority: 'high' })
      return null
    } finally {
      try {
        if (geo) geo.stop()
      } catch (_e) {
        /* already stopped */
      }
    }
  }

  /** Altitude (meters) and air pressure (hPa) from the barometer. */
  async readAltitude() {
    try {
      const Barometer = sensors.Barometer
      if (typeof Barometer !== 'function') throw new Error('Barometer unavailable')
      const barometer = new Barometer()
      const text = format(
        gettext('Altitude {0} meters. Air pressure {1} hectopascals.'),
        Math.round(barometer.getAltitude()),
        Math.round(barometer.getAirPressure())
      )
      await ScreenReader.speak(text, { priority: 'high' })
      return text
    } catch (e) {
      log.info('Altitude read failed: ' + String(e))
      await ScreenReader.speak(gettext('Altitude and pressure data not available'), {
        priority: 'high'
      })
    }
  }

  /** Compass heading: the direction the 12 o'clock side of the watch points to. */
  async readCompass() {
    let compass = null
    try {
      const Compass = sensors.Compass
      if (typeof Compass !== 'function') throw new Error('Compass unavailable')
      compass = new Compass()
      compass.start()
      const angle = compass.getDirectionAngle()
      const text =
        angle === 'INVALID'
          ? gettext(
              'The compass is not calibrated. Move the watch in a figure eight and try again.'
            )
          : format(
              gettext('Facing {0}, {1} degrees.'),
              compass.getDirection(),
              Math.round(Number(angle))
            )
      await ScreenReader.speak(text, { priority: 'high' })
      return text
    } catch (e) {
      log.info('Compass read failed: ' + String(e))
      await ScreenReader.speak(gettext('Compass data not available'), { priority: 'high' })
    } finally {
      try {
        if (compass) compass.stop()
      } catch (_e) {
        /* already stopped */
      }
    }
  }

  async readWorkoutStats(stats = {}) {
    const { distance, duration, calories, hr } = stats
    const parts = [gettext('Workout stats:')]
    if (duration) parts.push(format(gettext('Duration {0}.'), duration))
    if (distance) parts.push(format(gettext('Distance {0}.'), distance))
    if (hr) parts.push(format(gettext('Heart rate {0}.'), hr))
    if (calories) parts.push(format(gettext('Calories {0}.'), calories))
    const text = parts.join(' ')

    await ScreenReader.speak(text, { priority: 'high' })
  }
}

export default new SensorReader()
