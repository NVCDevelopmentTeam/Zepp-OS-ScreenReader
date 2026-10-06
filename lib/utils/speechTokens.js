/**
 * Splits text into the units ZSR's offline voice stores as separate clips.
 *
 *  - words (any script, diacritics kept), lower-cased
 *  - every CJK character on its own
 *  - numbers: 0-100 as one unit, larger numbers digit by digit
 *
 * Used both at build time (tools/generate_vocabulary.mjs, to decide which
 * clips to download) and on the watch (to decide whether a sentence can be
 * spoken offline), so the two can never disagree.
 */

const CJK = /([\u4e00-\u9fff])/g
// Everything that separates words: whitespace and punctuation.
const SEPARATORS = /[\s.,!?;:。，！？、；：()[\]{}"“”‘’<>|\\/@#$%^&*+=~`_\-–—…•·|]+/

/**
 * @param {string} text
 * @returns {string[]}
 */
export function tokenizeForSpeech(text) {
  const spaced = String(text || '')
    .replace(/\\n/g, ' ')
    .replace(CJK, ' $1 ')
    .toLowerCase()
  const tokens = []
  const parts = spaced.split(SEPARATORS)
  for (const part of parts) {
    if (!part) continue
    // Split "step12" / "3pm" style words into letters and digit runs.
    const pieces = part.match(/\d+|[^\d]+/g) || []
    for (const piece of pieces) {
      if (/^\d+$/.test(piece)) {
        const n = parseInt(piece, 10)
        if (piece.length <= 3 && n <= 100 && String(n) === piece.replace(/^0+(?=\d)/, '')) {
          tokens.push(String(n))
        } else {
          for (const digit of piece) tokens.push(digit)
        }
      } else {
        tokens.push(piece)
      }
    }
  }
  return tokens
}

/** Digits and letters every language pack includes (numbers, spelling). */
export function baseTokens() {
  const out = []
  for (let n = 0; n <= 100; n++) out.push(String(n))
  for (let c = 97; c <= 122; c++) out.push(String.fromCharCode(c))
  return out
}
