/**
 * Every literal `gettext('...')` in the watch code must exist in all three language files.
 * The watch pages and library use page/i18n; each widget has its own i18n folder.
 */
import fs from 'fs'
import path from 'path'

const root = process.cwd()
const LANGUAGES = ['en-US', 'vi-VN', 'zh-CN']

/** @param {string} file @returns {Set<string>} */
function readKeys(file) {
  const text = fs.readFileSync(file, 'utf8')
  const keys = new Set()
  for (const match of text.matchAll(/^msgid "((?:[^"\\]|\\.)*)"$/gm)) keys.add(match[1])
  return keys
}

/** @param {string} dir @param {string[]} out */
function jsFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) jsFiles(full, out)
    else if (full.endsWith('.js')) out.push(full)
  }
  return out
}

/** @param {string[]} files @returns {Map<string, string>} key -> first file using it */
function usedKeys(files) {
  const used = new Map()
  const pattern = /gettext\(\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")\s*\)/g
  for (const file of files) {
    for (const match of fs.readFileSync(file, 'utf8').matchAll(pattern)) {
      const key = (match[1] !== undefined ? match[1] : match[2])
        .replace(/\\'/g, "'")
        .replace(/\\"/g, '"')
      if (!used.has(key)) used.set(key, path.relative(root, file))
    }
  }
  return used
}

const groups = [
  {
    name: 'watch (page/i18n)',
    i18n: 'page/i18n',
    files: [
      path.join(root, 'app.js'),
      ...jsFiles(path.join(root, 'lib')),
      ...jsFiles(path.join(root, 'page'))
    ]
  },
  { name: 'app-widget', i18n: 'app-widget/i18n', files: jsFiles(path.join(root, 'app-widget')) },
  {
    name: 'secondary-widget',
    i18n: 'secondary-widget/i18n',
    files: jsFiles(path.join(root, 'secondary-widget'))
  }
]

let failed = 0
for (const group of groups) {
  const used = usedKeys(group.files)
  for (const language of LANGUAGES) {
    const keys = readKeys(path.join(root, group.i18n, `${language}.po`))
    const missing = [...used.keys()].filter((key) => !keys.has(key))
    if (missing.length > 0) {
      failed += missing.length
      console.error(`${group.name} / ${language}: ${missing.length} missing`)
      missing.slice(0, 10).forEach((key) => console.error(`  "${key}" (${used.get(key)})`))
    }
  }
}
if (failed > 0) process.exit(1)
console.log('i18n check passed: every gettext key exists in en-US, vi-VN and zh-CN')
