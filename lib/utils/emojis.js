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

export function translateEmojis(text) {
  if (!text) return ''
  let result = text
  const keys = Object.keys(emojisMap)
  for (let i = 0; i < keys.length; i++) {
    const emoji = keys[i]
    const translation = emojisMap[emoji]
    result = result.replace(new RegExp(emoji, 'g'), `, ${translation}, `)
  }
  return result
}

export function translateSymbols(text) {
  if (!text) return ''
  let result = text
  const keys = Object.keys(symbolsMap)
  for (let i = 0; i < keys.length; i++) {
    const symbol = keys[i]
    const translation = symbolsMap[symbol]
    const escapedSymbol = symbol.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')
    result = result.replace(new RegExp(escapedSymbol, 'g'), `, ${translation}, `)
  }
  return result
}
