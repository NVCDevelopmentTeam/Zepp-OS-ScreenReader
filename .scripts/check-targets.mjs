/**
 * The supported watches are the device folders in assets/ (every folder except audio and raw).
 * Checks that app.json and assets/ agree, so no watch ships without images or without a target:
 *  - each device folder has a target in app.json, and each target has a folder with icon.png;
 *  - designWidth equals the width in the folder name (for example 480x480-... -> 480);
 *  - every page, widget, side service and settings entry the targets list exists as a file;
 *  - all targets list the same pages (a page missing for one watch would be unreachable there).
 */
import fs from 'fs'
import path from 'path'

const root = process.cwd()
const app = JSON.parse(fs.readFileSync(path.join(root, 'app.json'), 'utf8'))
const NOT_DEVICES = new Set(['audio', 'raw'])
const folders = fs
  .readdirSync(path.join(root, 'assets'), { withFileTypes: true })
  .filter((entry) => entry.isDirectory() && !NOT_DEVICES.has(entry.name))
  .map((entry) => entry.name)
const targets = Object.keys(app.targets)
const problems = []

for (const folder of folders) {
  if (!targets.includes(folder)) problems.push(`assets/${folder} has no target in app.json`)
  else if (!fs.existsSync(path.join(root, 'assets', folder, 'icon.png')))
    problems.push(`assets/${folder}/icon.png is missing`)
}
for (const target of targets) {
  if (!folders.includes(target)) problems.push(`target ${target} has no folder in assets/`)
  const width = /^(\d+)x\d+-/.exec(target)
  const designWidth = app.targets[target].designWidth
  if (!width) problems.push(`target ${target}: name does not start with <width>x<height>-`)
  else if (Number(width[1]) !== designWidth)
    problems.push(`target ${target}: designWidth ${designWidth} does not match the name`)
}

const baseline = JSON.stringify([...app.targets[targets[0]].module.page.pages].sort())
for (const target of targets) {
  const module = app.targets[target].module
  const files = [
    ...module.page.pages,
    module['app-side'].path,
    module.setting.path,
    ...module['app-widget'].widgets.map((w) => w.path),
    ...module['secondary-widget'].widgets.map((w) => w.path)
  ]
  for (const file of files) {
    if (!fs.existsSync(path.join(root, `${file}.js`)))
      problems.push(`${target}: ${file}.js does not exist`)
  }
  if (JSON.stringify([...module.page.pages].sort()) !== baseline)
    problems.push(`${target}: page list differs from ${targets[0]}`)
}

if (problems.length > 0) {
  console.error('Target check failed:\n  ' + problems.join('\n  '))
  process.exit(1)
}
console.log(
  `Target check passed: ${folders.length} devices, ${app.targets[targets[0]].module.page.pages.length} pages each`
)
