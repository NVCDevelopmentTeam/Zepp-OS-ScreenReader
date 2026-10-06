import { log } from '@zos/utils'

import { format, gettext } from '../utils/i18n.js'
/**
 * Camera Assistant Extension for ZSR
 * Provides companion-assisted camera guidance and scene description for blind users.
 * Gracefully degrades when camera hardware or companion connection is unavailable.
 */
export class CameraAssistant {
  /**
   * @param {any} screenReader
   */
  constructor(screenReader) {
    this.screenReader = screenReader
    this.isGuiding = false
    this.lastGuidePrompt = ''
  }

  isSupported() {
    const app = typeof getApp === 'function' ? getApp() : null
    return !!app?._options?.globalData?.messageBuilder
  }

  async toggleGuidance() {
    if (!this.isSupported()) {
      if (this.screenReader) {
        this.screenReader.speak(gettext('Camera guidance requires phone companion connection.'), {
          priority: 'HIGH'
        })
      }
      return false
    }

    this.isGuiding = !this.isGuiding
    const app = getApp()
    const messageBuilder = app._options.globalData.messageBuilder

    try {
      if (this.isGuiding) {
        if (this.screenReader) {
          this.screenReader.speak(gettext('Camera guidance active. Point camera steadily.'), {
            priority: 'HIGH'
          })
        }
        messageBuilder
          .request({
            method: 'CAMERA_START',
            params: { action: 'START_GUIDE' }
          })
          .then((response) => {
            if (response?.prompt && this.screenReader) {
              this.screenReader.speak(response.prompt)
            }
          })
          .catch((err) => {
            log.error('Camera guidance request failed:', err)
          })
      } else {
        if (this.screenReader) {
          this.screenReader.speak(gettext('Camera guidance stopped.'), { priority: 'HIGH' })
        }
      }
      return true
    } catch (e) {
      log.error('Camera guidance error:', e)
      return false
    }
  }

  async captureAndDescribe() {
    if (!this.isSupported()) {
      if (this.screenReader) {
        this.screenReader.speak(gettext('Scene description requires phone companion connection.'), {
          priority: 'HIGH'
        })
      }
      return null
    }

    if (this.screenReader) {
      this.screenReader.speak(gettext('Capturing image for scene analysis, please hold still...'), {
        priority: 'HIGH'
      })
    }

    const app = getApp()
    const messageBuilder = app._options.globalData.messageBuilder

    try {
      const response = await messageBuilder.request({
        method: 'CAPTURE_AND_DESCRIBE',
        params: {}
      })

      const text = response?.text || 'No description returned.'
      if (this.screenReader) {
        this.screenReader.speak(format(gettext('Scene description: {0}'), text), {
          priority: 'HIGH'
        })
      }
      return text
    } catch (e) {
      log.error('Capture and describe error:', e)
      if (this.screenReader) {
        this.screenReader.speak(gettext('Failed to analyze scene.'), { priority: 'HIGH' })
      }
      return null
    }
  }
}

export default CameraAssistant
