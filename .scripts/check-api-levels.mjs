/**
 * Fails when device code statically imports a @zos/* name that needs a newer API level than
 * app.json promises (runtime.apiVersion.minVersion).
 *
 * Why: importing a name that does not exist on a watch stops the whole module from loading,
 * so the app does not start at all on older Zepp OS versions. Names from newer levels must be
 * reached at run time instead (namespace import, or dynamic import() inside try/catch).
 * Levels come from the `@version` tags in the official @zeppos/device-types typings; names
 * without a tag are assumed to be available from the minimum level.
 */
import fs from 'fs'
import path from 'path'
import * as acorn from 'acorn'

const root = process.cwd()
const minVersion = parseFloat(
  JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8')).runtime.apiVersion.minVersion
)
const typings = fs
  .readFileSync(path.join(root, 'node_modules/@zeppos/device-types/dist/index.d.ts'), 'utf8')
  .split('\n')

/** @type {Record<string, string | null>} */
const levels = {}
let module = null
let depth = 0
let block = null
let pending = null
for (const line of typings) {
  const open = line.match(/^declare module '([^']+)' \{/)
  if (open && depth === 0) {
    module = open[1]
    depth = 1
    block = null
    pending = null
    continue
  }
  if (!module) continue
  if (depth === 1) {
    if (/^\s{0,4}\/\*\*/.test(line)) block = { version: null }
    if (block) {
      const tag = line.match(/@version\s+([0-9.]+)/)
      if (tag) block.version = tag[1]
      if (line.includes('*/')) {
        pending = block.version
        block = null
      }
      continue
    }
    const decl = line.match(
      /^\s{0,4}(?:export\s+)?(?:declare\s+)?(?:function|const|let|var|class|enum|namespace)\s+([A-Za-z0-9_$]+)/
    )
    if (decl) {
      levels[`${module}:${decl[1]}`] = pending
      pending = null
    } else if (line.trim() && !line.trim().startsWith('@')) pending = null
  }
  for (const ch of line.replace(/\/\/.*$/, '')) {
    if (ch === '{') depth++
    else if (ch === '}' && --depth === 0) module = null
  }
}

const skipDirs = new Set([
  'node_modules',
  '.git',
  'assets',
  '.scripts',
  'app-side',
  'setting',
  'server',
  'site'
])
/** @param {string} dir @returns {string[]} */
function sources(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (skipDirs.has(entry.name)) return []
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) return sources(full)
    return full.endsWith('.js') ? [full] : []
  })
}

const problems = []
for (const file of sources(root)) {
  const ast = acorn.parse(fs.readFileSync(file, 'utf8'), {
    ecmaVersion: 'latest',
    sourceType: 'module'
  })
  for (const node of ast.body) {
    if (node.type !== 'ImportDeclaration' || !String(node.source.value).startsWith('@zos/'))
      continue
    for (const spec of node.specifiers) {
      if (spec.type !== 'ImportSpecifier') continue
      const level = levels[`${node.source.value}:${spec.imported.name}`]
      if (level && parseFloat(level) > minVersion) {
        problems.push(
          `${path.relative(root, file)}: ${spec.imported.name} from ${node.source.value} needs API ${level} (minimum is ${minVersion})`
        )
      }
    }
  }
}
if (problems.length > 0) {
  console.error('Static imports newer than the minimum API level:\n  ' + problems.join('\n  '))
  process.exit(1)
}
console.log(
  `API level check passed (minimum ${minVersion}, ${Object.values(levels).filter(Boolean).length} tagged names)`
)
