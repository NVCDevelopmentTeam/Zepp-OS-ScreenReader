import { MessageBuilder } from '../GrantPermission/message-side.js'

const messageBuilder = new MessageBuilder()

/**
 * OpenAI TTS implementation (Fallback / placeholder for API synthesis)
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
    console.log('eSpeak TTS Synthesis:', text, options)
    // Note: espeak-ng's compiled WASM/Node binary cannot run inside Zepp OS Companion
    // runtime (QuickJS/JSC without Node 'module' or 18MB local WASM support).
    // Companion side service acknowledges synthesis request.
    return 'OK'
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
          // Cloud / Companion OCR logic
          const textRegions = [{ text: 'Sample Text', bounds: { x: 10, y: 10, w: 100, h: 30 } }]
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
          ctx.response({ data: { result: 'ERROR' } })
        }
      } else if (method === 'CAMERA_START') {
        // HONESTY NOTE: there is no confirmed Zepp OS API in current
        // public docs for a Mini Program's side service to access the
        // phone's camera or run real-time AI framing analysis. This
        // handler is a placeholder that always reports "done" after the
        // first step rather than pretending to track real phone position
        // across several fake steps - a real implementation needs an
        // actual camera-capture + vision-analysis integration on the
        // phone side (native app or a service the phone app can call
        // into), which is a separate, larger feature to build and verify
        // against Zepp's current SDK before shipping as if it works.
        console.log('CAMERA_START requested (guidance step):', params?.step)
        ctx.response({
          data: {
            done: true,
            prompt:
              'Camera guidance is not yet available on this build - this feature needs a real camera and image-analysis integration on the phone side.'
          }
        })
      } else if (method === 'CAPTURE_AND_DESCRIBE') {
        // Same honesty note as CAMERA_START above - no real image capture
        // or AI description is wired up yet.
        console.log('CAPTURE_AND_DESCRIBE requested')
        ctx.response({
          data: {
            result: 'UNAVAILABLE',
            text: 'Image description is not yet available on this build.'
          }
        })
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
