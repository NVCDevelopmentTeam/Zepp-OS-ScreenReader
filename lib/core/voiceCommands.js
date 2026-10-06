/**
 * Voice command grammar for ZSR (English, Vietnamese, Chinese).
 *
 * Pure functions with no Zepp dependencies, so the grammar is unit-tested in
 * Node (tests/voice-commands.test.mjs). The recognised sentence comes from the
 * online speech-to-text service; this module only decides what it means.
 */

/** Lower-case, strip diacritics (Vietnamese) and punctuation. */
export function normalize(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[.,!?;:。，！？、]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Phrase table. Order matters: more specific intents come first.
 * Vietnamese phrases are written WITHOUT diacritics (input is normalised).
 */
const GRAMMAR = [
  {
    intent: 'turnOff',
    phrases: [
      'turn off',
      'disable screen reader',
      'tat trinh doc',
      'tat zsr',
      'tat doc man hinh',
      '关闭朗读',
      '关闭屏幕朗读'
    ]
  },
  {
    intent: 'mute',
    phrases: ['silent mode', 'mute', 'tat tieng', 'im lang', '静音']
  },
  {
    intent: 'openMenu',
    phrases: [
      'open menu',
      'zsr menu',
      'context menu',
      'mo menu',
      'mo thuc don',
      'mo trinh don',
      '打开菜单'
    ]
  },
  {
    intent: 'openSettings',
    phrases: [
      'open settings',
      'go to settings',
      'settings',
      'mo cai dat',
      'vao cai dat',
      '打开设置'
    ]
  },
  {
    intent: 'readScreen',
    phrases: [
      'read screen',
      'what is on',
      'doc man hinh',
      'tren man hinh co gi',
      '读屏幕',
      '读取屏幕'
    ]
  },
  {
    intent: 'next',
    phrases: [
      'next item',
      'go forward',
      'next',
      'muc tiep theo',
      'tiep theo',
      'ke tiep',
      '下一项',
      '下一个'
    ]
  },
  {
    intent: 'previous',
    phrases: [
      'previous item',
      'go back',
      'previous',
      'muc truoc',
      'quay lai',
      'truoc do',
      '上一项',
      '上一个'
    ]
  },
  {
    intent: 'activate',
    phrases: ['activate', 'select', 'press', 'click', 'chon', 'nhan', 'mo muc', '选择', '点击']
  },
  {
    intent: 'heartRate',
    phrases: ['heart rate', 'pulse', 'nhip tim', '心率']
  },
  {
    intent: 'steps',
    phrases: ['steps', 'step count', 'so buoc', 'buoc chan', '步数']
  },
  {
    intent: 'time',
    phrases: [
      'what time',
      'time',
      'may gio',
      'gio hien tai',
      'bay gio la may gio',
      '几点',
      '现在时间'
    ]
  },
  {
    intent: 'battery',
    phrases: ['battery', 'pin', 'dung luong pin', '电量']
  },
  {
    intent: 'notifications',
    phrases: ['notifications', 'notification', 'thong bao', '通知']
  },
  {
    intent: 'curtain',
    phrases: ['screen curtain', 'curtain', 'man hinh che', 'tat man hinh', '屏幕遮蔽']
  }
]

/**
 * @param {string} text recognised speech
 * @returns {string | null} intent id, or null when nothing matches
 */
export function parseVoiceCommand(text) {
  const raw = String(text || '')
  const norm = normalize(raw)
  if (!norm) return null
  for (const entry of GRAMMAR) {
    for (const phrase of entry.phrases) {
      const isCjk = /[\u4e00-\u9fff]/.test(phrase)
      if (isCjk) {
        if (raw.includes(phrase)) return entry.intent
      } else if (` ${norm} `.includes(` ${phrase} `)) {
        return entry.intent
      }
    }
  }
  return null
}

// "find <text>" style commands carry an argument (what to look for).
const FIND_PREFIXES = ['search for', 'find', 'search', 'tim kiem', 'tim']
const FIND_PREFIXES_CJK = ['查找', '搜索', '寻找']

/**
 * Like parseVoiceCommand, but also returns the argument of commands that take
 * one ("find weather" -> { intent: 'find', arg: 'weather' }).
 * @param {string} text recognised speech
 * @returns {{ intent: string | null, arg: string }}
 */
export function parseVoiceCommandFull(text) {
  const raw = String(text || '')
  const norm = normalize(raw)
  for (const prefix of FIND_PREFIXES) {
    if (norm.startsWith(prefix + ' ')) {
      const arg = norm.slice(prefix.length + 1).trim()
      if (arg) return { intent: 'find', arg }
    }
  }
  for (const prefix of FIND_PREFIXES_CJK) {
    const at = raw.indexOf(prefix)
    if (at !== -1) {
      const arg = raw.slice(at + prefix.length).trim()
      if (arg) return { intent: 'find', arg }
    }
  }
  return { intent: parseVoiceCommand(text), arg: '' }
}
