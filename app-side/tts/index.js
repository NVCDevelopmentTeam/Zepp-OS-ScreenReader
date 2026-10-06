import { synthesizeWav, isEngineReady } from './espeakSynth.js'
import { wavToMp3, joinWav, pcmToWav, parseWav, trimPcm } from './mp3Encoder.js'
import { encodeBase64 } from '../../lib/utils/base64.js'

/**
 * Text -> MP3 (base64) ready to send to the watch.
 * @param {string} text
 * @param {{ voice?: string, rate?: number, pitch?: number, volume?: number }} [options]
 * @returns {Promise<{ format: 'mp3', sampleRate: number, seconds: number, base64: string }>}
 */
export async function textToSpeechMp3(text, options = {}) {
  const wavs = await synthesizeWav(text, options)
  let wav = wavs[0]
  if (wavs.length > 1) {
    const joined = joinWav(wavs)
    wav = pcmToWav(joined.pcm, joined.sampleRate)
  }
  const { mp3, sampleRate, seconds } = wavToMp3(wav, { kbps: 32 })
  return { format: 'mp3', sampleRate, seconds, base64: encodeBase64(mp3) }
}

/**
 * One short unit (a word, letter or number) as a trimmed MP3 clip, for the
 * watch's offline voice. Silence is cut so clips join smoothly when the watch
 * plays several in a row.
 * @param {string} token
 * @param {{ voice?: string, rate?: number, pitch?: number, volume?: number }} [options]
 * @returns {Promise<string>} base64 MP3
 */
export async function textToSpeechClip(token, options = {}) {
  const [wav] = await synthesizeWav(token, options)
  const { pcm, sampleRate } = parseWav(wav)
  const trimmed = trimPcm(pcm, sampleRate)
  const { mp3 } = wavToMp3(pcmToWav(trimmed, sampleRate), { kbps: 24 })
  return encodeBase64(mp3)
}

export { isEngineReady }
