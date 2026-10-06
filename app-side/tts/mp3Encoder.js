/**
 * WAV (PCM16) -> MP3 using lamejs, a pure JavaScript encoder.
 *
 * Zepp OS can only play MP3 / OPUS files, while eSpeak NG produces PCM WAV, so
 * the Side Service converts each utterance before sending it to the watch.
 * MP3 at 32 kbps mono keeps a typical 2 second sentence under ~10 KB.
 */
import lamejs from './vendor/lamejs.js'

const FRAME = 1152

/**
 * Locate the PCM payload of a RIFF/WAVE buffer.
 * @param {Uint8Array} wav
 * @returns {{ sampleRate: number, channels: number, pcm: Int16Array }}
 */
export function parseWav(wav) {
  const dv = new DataView(wav.buffer, wav.byteOffset, wav.byteLength)
  const tag = (o) => String.fromCharCode(wav[o], wav[o + 1], wav[o + 2], wav[o + 3])
  if (wav.length < 44 || tag(0) !== 'RIFF' || tag(8) !== 'WAVE') {
    throw new Error('Invalid WAV data')
  }
  let sampleRate = 22050
  let channels = 1
  let bits = 16
  let offset = 12
  while (offset + 8 <= wav.length) {
    const id = tag(offset)
    const size = dv.getUint32(offset + 4, true)
    const body = offset + 8
    if (id === 'fmt ') {
      channels = dv.getUint16(body + 2, true)
      sampleRate = dv.getUint32(body + 4, true)
      bits = dv.getUint16(body + 14, true)
    } else if (id === 'data') {
      if (bits !== 16) throw new Error('Only 16-bit PCM is supported')
      // eSpeak streams may report 0 / 0xFFFFFFFF as the size; clamp to buffer.
      const end = Math.min(body + (size || wav.length), wav.length)
      const count = (end - body) >> 1
      const pcm = new Int16Array(count)
      for (let i = 0; i < count; i++) pcm[i] = dv.getInt16(body + i * 2, true)
      return { sampleRate, channels, pcm }
    }
    offset = body + size + (size & 1)
  }
  throw new Error('WAV has no data chunk')
}

/**
 * @param {Uint8Array} wav
 * @param {{ kbps?: number }} [options]
 * @returns {{ mp3: Uint8Array, sampleRate: number, seconds: number }}
 */
export function wavToMp3(wav, options = {}) {
  const { sampleRate, channels, pcm } = parseWav(wav)
  if (channels !== 1) throw new Error('Only mono audio is supported')
  const encoder = new lamejs.Mp3Encoder(1, sampleRate, options.kbps || 32)
  const chunks = []
  let total = 0
  for (let i = 0; i < pcm.length; i += FRAME) {
    const part = encoder.encodeBuffer(pcm.subarray(i, i + FRAME))
    if (part.length) {
      chunks.push(part)
      total += part.length
    }
  }
  const tail = encoder.flush()
  if (tail.length) {
    chunks.push(tail)
    total += tail.length
  }
  const mp3 = new Uint8Array(total)
  let pos = 0
  for (const c of chunks) {
    mp3.set(c, pos)
    pos += c.length
  }
  return { mp3, sampleRate, seconds: pcm.length / sampleRate }
}

/**
 * Join several mono PCM WAV buffers with a short pause between them.
 * @param {Uint8Array[]} wavs
 * @param {number} [pauseMs]
 * @returns {{ sampleRate: number, pcm: Int16Array }}
 */
export function joinWav(wavs, pauseMs = 120) {
  const parts = wavs.map(parseWav)
  const sampleRate = parts[0].sampleRate
  const gap = Math.round((sampleRate * pauseMs) / 1000)
  let len = 0
  parts.forEach((p, i) => {
    len += p.pcm.length + (i < parts.length - 1 ? gap : 0)
  })
  const pcm = new Int16Array(len)
  let pos = 0
  parts.forEach((p, i) => {
    pcm.set(p.pcm, pos)
    pos += p.pcm.length + (i < parts.length - 1 ? gap : 0)
  })
  return { sampleRate, pcm }
}

/** Build a minimal mono PCM16 WAV from samples (used to feed wavToMp3). */
export function pcmToWav(pcm, sampleRate) {
  const out = new Uint8Array(44 + pcm.length * 2)
  const dv = new DataView(out.buffer)
  const w = (o, s) => {
    for (let i = 0; i < s.length; i++) out[o + i] = s.charCodeAt(i)
  }
  w(0, 'RIFF')
  dv.setUint32(4, 36 + pcm.length * 2, true)
  w(8, 'WAVE')
  w(12, 'fmt ')
  dv.setUint32(16, 16, true)
  dv.setUint16(20, 1, true)
  dv.setUint16(22, 1, true)
  dv.setUint32(24, sampleRate, true)
  dv.setUint32(28, sampleRate * 2, true)
  dv.setUint16(32, 2, true)
  dv.setUint16(34, 16, true)
  w(36, 'data')
  dv.setUint32(40, pcm.length * 2, true)
  for (let i = 0; i < pcm.length; i++) dv.setInt16(44 + i * 2, pcm[i], true)
  return out
}

/**
 * Remove leading/trailing near-silence so word clips join without gaps. A
 * short tail is kept so words do not run into each other.
 * @param {Int16Array} pcm
 * @param {number} sampleRate
 * @param {{ threshold?: number, headMs?: number, tailMs?: number }} [options]
 * @returns {Int16Array}
 */
export function trimPcm(pcm, sampleRate, options = {}) {
  const threshold = options.threshold || 400
  let start = 0
  let end = pcm.length - 1
  while (start < end && Math.abs(pcm[start]) < threshold) start++
  while (end > start && Math.abs(pcm[end]) < threshold) end--
  const head = Math.round(((options.headMs ?? 5) * sampleRate) / 1000)
  const tail = Math.round(((options.tailMs ?? 40) * sampleRate) / 1000)
  const from = Math.max(0, start - head)
  const to = Math.min(pcm.length, end + 1 + tail)
  return pcm.slice(from, to)
}
