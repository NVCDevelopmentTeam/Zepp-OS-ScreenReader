/**
 * Every sensor class the watch code uses needs its permission, or the platform refuses it at run
 * time (an error that only shows on a device). The permission codes come from the `@permissionCode`
 * tags of the official typings. Checked in two places: app.json "permissions" (what is declared)
 * and the list requested at run time in app.js.
 */
import fs from 'fs'
import path from 'path'

const root = process.cwd()
const typings = fs
  .readFileSync(path.join(root, 'node_modules/@zeppos/device-types/dist/index.d.ts'), 'utf8')
  .split('\n')

/** @type {Map<string, Set<string>>} sensor class -> permission codes */
const needs = new Map()
let inSensor = false
/** @type {string[]} permission codes found in the doc comment that is being read */
let pending = []
for (const line of typings) {
  if (/^declare module '@zos\/sensor' \{/.test(line)) inSensor = true
  else if (inSensor && /^\}/.test(line)) inSensor = false
  if (!inSensor) continue
  // A class's own doc comment is indented by 3 spaces; method docs are indented deeper
  if (/^ {2}\/\*\*/.test(line)) pending = []
  const permission = line.match(/^ {3}\* @permissionCode\s+(\S+)/)
  if (permission) pending.push(permission[1])
  const cls = line.match(/^ {2}class ([A-Za-z]+)\b/)
  if (cls) {
    if (pending.length > 0) needs.set(cls[1], new Set(pending))
    pending = []
  }
}

/** @param {string} dir @param {string[]} out */
function sources(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) sources(full, out)
    else if (full.endsWith('.js')) out.push(full)
  }
  return out
}
const files = [
  path.join(root, 'app.js'),
  ...['lib', 'page'].flatMap((d) => sources(path.join(root, d)))
]
const used = new Map()
for (const file of files) {
  const text = fs.readFileSync(file, 'utf8')
  for (const name of needs.keys()) {
    if (
      new RegExp(
        `\\b(?:new\\s+${name}\\b|sensors\\.${name}\\b|\\{[^}]*\\b${name}\\b[^}]*\\}\\s*from\\s*'@zos/sensor')`
      ).test(text)
    ) {
      if (!used.has(name)) used.set(name, path.relative(root, file))
    }
  }
}

const declared = new Set(
  JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8')).permissions
)
const runtimeList = fs.readFileSync(path.join(root, 'app.js'), 'utf8')
const problems = []
for (const [name, file] of used) {
  for (const code of needs.get(name)) {
    if (!declared.has(code))
      problems.push(`${name} (${file}) needs ${code}, missing from app.json permissions`)
    if (!runtimeList.includes(`'${code}'`))
      problems.push(
        `${name} (${file}) needs ${code}, missing from the permissions requested in app.js`
      )
  }
}
if (problems.length > 0) {
  console.error('Permission check failed:\n  ' + problems.join('\n  '))
  process.exit(1)
}
console.log(`Permission check passed (${used.size} sensors in use: ${[...used.keys()].join(', ')})`)
