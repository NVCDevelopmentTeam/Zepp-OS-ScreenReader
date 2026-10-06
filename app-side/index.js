/* global settings -- provided by the Zepp Side Service runtime */
import { MessageBuilder } from '../GrantPermission/message-side.js'
import { textToSpeechMp3, textToSpeechClip, isEngineReady } from './tts/index.js'
import { transcribe, describeImage, readImageText, readCaptcha } from './online/aiClient.js'
import { decodeBase64 } from '../lib/utils/base64.js'

const messageBuilder = new MessageBuilder()

/**
 * OpenAI TTS implementation
 *
 * HONESTY NOTE: this has never made a real API call - it only logs and
 * returns 'OK' as if synthesis succeeded, with no API key configuration,
 * no HTTP request, and no audio produced. Returns a real error instead of
 * a fake success until a real implementation exists. Separately: "OpenAI
 * TTS" as described in this project's README refers to Zepp OS's own
 * closed, first-party "Zepp Flow" voice assistant (Zepp OS 4+, GPT-4o) -
 * there is no confirmed public SDK hook letting a third-party Mini
 * Program feed it arbitrary text to synthesize, so this path may not be
 * achievable at all, not just unimplemented.
 */
async function speakOpenAI(_text) {
  console.warn('speakOpenAI: not implemented - no confirmed API path exists for this yet.')
  return 'ERROR: OpenAI TTS not implemented'
}

/**
 * eSpeak NG TTS implementation (Side Service, pure JavaScript).
 *
 * Text is synthesized by the `espeak-ng` npm package (eSpeak NG compiled to
 * JS + WASM), encoded to MP3 by lamejs (pure JS) and returned to the watch,
 * which can only play MP3/OPUS files (API_LEVEL 3.0+). The WASM engine is
 * downloaded once and then stays in memory. See app-side/tts/.
 *
 * On failure a machine readable `code` is returned (for example
 * WEBASSEMBLY_UNAVAILABLE or ENGINE_DOWNLOAD_FAILED) so the watch can fall
 * back to haptic feedback instead of staying silent with no explanation.
 *
 * @returns {Promise<{ result: string, code?: string, audio?: object }>}
 */
async function speakEspeak(text, options = {}) {
  try {
    const audio = await textToSpeechMp3(text, {
      voice: options.voice,
      rate: options.rate,
      pitch: options.pitch,
      volume: options.volume
    })
    return { result: 'OK', audio }
  } catch (error) {
    const code = (error && error.code) || 'SYNTHESIS_FAILED'
    console.error('speakEspeak failed:', code, String(error))
    return { result: 'ERROR', code }
  }
}

/**
 * Online image features: scene description, OCR (text inside pictures) and
 * CAPTCHA reading. They need internet and a provider configured by the user.
 * Zepp OS exposes no camera or screenshot API to a Side Service, so the image
 * (base64 JPEG/PNG) must be supplied by the caller; without one the request
 * answers UNAVAILABLE rather than inventing content.
 */
async function handleImageRequest(method, params) {
  try {
    if (!params || !params.image) return { result: 'UNAVAILABLE', code: 'NO_IMAGE_SOURCE' }
    const store = typeof settings !== 'undefined' ? settings.settingsStorage : null
    const read = (k) => (store ? store.getItem(k) : undefined)
    const config = {
      aiBaseUrl: read('aiBaseUrl'),
      aiApiKey: read('aiApiKey'),
      aiVisionModel: read('aiVisionModel')
    }
    const image = decodeBase64(params.image)
    const options = { language: params.language, mime: params.mime }
    const run =
      method === 'OCR_IMAGE'
        ? readImageText
        : method === 'READ_CAPTCHA'
          ? readCaptcha
          : describeImage
    return { result: 'OK', text: await run(image, options, config) }
  } catch (error) {
    const code = (error && error.code) || 'IMAGE_FAILED'
    console.error(method + ' failed:', code, String(error))
    return { result: 'ERROR', code }
  }
}

