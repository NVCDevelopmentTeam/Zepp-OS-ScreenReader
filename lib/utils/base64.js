/**
 * Dependency-free base64 encoder/decoder for Uint8Array.
 * Side Service and Device App runtimes are not guaranteed to provide
 * `btoa`, `atob` or Node's `Buffer`, so the codec is implemented here.
 */
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

/**
 * @param {Uint8Array} bytes
 * @returns {string}
 */
export function encodeBase64(bytes) {
  let out = ''
  const len = bytes.length
  for (let i = 0; i < len; i += 3) {
    const b0 = bytes[i]
    const b1 = i + 1 < len ? bytes[i + 1] : 0
    const b2 = i + 2 < len ? bytes[i + 2] : 0
    out += ALPHABET[b0 >> 2]
    out += ALPHABET[((b0 & 3) << 4) | (b1 >> 4)]
    out += i + 1 < len ? ALPHABET[((b1 & 15) << 2) | (b2 >> 6)] : '='
    out += i + 2 < len ? ALPHABET[b2 & 63] : '='
  }
  return out
}

/**
 * @param {string} text
 * @returns {Uint8Array}
 */
export function decodeBase64(text) {
  const clean = String(text).replace(/[^A-Za-z0-9+/]/g, '')
  const outLen = Math.floor((clean.length * 3) / 4)
  const out = new Uint8Array(outLen)
  let o = 0
  for (let i = 0; i < clean.length; i += 4) {
    const c0 = ALPHABET.indexOf(clean[i])
    const c1 = ALPHABET.indexOf(clean[i + 1])
    const c2 = i + 2 < clean.length ? ALPHABET.indexOf(clean[i + 2]) : -1
    const c3 = i + 3 < clean.length ? ALPHABET.indexOf(clean[i + 3]) : -1
    if (o < outLen) out[o++] = (c0 << 2) | (c1 >> 4)
    if (c2 !== -1 && o < outLen) out[o++] = ((c1 & 15) << 4) | (c2 >> 2)
    if (c3 !== -1 && o < outLen) out[o++] = ((c2 & 3) << 6) | c3
  }
  return out
}
