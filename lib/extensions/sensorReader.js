import { HeartRate, Sleep, BloodOxygen, Step, Stress, Calorie, Distance } from '@zos/sensor'
import ScreenReader from '../core/screenReader.js'
import { log } from '@zos/utils'

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
    log.error(`SensorReader: "${name}" sensor is unavailable on this device`, e)
    return null
  }
}

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
      const text = `Calories burned: ${current} kilocalories.`
      await ScreenReader.speak(text, { priority: 'high' })
      return current
    } catch (_e) {
      log.error('Calorie read failed')
      await ScreenReader.speak('Calorie data not available', { priority: 'high' })
    }
  }

  async readDistance() {
    try {
      if (!this.distance) throw new Error('Distance sensor unavailable')
      const current = this.distance.getCurrent()
      const text = `Distance traveled: ${current} meters.`
      await ScreenReader.speak(text, { priority: 'high' })
      return current
    } catch (_e) {
      log.error('Distance read failed')
      await ScreenReader.speak('Distance data not available', { priority: 'high' })
    }
  }

  async readHeartRate() {
    try {
      if (!this.hr) throw new Error('HeartRate sensor unavailable')
      // Note: getCurrent() is only valid inside the onCurrentChange callback
      // (continuous measurement). For an instant on-demand reading, getLast()
      // is the correct API - see https://docs.zepp.com/docs/reference/device-app-api/newAPI/sensor/HeartRate/
      const last = this.hr.getLast()
      const text = `Heart rate is ${last || 0} beats per minute.`
      await ScreenReader.speak(text, { priority: 'high' })
      return last
    } catch (e) {
      log.error('HR read failed', e)
      await ScreenReader.speak('Heart rate sensor not available', { priority: 'high' })
    }
  }

  async readSpO2() {
    try {
      if (!this.spo2) throw new Error('SpO2 sensor unavailable')
      const info = this.spo2.getCurrent()
      const value = info ? info.value : 0
      const text = `Blood oxygen level is ${value} percent.`
      await ScreenReader.speak(text, { priority: 'high' })
      return value
    } catch (e) {
      log.error('SpO2 read failed', e)
      await ScreenReader.speak('Blood oxygen sensor not available', { priority: 'high' })
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

      const text =
        `Sleep summary: Total duration ${Math.floor(totalTime / 60)} hours and ${totalTime % 60} minutes. ` +
        `Deep sleep: ${deepTime} minutes. Light sleep: ${lightTime} minutes. REM: ${remTime} minutes.`

      await ScreenReader.speak(text, { priority: 'high' })
      return { totalTime, deepTime, lightTime, remTime }
    } catch (e) {
      log.error('Sleep read failed', e)
      await ScreenReader.speak('Sleep data not available', { priority: 'high' })
    }
  }

  async readSteps() {
    try {
      if (!this.step) throw new Error('Step sensor unavailable')
      const current = this.step.getCurrent()
      const target = this.step.getTarget() || 8000
      const percent = Math.floor((current / target) * 100)

      const text = `Step count is ${current}. Goal progress ${percent} percent.`
      await ScreenReader.speak(text, { priority: 'high' })
      return current
    } catch (e) {
      log.error('Step read failed', e)
      await ScreenReader.speak('Step counter not available', { priority: 'high' })
    }
  }

  async readStress() {
    try {
      if (!this.stress) throw new Error('Stress sensor unavailable')
      const info = this.stress.getCurrent()
      const value = info ? info.value : 0
      let level = 'Relaxed'
      if (value > 80) level = 'High'
      else if (value > 60) level = 'Medium'
      else if (value > 30) level = 'Normal'

      const text = `Stress level is ${value}, ${level}.`
      await ScreenReader.speak(text, { priority: 'high' })
      return value
    } catch (e) {
      log.error('Stress read failed', e)
      await ScreenReader.speak('Stress sensor not available', { priority: 'high' })
    }
  }

  async readWorkoutStats(stats = {}) {
    const { distance, duration, calories, hr } = stats
    let text = 'Workout stats: '
    if (duration) text += `Duration ${duration}. `
    if (distance) text += `Distance ${distance}. `
    if (hr) text += `Heart rate ${hr}. `
    if (calories) text += `Calories ${calories}.`

    await ScreenReader.speak(text, { priority: 'high' })
  }
}

export default new SensorReader()
