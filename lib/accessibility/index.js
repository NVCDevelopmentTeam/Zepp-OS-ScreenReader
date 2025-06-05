import { log } from '@zos/utils'
import TTSEngine from '../TTSSystem/Espeak tts ng'
import { VibrationManager } from '../data/vibrate feedback'

class AccessibilityManager {
  constructor() {
    this.tts = new TTSEngine()
    this.initialized = false
  }

  async init() {
    try {
      await this.tts.init()
      this.initialized = true
      return true
    } catch (error) {
      log.error('Accessibility init failed:', error)
      return false
    }
  }

  async speak(text, options = {}) {
    if (!this.initialized) {
      await this.init()
    }
    return await this.tts.synthesize(text)
  }

  async provideFeedback(type) {
    return await VibrationManager.feedback(type)
  }
}

export default new AccessibilityManager()
