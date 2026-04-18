export const emojisMap = {
  // Faces
  '😊': 'Smiling face',
  '😂': 'Face with tears of joy',
  '🤣': 'Rolling on the floor laughing',
  '❤️': 'Red heart',
  '👍': 'Thumbs up',
  '😍': 'Smiling face with heart eyes',
  '😭': 'Loudly crying face',
  '🙏': 'Folded hands',
  '😘': 'Face blowing a kiss',
  '🥰': 'Smiling face with hearts',
  '🤔': 'Thinking face',
  '🤗': 'Hugging face',
  '🤩': 'Star struck',
  '🥳': 'Partying face',
  '😏': 'Smirking face',
  '🙄': 'Face with rolling eyes',
  '😬': 'Grimacing face',
  '😮': 'Face with open mouth',
  '😴': 'Sleeping face',
  '🤢': 'Nauseated face',
  '🥵': 'Hot face',
  '🥶': 'Cold face',

  // Symbols
  '🔥': 'Fire',
  '✅': 'Check mark',
  '❌': 'Cross mark',
  '⚠️': 'Warning',
  '🔔': 'Notification bell',
  '✨': 'Sparkles',
  '💯': 'Hundred points',
  '💪': 'Flexed biceps',
  '🎉': 'Party popper',
  '🚀': 'Rocket',
  '📍': 'Round pushpin',
  '📅': 'Calendar',
  '⏰': 'Alarm clock',
  '🔋': 'Battery',
  '📶': 'Antenna bars',
  '📡': 'Satellite antenna',
  '💡': 'Light bulb',
  '📱': 'Mobile phone',
  '💻': 'Laptop',
  '🔒': 'Locked',
  '🔓': 'Unlocked',

  // Gestures
  '👋': 'Waving hand',
  '👌': 'OK hand',
  '✌️': 'Victory hand',
  '👏': 'Clapping hands',
  '🙌': 'Raising hands',
  '🤝': 'Handshake',
  '👎': 'Thumbs down',
  '⌚': 'Watch',
  '❤️‍🔥': 'Heart on fire',
  '🌟': 'Star',
  '🌙': 'Moon',
  '☀️': 'Sun',
  '☁️': 'Cloud',
  '🌧️': 'Rain',
  '❄️': 'Snow',
  '💨': 'Wind',
  '🌈': 'Rainbow',
  '💧': 'Water drop',
  '⚡': 'Lightning',
  '⚽': 'Soccer ball',
  '🏀': 'Basketball',
  '🏃': 'Runner',
  '🚶': 'Walker',
  '🧘': 'Meditating',
  '🍎': 'Apple',
  '🍔': 'Hamburger',
  '🍕': 'Pizza',
  '🍺': 'Beer',
  '☕': 'Coffee'
}

export const symbolsMap = {
  '@': 'At',
  '#': 'Hash',
  $: 'Dollar sign',
  '%': 'Percent',
  '&': 'Ampersand',
  '*': 'Asterisk',
  '+': 'Plus',
  '-': 'Minus',
  '=': 'Equals',
  '/': 'Slash',
  '\\': 'Backslash',
  '|': 'Vertical bar',
  _: 'Underscore',
  '[': 'Left bracket',
  ']': 'Right bracket',
  '{': 'Left brace',
  '}': 'Right brace',
  '<': 'Less than',
  '>': 'Greater than',
  '?': 'Question mark',
  '!': 'Exclamation mark',
  ':': 'Colon',
  ';': 'Semicolon',
  '.': 'Dot',
  ',': 'Comma'
}

// Escape a string so it can be embedded in a RegExp literal safely.
function escapeForRegExp(str) {
  return str.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
}

// Sort keys so that longer sequences (e.g. emoji ZWJ combos, or variation
// selector forms) are tried before shorter, overlapping ones. Without this
// the alternation would match the shorter emoji first and leave orphaned
// combining codepoints like U+FE0F in the output.
function buildReplacer(map) {
  const keys = Object.keys(map).sort((a, b) => b.length - a.length)
  if (keys.length === 0) {
    return { pattern: null, map }
  }
  const pattern = new RegExp(keys.map(escapeForRegExp).join('|'), 'g')
  return { pattern, map }
}

const emojiReplacer = buildReplacer(emojisMap)
const symbolReplacer = buildReplacer(symbolsMap)

function applyReplacer({ pattern, map }, text) {
  if (!pattern) return text
  // Single pass replace preserves non-matching input and avoids the O(n*k)
  // cost of iterating the whole dictionary for every call. Wrap with commas
  // so TTS engines insert a small pause around the spoken description,
  // matching the previous (pre-refactor) pacing that a11y users rely on.
  return text.replace(pattern, (match) => `, ${map[match]}, `)
}

export function translateEmojis(text) {
  if (!text) return ''
  return applyReplacer(emojiReplacer, String(text))
}

export function translateSymbols(text) {
  if (!text) return ''
  return applyReplacer(symbolReplacer, String(text))
}
