/**
 * Online AI helpers for the ZSR Side Service (needs internet).
 *
 * One user-configured, OpenAI-compatible provider powers:
 *   - speech-to-text for voice commands  (POST {base}/audio/transcriptions)
 *   - image description / OCR            (POST {base}/chat/completions)
 *
 * ZSR ships no API key and no hidden backend: the user enters their own base
 * URL and key in the phone settings (keys aiBaseUrl / aiApiKey). When nothing
 * is configured every call fails with code 'AI_NOT_CONFIGURED', so the watch
 * can tell the user exactly what to do instead of failing silently.
 */
import { encodeBase64 } from '../../lib/utils/base64.js'

const DEFAULT_BASE_URL = 'https://api.openai.com/v1'

function fail(code, message) {
  const error = new Error(message)
  // @ts-ignore machine readable reason
  error.code = code
  return error
}

/**
 * @param {Record<string, any>} raw values from the phone settings storage
 */
export function normalizeConfig(raw = {}) {
  const base = String(raw.aiBaseUrl || DEFAULT_BASE_URL)
    .trim()
    .replace(/\/+$/, '')
  return {
    baseUrl: base,
    apiKey: String(raw.aiApiKey || '').trim(),
    sttModel: String(raw.aiSttModel || 'whisper-1').trim(),
    visionModel: String(raw.aiVisionModel || 'gpt-4o-mini').trim()
  }
}

function requireKey(config) {
  if (!config.apiKey) throw fail('AI_NOT_CONFIGURED', 'No AI provider key configured')
}

function utf8(text) {
  const out = []
  for (let i = 0; i < text.length; i++) {
    let c = text.charCodeAt(i)
    if (c >= 0xd800 && c <= 0xdbff && i + 1 < text.length) {
      c = 0x10000 + ((c - 0xd800) << 10) + (text.charCodeAt(++i) - 0xdc00)
    }
    if (c < 0x80) out.push(c)
    else if (c < 0x800) out.push(0xc0 | (c >> 6), 0x80 | (c & 63))
    else if (c < 0x10000) out.push(0xe0 | (c >> 12), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63))
    else
      out.push(0xf0 | (c >> 18), 0x80 | ((c >> 12) & 63), 0x80 | ((c >> 6) & 63), 0x80 | (c & 63))
  }
  return new Uint8Array(out)
}

/**
 * Build a multipart/form-data body without FormData/Blob, which are not
 * guaranteed in every JavaScript host.
 * @param {{name: string, value: string}[]} fields
 * @param {{name: string, filename: string, type: string, data: Uint8Array}} file
 */
export function buildMultipart(fields, file) {
  const boundary = '----zsr' + Math.random().toString(16).slice(2) + Date.now().toString(16)
  const chunks = []
  fields.forEach((f) => {
    chunks.push(
      utf8(
        `--${boundary}\r\nContent-Disposition: form-data; name="${f.name}"\r\n\r\n${f.value}\r\n`
      )
    )
  })
  chunks.push(
    utf8(
      `--${boundary}\r\nContent-Disposition: form-data; name="${file.name}"; filename="${file.filename}"\r\nContent-Type: ${file.type}\r\n\r\n`
    )
  )
  chunks.push(file.data)
  chunks.push(utf8(`\r\n--${boundary}--\r\n`))
  let total = 0
  chunks.forEach((c) => (total += c.length))
  const body = new Uint8Array(total)
  let pos = 0
  chunks.forEach((c) => {
    body.set(c, pos)
    pos += c.length
  })
  return { body, contentType: `multipart/form-data; boundary=${boundary}` }
}

async function readJson(res, what) {
  let data = null
  try {
    data = await res.json()
  } catch (_e) {
    /* non JSON error body */
  }
  if (!res.ok) {
    const detail = data && data.error && (data.error.message || data.error)
    throw fail('AI_REQUEST_FAILED', `${what} failed (HTTP ${res.status}) ${detail || ''}`.trim())
  }
  return data
}

/**
 * Speech to text.
 * @param {Uint8Array} audio recorded audio (Ogg Opus from the watch recorder)
 * @param {{ language?: string, filename?: string, type?: string }} options
 * @param {Record<string, any>} rawConfig
 * @returns {Promise<string>}
 */
export async function transcribe(audio, options = {}, rawConfig = {}) {
  const config = normalizeConfig(rawConfig)
  requireKey(config)
  const fields = [{ name: 'model', value: config.sttModel }]
  if (options.language) fields.push({ name: 'language', value: options.language })
  const { body, contentType } = buildMultipart(fields, {
    name: 'file',
    filename: options.filename || 'speech.ogg',
    type: options.type || 'audio/ogg',
    data: audio
  })
  const res = await fetch(`${config.baseUrl}/audio/transcriptions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': contentType },
    body
  })
  const data = await readJson(res, 'Transcription')
  const text = data && typeof data.text === 'string' ? data.text.trim() : ''
  if (!text) throw fail('NO_SPEECH_DETECTED', 'No speech was recognised')
  return text
}

/**
 * Describe an image (scene description, or reading text in it).
 * @param {Uint8Array} image JPEG/PNG bytes
 * @param {{ prompt?: string, mime?: string, language?: string }} options
 * @param {Record<string, any>} rawConfig
 * @returns {Promise<string>}
 */
export async function describeImage(image, options = {}, rawConfig = {}) {
  const config = normalizeConfig(rawConfig)
  requireKey(config)
  const lang = options.language ? ` Answer in ${options.language}.` : ''
  const prompt = (options.prompt || 'Describe this image briefly for a blind person.') + lang
  const dataUri = `data:${options.mime || 'image/jpeg'};base64,${encodeBase64(image)}`
  const res = await fetch(`${config.baseUrl}/chat/completions`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${config.apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: config.visionModel,
      max_tokens: 300,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: prompt },
            { type: 'image_url', image_url: { url: dataUri } }
          ]
        }
      ]
    })
  })
  const data = await readJson(res, 'Image description')
  const text = data && data.choices && data.choices[0] && data.choices[0].message
  const content = text && typeof text.content === 'string' ? text.content.trim() : ''
  if (!content) throw fail('AI_EMPTY_RESPONSE', 'Provider returned no description')
  return content
}

const OCR_PROMPT =
  'Read all text visible in this image exactly as written, in reading order. ' +
  'If there is no text, say so in one short sentence. Do not describe the image.'
const CAPTCHA_PROMPT =
  'This image is a CAPTCHA shown to a blind user who cannot see it. Read out the characters or ' +
  'words it contains exactly, letter by letter if they are random. If it is a picture puzzle ' +
  '(for example "select all traffic lights") describe what is shown and what is asked. ' +
  'Answer briefly with only that.'

/**
 * Read the text in an image (OCR for things a screen reader cannot reach:
 * text inside pictures, scans, complex layouts).
 * @param {Uint8Array} image
 * @param {{ language?: string, mime?: string }} options
 * @param {Record<string, any>} rawConfig
 */
export function readImageText(image, options = {}, rawConfig = {}) {
  return describeImage(image, { ...options, prompt: OCR_PROMPT }, rawConfig)
}

/**
 * Read a CAPTCHA aloud for a blind user.
 * @param {Uint8Array} image
 * @param {{ language?: string, mime?: string }} options
 * @param {Record<string, any>} rawConfig
 */
export function readCaptcha(image, options = {}, rawConfig = {}) {
  return describeImage(image, { ...options, prompt: CAPTCHA_PROMPT }, rawConfig)
}
