import { HeartRate, Sleep, SpO2, Step, Stress, Calorie, Distance } from '@zos/sensor'
import ScreenReader from '../core/screenReader.js'
import { log } from '@zos/utils'

class SensorReader {
  constructor() {
    this.hr = new HeartRate()
    this.sleep = new Sleep()
    this.spo2 = new SpO2()
    this.step = new Step()
    this.stress = new Stress()
    this.calorie = new Calorie()
    this.distance = new Distance()
  }

  async readCalories() {
    try {
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
      const current = this.hr.getCurrent()
      const last = this.hr.getLast()
      const text = `Heart rate is ${current || last || 0} beats per minute.`
      await ScreenReader.speak(text, { priority: 'high' })
      return current
    } catch (e) {
      log.error('HR read failed', e)
      await ScreenReader.speak('Heart rate sensor not available', { priority: 'high' })
    }
  }

  async readSpO2() {
    try {
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
      const info = this.sleep.getSleepStageModel()
      const { totalTime = 0, deepTime = 0, lightTime = 0, remTime = 0 } = info

      const text =
        `Sleep summary: Total duration ${Math.floor(totalTime / 60)} hours and ${totalTime % 60} minutes. ` +
        `Deep sleep: ${deepTime} minutes. Light sleep: ${lightTime} minutes. REM: ${remTime} minutes.`

      await ScreenReader.speak(text, { priority: 'high' })
      return info
    } catch (e) {
      log.error('Sleep read failed', e)
      await ScreenReader.speak('Sleep data not available', { priority: 'high' })
    }
  }

  async readSteps() {
    try {
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
