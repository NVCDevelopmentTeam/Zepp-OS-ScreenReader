import { MessageBuilder } from '../shared/message-side.js'
import espeak from 'espeak-ng'

const messageBuilder = new MessageBuilder()

/**
 * OpenAI TTS implementation (Placeholder for actual API call)
 */
async function speakOpenAI(text) {
  try {
    console.log('OpenAI TTS Synthesis:', text)
    return 'OK'
  } catch (error) {
    console.error('OpenAI TTS Error:', error)
    return 'ERROR'
  }
}

/**
 * eSpeak TTS implementation
 */
async function speakEspeak(text, options = {}) {
  try {
    console.log('eSpeak TTS Synthesis:', text)
    if (espeak && typeof espeak.speak === 'function') {
      await espeak.speak(text, {
        voice: options.voice || 'en-US',
        pitch: options.pitch || 50,
        rate: options.rate || 175
      })
      return 'OK'
    }
    return 'ERROR: espeak not available'
  } catch (error) {
    console.error('eSpeak Error:', error)
    return 'ERROR'
  }
}

AppSideService({
  onInit() {
    messageBuilder.listen(() => {})

    messageBuilder.on('request', async (ctx) => {
      const jsonRpc = messageBuilder.buf2Json(ctx.request.payload)
      const { method, params } = jsonRpc

      if (method === 'SPEAK') {
        const { text, engine = 'openai' } = params
        const result =
          engine === 'openai' ? await speakOpenAI(text) : await speakEspeak(text, params)

        ctx.response({
          data: { result }
        })
      } else if (method === 'OCR_IMAGE') {
        try {
          // Placeholder for real OCR logic (e.g., using Tesseract or Google Cloud Vision)
          const textRegions = [
            { text: 'Hello', bounds: { x: 10, y: 10, w: 50, h: 20 } },
            { text: 'World', bounds: { x: 70, y: 10, w: 60, h: 20 } }
          ]
          ctx.response({ data: { textRegions } })
        } catch (error) {
          console.error('OCR Processing Error:', error)
          ctx.response({ data: { error: 'OCR failed' } })
        }
      } else if (method === 'CHECK_UPDATE') {
        try {
          const res = await fetch('https://zeppreader.com/api/version')
          const data = await res.json()

          const currentVersion = '1.0.1'
          const latestVersion = data.version || currentVersion

          if (latestVersion !== currentVersion) {
            ctx.response({
              data: {
                result: 'UPDATE_AVAILABLE',
                version: latestVersion,
                url: data.downloadUrl || 'https://zeppreader.com/download'
              }
            })
          } else {
            ctx.response({ data: { result: 'UP_TO_DATE' } })
          }
        } catch (error) {
          console.error('Update check failed:', error)
          // Fallback if fetch fails or site is down
          ctx.response({ data: { result: 'ERROR' } })
        }
      } else if (method === 'CAMERA_START') {
        console.log('Phone Camera Started for Guidance')
        ctx.response({ data: { result: 'OK' } })
      } else if (method === 'GET_DATA') {
        ctx.response({ data: { result: 'OK' } })
      }
    })
  },

  onSettingsChange({ key, newValue, _oldValue }) {
    console.log('Setting changed:', key, newValue)
    messageBuilder.call({
      method: 'SETTING_UPDATE',
      params: { key, value: newValue }
    })
  },

  onRun() {},

  onDestroy() {}
})