AppSideService({
  onInit() {
    // One line describing what this phone's Side Service runtime provides, for
    // bug reports (speech needs WebAssembly + fetch; see app-side/tts).
    console.log(
      '[ZSR diag] side ' +
        JSON.stringify({
          webAssembly: typeof WebAssembly !== 'undefined',
          fetch: typeof fetch === 'function',
          url: typeof URL !== 'undefined',
          textDecoder: typeof TextDecoder !== 'undefined',
          nodeLike: typeof process !== 'undefined'
        })
    )
    messageBuilder.listen(() => {})

    messageBuilder.on('request', async (ctx) => {
      const jsonRpc = messageBuilder.buf2Json(ctx.request.payload)
      const { method, params } = jsonRpc

      if (method === 'SPEAK') {
        const { text, engine = 'espeak' } = params
        if (engine === 'openai') {
          const result = await speakOpenAI(text)
          ctx.response({ data: { result } })
        } else {
          ctx.response({ data: await speakEspeak(text, params) })
        }
      } else if (method === 'VOICE_COMMAND') {
        // Online speech-to-text for voice control (needs internet + a
        // user-configured provider). The watch records Opus and sends it here.
        try {
          const store = typeof settings !== 'undefined' ? settings.settingsStorage : null
          const read = (k) => (store ? store.getItem(k) : undefined)
          const config = {
            aiBaseUrl: read('aiBaseUrl'),
            aiApiKey: read('aiApiKey'),
            aiSttModel: read('aiSttModel')
          }
          const language =
            params && params.language ? String(params.language).slice(0, 2) : undefined
          const text = await transcribe(decodeBase64(params.audio), { language }, config)
          ctx.response({ data: { result: 'OK', text } })
        } catch (error) {
          const code = (error && error.code) || 'VOICE_FAILED'
          console.error('VOICE_COMMAND failed:', code, String(error))
          ctx.response({ data: { result: 'ERROR', code } })
        }
      } else if (method === 'TTS_BATCH') {
        // Offline voice download: one clip per unit (word / letter / number).
        // Units that fail are reported individually so the watch can retry
        // them later instead of discarding the whole batch.
        const items = Array.isArray(params && params.items) ? params.items.slice(0, 12) : []
        const clips = []
        const failed = []
        for (const token of items) {
          try {
            clips.push({ t: token, b: await textToSpeechClip(token, params) })
          } catch (error) {
            failed.push(token)
            // A missing engine will fail every unit: stop early and say why.
            if (
              error &&
              (error.code === 'WEBASSEMBLY_UNAVAILABLE' || error.code === 'ENGINE_DOWNLOAD_FAILED')
            ) {
              ctx.response({ data: { result: 'ERROR', code: error.code, clips, failed: items } })
              return
            }
          }
        }
        ctx.response({ data: { result: 'OK', clips, failed } })
      } else if (method === 'TTS_WARMUP') {
        // Download + compile the engine in advance (first use otherwise has
        // to wait for the ~18 MB download), so the first spoken sentence is
        // not delayed. Failure is reported, never thrown.
        try {
          await textToSpeechMp3('.', { voice: params && params.voice })
          ctx.response({ data: { result: 'OK', engineReady: isEngineReady() } })
        } catch (error) {
          ctx.response({
            data: { result: 'ERROR', code: (error && error.code) || 'WARMUP_FAILED' }
          })
        }
      } else if (method === 'TTS_STATUS') {
        // Lets the watch know whether the engine is already in memory
        // (first use downloads it, so the first sentence can be slower).
        ctx.response({ data: { result: 'OK', engineReady: isEngineReady() } })
      } else if (
        method === 'OCR_IMAGE' ||
        method === 'READ_CAPTCHA' ||
        method === 'DESCRIBE_IMAGE'
      ) {
        ctx.response({ data: await handleImageRequest(method, params) })
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
        ctx.response({ data: await handleImageRequest('DESCRIBE_IMAGE', params) })
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
