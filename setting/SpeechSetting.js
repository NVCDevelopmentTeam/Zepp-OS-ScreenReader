import { settingsManager } from './utils'
import { createWidget, widget } from '@zos/ui'
import { log } from '@zos/utils'

Page({
  state: {
    rate: 1.0,
    pitch: 1.0,
    volume: 0.8
  },

  onInit() {
    this.validateSpeechCapability()
  },

  async validateSpeechCapability() {
    const { speech } = await settingsManager.deviceManager.validate()
    if (!speech) {
      throw new Error('Speech not supported')
    }
  },

  build() {
    try {
      const rateSlider = this.createRateControl()
      const pitchSlider = this.createPitchControl()
      
      this.append(rateSlider)
      this.append(pitchSlider)
    } catch (error) {
      log.error('Speech controls build error:', error)
    }
  },

  async changeSpeechRate(value) {
    try {
      if (!settingsManager.validateNumericRange(value, 0.5, 2.0)) {
        throw new Error('Invalid speech rate')
      }

      const success = await settingsManager.handleSettingChange(
        () => Speech.setRate(value),
        value,
        'speechRate'
      )
      if (success) this.setState({ rate: value })
    } catch (error) {
      log.error('Speech rate change failed:', error)
    }
  },

  async changeSpeechPitch(value) {
    try {
      if (!settingsManager.validateNumericRange(value, 0.5, 2.0)) {
        throw new Error('Invalid speech pitch')
      }

      const success = await settingsManager.handleSettingChange(
        () => Speech.setPitch(value),
        value,
        'speechPitch'
      )
      if (success) this.setState({ pitch: value })
    } catch (error) {
      log.error('Speech pitch change failed:', error)
    }
  },

  createRateControl() {
    return createWidget(widget.SLIDER, {
      x: 0,
      y: 0,
      w: '100%',
      h: 40,
      min: 0.5,
      max: 2.0,
      step: 0.1,
      value: this.state.rate,
      onChange: this.changeSpeechRate.bind(this)
    })
  },

  createPitchControl() {
    return createWidget(widget.SLIDER, {
      x: 0,
      y: 50,
      w: '100%', 
      h: 40,
      min: 0.5,
      max: 2.0,
      step: 0.1,
      value: this.state.pitch,
      onChange: this.changeSpeechPitch.bind(this)
    })
  }
})
