import { log } from '@zos/utils'
import { statAssetsSync, openAssetsSync, readSync, closeSync, O_RDONLY } from '@zos/fs'
import { encodeBase64 } from '../utils/base64.js'

/** Largest picture sent to the phone: Bluetooth transfer is slow. */
const MAX_IMAGE_BYTES = 200 * 1024

class OCR {
  constructor() {
    this.lastResult = null
    this.isProcessing = false
    this.debugMode = false
    this.debugStats = {
      processTime: 0,
      detectedRegions: 0,
      confidence: 0
    }
  }

  enableDebug(enable = true) {
    this.debugMode = enable
  }

  async recognizeText(screenImage) {
    const startTime = Date.now()
    try {
      this.isProcessing = true

      if (
        !screenImage ||
        typeof screenImage.width !== 'number' ||
        typeof screenImage.height !== 'number'
      ) {
        throw new Error('Invalid screenImage provided to recognizeText')
      }

      const result = await this.processImage(screenImage)
      this.lastResult = result
      if (this.debugMode) {
        this.debugStats.processTime = Date.now() - startTime
        this.logDebugInfo(result)
      }
      return result
    } catch (error) {
      if (this.debugMode) {
        log.debug(
          'OCR Debug - Error: ' +
            JSON.stringify({
              error: String(error),
              imageSize: screenImage ? `${screenImage.width}x${screenImage.height}` : 'N/A',
              processingTime: Date.now() - startTime
            })
        )
      }
      log.warn('OCR Error: ' + String(error))
      return null
    } finally {
      this.isProcessing = false
    }
  }

  logDebugInfo(result) {
    // `performance` (and its non-standard Chrome-only `.memory` extension)
    // doesn't exist in the Zepp OS device runtime - this always threw
    // ReferenceError before, so debug logging silently failed. Guard it
    // instead of assuming a browser environment.
    /** @type {any} */
    const perf = globalThis.performance
    const hasPerf = !!(perf && perf.memory)
    log.debug(
      'OCR Debug Info: ' +
        JSON.stringify({
          processingTime: `${this.debugStats.processTime.toFixed(2)}ms`,
          detectedRegions: result.length,
          memoryUsage: hasPerf ? `${(perf.memory.usedJSHeapSize / 1048576).toFixed(2)}MB` : 'N/A'
        })
    )
  }

  async prepareImage(screenImage) {
    // Convert screen capture to grayscale for better processing
    return {
      width: screenImage.width,
      height: screenImage.height,
      data: this.convertToGrayscale(screenImage.data)
    }
  }

  convertToGrayscale(imageData) {
    // Basic grayscale conversion
    const gray = new Uint8Array(imageData.length / 4)
    for (let i = 0; i < imageData.length; i += 4) {
      gray[i / 4] = imageData[i] * 0.299 + imageData[i + 1] * 0.587 + imageData[i + 2] * 0.114
    }
    return gray
  }

  async processImage(screenImage) {
    // Basic text detection and recognition
    const imageData = await this.prepareImage(screenImage)
    const textRegions = this.detectTextRegions(imageData)
    return this.extractText(textRegions)
  }

  extractText(textRegions) {
    if (!textRegions) return ''
    if (typeof textRegions === 'string') return textRegions
    if (Array.isArray(textRegions)) {
      return textRegions.map((r) => (typeof r === 'string' ? r : r.text || '')).join(' ')
    }
    if (textRegions.regions && Array.isArray(textRegions.regions)) {
      return textRegions.regions.map((r) => r.text || '').join(' ')
    }
    return ''
  }

  detectTextRegions(_imageData) {
    const regions = []
    // Implement basic text region detection
    // This is a simplified version - real implementation would need more sophisticated algorithms
    if (this.debugMode) {
      this.debugStats.detectedRegions = regions.length
      this.visualizeRegions(regions)
    }
    return { regions, boundingBoxes: [] }
  }

  visualizeRegions(regions) {
    if (this.debugMode) {
      log.debug(
        'Text Regions: ' +
          regions.map((r, i) => `Region ${i}: ${JSON.stringify(r.bounds)}`).join('; ')
      )
    }
  }

  /**
   * Read the text in a picture through the phone (an online vision service does the
   * recognition). The request and answer use the same fields as the phone side
   * (app-side/index.js): `{ image (base64), language, mime }` -> `{ result, text }`.
   * @param {string} imageBase64
   * @param {string} [mime]
   * @returns {Promise<{ ok: boolean, text: string, code?: string }>}
   */
  async performOCR(imageBase64, mime = 'image/png') {
    const app = getApp()
    const messageBuilder = app._options.globalData ? app._options.globalData.messageBuilder : null
    if (!messageBuilder) {
      log.warn('OCR: MessageBuilder not found')
      return { ok: false, text: '', code: 'UNAVAILABLE' }
    }

    try {
      const language = (globalThis.ScreenReaderConfig || {}).language
      const response = await messageBuilder.request(
        { method: 'OCR_IMAGE', params: { image: imageBase64, language, mime } },
        { timeout: 60000 }
      )
      if (!response || response.result !== 'OK') {
        return { ok: false, text: '', code: (response && response.code) || 'IMAGE_FAILED' }
      }
      return { ok: true, text: String(response.text || '') }
    } catch (error) {
      log.warn('OCR side-service request failed: ' + String(error))
      return { ok: false, text: '', code: 'UNAVAILABLE' }
    }
  }

  /**
   * Read the bytes of a picture from this app's assets (the `src` of an image widget).
   * Returns null when the file cannot be read or is too large to send over Bluetooth.
   * @param {string} src asset path such as 'image/logo.png'
   * @returns {Uint8Array | null}
   */
  readImageBytes(src) {
    let fd = -1
    try {
      const info = statAssetsSync({ path: src })
      if (!info || !info.size || info.size > MAX_IMAGE_BYTES) return null
      fd = openAssetsSync({ path: src, flag: O_RDONLY })
      const buffer = new ArrayBuffer(info.size)
      readSync({ fd, buffer })
      return new Uint8Array(buffer)
    } catch (error) {
      log.debug('OCR: image could not be read: ' + String(error))
      return null
    } finally {
      if (fd >= 0) {
        try {
          closeSync({ fd })
        } catch (_e) {
          /* already closed */
        }
      }
    }
  }

  /**
   * Text in a picture shown by an image widget.
   * @param {string} src asset path of the image
   * @returns {Promise<{ ok: boolean, text: string, code?: string }>}
   */
  async readImageText(src) {
    const bytes = typeof src === 'string' ? this.readImageBytes(src) : null
    if (!bytes) return { ok: false, text: '', code: 'NO_IMAGE_SOURCE' }
    const mime = /\.jpe?g$/i.test(src) ? 'image/jpeg' : 'image/png'
    return this.performOCR(encodeBase64(bytes), mime)
  }

  getLastResult() {
    return this.lastResult
  }
}

export default OCR
