/**
 * eSpeak NG speech synthesis for the ZSR Side Service.
 *
 * Uses eSpeak NG compiled to JavaScript + WASM (the vendored glue of the
 * `espeak-ng` npm package) instead of a native binary, so the same code runs
 * in any JavaScript host. The 18 MB WASM binary is NOT bundled with the app: it is
 * downloaded once on first use, compiled, and then kept in RAM - matching the
 * "network only for the initial download, everything else from memory" model.
 *
 * If the host has no WebAssembly or the download fails, synthesizeWav() throws
 * an Error whose `code` is 'WEBASSEMBLY_UNAVAILABLE', 'ENGINE_DOWNLOAD_FAILED'
 * (which also covers a failed SHA-256 integrity check)
 * so the watch can fall back to haptic feedback instead of failing silently.
 */

// The glue is vendored (see vendor/espeak-ng.glue.js) with its host detection
// fixed, so it behaves the same in every JavaScript host and loading it has no
// side effects. It is a STATIC import on purpose: Zeus bundles each entry into
// one output file, and a dynamic import() would force a second chunk.
import ESpeakNg from './vendor/espeak-ng.glue.js'
import { sha256Hex } from './sha256.js'

const factory = ESpeakNg

const ENGINE_VERSION = '1.0.2'
const WASM_URLS = [
  `https://cdn.jsdelivr.net/npm/espeak-ng@${ENGINE_VERSION}/dist/espeak-ng.wasm`,
  `https://unpkg.com/espeak-ng@${ENGINE_VERSION}/dist/espeak-ng.wasm`
]
// SHA-256 of espeak-ng@1.0.2/dist/espeak-ng.wasm. A download that does not
// match is rejected, so a tampered or corrupted binary is never executed.
const WASM_SHA256 = '10d24bb7e4124e983aa9cd8cd96c52c8ea4b607d81956ec70846684e2827d532'
const MAX_CHARS_PER_CHUNK = 400

/** @type {WebAssembly.Module | null} */
let compiled = null
/** @type {Promise<WebAssembly.Module> | null} */
let loading = null
/** @type {ArrayBuffer | Uint8Array | WebAssembly.Module | null} */
let injected = null
let queue = Promise.resolve()

function fail(code, message) {
  const error = new Error(message)
  // @ts-ignore - attach a machine readable reason for the caller
  error.code = code
  return error
}

/**
 * Provide the WASM binary (or an already compiled module) directly, e.g. from
 * tests or a host that ships it locally. Skips the network download.
 * @param {ArrayBuffer | Uint8Array | WebAssembly.Module} source
 */
export function setWasmSource(source) {
  injected = source
  compiled = null
}

/** True once the engine is compiled and cached in RAM. */
export function isEngineReady() {
  return compiled !== null
}

async function getFactory() {
  return factory
}

async function downloadWasm() {
  let lastError = null
  for (const url of WASM_URLS) {
    try {
      const res = await fetch(url)
      if (res && res.ok) {
        const buffer = await res.arrayBuffer()
        if (sha256Hex(new Uint8Array(buffer)) === WASM_SHA256) return buffer
        lastError = new Error('integrity check failed for ' + url)
        continue
      }
      lastError = new Error('HTTP ' + (res && res.status))
    } catch (e) {
      lastError = e
    }
  }
  throw fail('ENGINE_DOWNLOAD_FAILED', 'Could not download eSpeak engine: ' + String(lastError))
}

async function getModule() {
  if (compiled) return compiled
  if (loading) return loading
  if (typeof WebAssembly === 'undefined') {
    throw fail('WEBASSEMBLY_UNAVAILABLE', 'WebAssembly is not available in this runtime')
  }
  loading = (async () => {
    const source = injected || (await downloadWasm())
    const module = source instanceof WebAssembly.Module ? source : await WebAssembly.compile(source)
    compiled = module
    return module
  })()
  try {
    return await loading
  } finally {
    loading = null
  }
}

