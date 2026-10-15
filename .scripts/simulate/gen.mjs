/**
 * Prepares the simulator from the OFFICIAL @zeppos/device-types typings and writes
 * .generated/{zos-api.json, ui-consts.json, mods/*.mjs}. Run by `npm run simulate`.
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const here = path.dirname(fileURLToPath(import.meta.url))
const out = path.join(here, '.generated')
const dts = fs.readFileSync(
  path.join(process.cwd(), 'node_modules/@zeppos/device-types/dist/index.d.ts'),
  'utf8'
)
fs.rmSync(out, { recursive: true, force: true })
fs.mkdirSync(path.join(out, 'mods'), { recursive: true })

const modules = {}
let current = null
let depth = 0
let inComment = false
for (const raw of dts.split('\n')) {
  const open = raw.match(/^declare module '([^']+)' \{/)
  if (open && depth === 0) {
    current = open[1]
    modules[current] = new Set()
    depth = 1
    continue
  }
  if (!current) continue
  let line = raw
  if (inComment) {
    if (!line.includes('*/')) continue
    inComment = false
    line = line.slice(line.indexOf('*/') + 2)
  }
  if (line.includes('/*')) {
    const i = line.indexOf('/*')
    if (line.includes('*/', i)) line = line.slice(0, i) + line.slice(line.indexOf('*/', i) + 2)
    else {
      inComment = true
      line = line.slice(0, i)
    }
  }
  line = line.replace(/\/\/.*$/, '')
  if (depth === 1) {
    const d = line.match(
      /^\s{0,4}(?:export\s+)?(?:declare\s+)?(function|const|let|var|class|enum|namespace)\s+([A-Za-z0-9_$]+)/
    )
    if (d) modules[current].add(d[2])
  }
  for (const ch of line) {
    if (ch === '{') depth++
    else if (ch === '}') {
      depth--
      if (depth === 0) current = null
    }
  }
}
const api = Object.fromEntries(
  Object.entries(modules).map(([k, v]) => [k, { values: [...v].sort() }])
)
fs.writeFileSync(path.join(out, 'zos-api.json'), JSON.stringify(api))

function members(name) {
  const found = new Set()
  const re = new RegExp(`(?:interface|type)\\s+${name}\\b[^{=]*[={]`, 'g')
  let m
  while ((m = re.exec(dts))) {
    const start = dts.indexOf('{', m.index + m[0].length - 1)
    let d = 0
    let j = start
    for (; j < dts.length; j++) {
      if (dts[j] === '{') d++
      else if (dts[j] === '}' && --d === 0) break
    }
    for (const mm of dts
      .slice(start, j)
      .matchAll(/^\s{0,24}(?:readonly\s+)?([A-Za-z_][A-Za-z0-9_]*)\??\s*:/gm))
      found.add(mm[1])
  }
  return found
}
const consts = {
  widget: [...new Set([...members('PublicWidgetType'), ...members('IHmUIWidgetType')])],
  align: [...members('IHmUIAlign')],
  prop: [...new Set([...members('PublicPropType'), ...members('IHmUIPropertyType')])],
  text_style: [...members('IHmUIWrapTextStyle')],
  event: [...members('IHmUIEventType')]
}
fs.writeFileSync(path.join(out, 'ui-consts.json'), JSON.stringify(consts))

for (const name of [...Object.keys(api), '@zos/media']) {
  const extra = name === '@zos/ui' ? ['deleteWidget', 'getTextLayout'] : []
  const names = name === '@zos/media' ? ['create', 'id'] : [...api[name].values, ...extra]
  const call = name === '@zos/media' ? 'buildMedia()' : `build(${JSON.stringify(name)})`
  const source =
    `import { build, buildMedia } from '../../mods.mjs'\nconst m = ${call}\n` +
    names.map((n) => `export const ${n} = m[${JSON.stringify(n)}]`).join('\n') +
    '\n'
  fs.writeFileSync(path.join(out, 'mods', name.replace('@zos/', 'zos-') + '.mjs'), source)
}
console.log('simulator prepared: ' + Object.keys(api).length + ' modules')