/**
 * Map ZSR / BCP-47 voice names onto eSpeak NG voice identifiers. A `+variant`
 * suffix (for example "+f3" from the Voice Preset setting) is preserved.
 * @param {string} [voice]
 * @returns {string}
 */
export function mapVoice(voice = 'en-US') {
  const [base, variant] = String(voice).split('+')
  const table = {
    'en-us': 'en-us',
    'en-gb': 'en-gb',
    en: 'en-us',
    vi: 'vi',
    'vi-vn': 'vi',
    zh: 'cmn',
    'zh-cn': 'cmn',
    'zh-tw': 'cmn',
    cmn: 'cmn',
    'ja-jp': 'ja',
    'ko-kr': 'ko'
  }
  const lower = base.toLowerCase()
  const id = table[lower] || lower
  return variant ? `${id}+${variant}` : id
}

function clamp(value, min, max, fallback) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(Math.max(Math.round(n), min), max)
}

/**
 * Split long text at sentence boundaries so one utterance never exceeds the
 * memory / latency budget of a single synthesis call.
 * @param {string} text
 * @returns {string[]}
 */
export function chunkText(text) {
  const clean = String(text).replace(/\s+/g, ' ').trim()
  if (clean.length <= MAX_CHARS_PER_CHUNK) return clean ? [clean] : []
  const sentences = clean.match(/[^.!?。！？]+[.!?。！？]*/g) || [clean]
  const chunks = []
  let current = ''
  for (const s of sentences) {
    if ((current + s).length > MAX_CHARS_PER_CHUNK && current) {
      chunks.push(current.trim())
      current = ''
    }
    // A single sentence longer than the limit is cut on a word boundary.
    let rest = s
    while (rest.length > MAX_CHARS_PER_CHUNK) {
      let cut = rest.lastIndexOf(' ', MAX_CHARS_PER_CHUNK)
      if (cut < 1) cut = MAX_CHARS_PER_CHUNK
      chunks.push(rest.slice(0, cut).trim())
      rest = rest.slice(cut)
    }
    current += rest
  }
  if (current.trim()) chunks.push(current.trim())
  return chunks
}

async function synthChunk(module, voice, text, rate, pitch, volume) {
  const create = await getFactory()
  const instance = await create({
    // Reuse the compiled module: instantiating it is cheap, recompiling 18 MB is not.
    instantiateWasm(imports, receive) {
      WebAssembly.instantiate(module, imports).then((instance) => receive(instance))
      return {}
    },
    arguments: [
      '-v',
      voice,
      '-s',
      String(rate),
      '-p',
      String(pitch),
      '-a',
      String(volume),
      '-w',
      'out.wav',
      text
    ],
    print() {},
    printErr() {}
  })
  return instance.FS.readFile('out.wav')
}

/**
 * Synthesize text to a PCM WAV. Calls are serialized: only one engine
 * instance exists at a time, which bounds phone memory use.
 *
 * @param {string} text
 * @param {{ voice?: string, rate?: number, pitch?: number, volume?: number }} [options]
 *   rate = words per minute (80-450), pitch = 0-99, volume = 0-200
 * @returns {Promise<Uint8Array[]>} one WAV per text chunk
 */
export function synthesizeWav(text, options = {}) {
  const run = async () => {
    const chunks = chunkText(text)
    if (chunks.length === 0) throw fail('EMPTY_TEXT', 'No text to speak')
    const module = await getModule()
    const voice = mapVoice(options.voice)
    const rate = clamp(options.rate, 80, 450, 175)
    const pitch = clamp(options.pitch, 0, 99, 50)
    const volume = clamp(options.volume, 0, 200, 100)
    const out = []
    for (const chunk of chunks) {
      out.push(await synthChunk(module, voice, chunk, rate, pitch, volume))
    }
    return out
  }
  const result = queue.then(run, run)
  queue = result.then(
    () => undefined,
    () => undefined
  )
  return result
}
