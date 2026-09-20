import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const rootDir = path.resolve(__dirname, '..')
const require = createRequire(import.meta.url)

const siteDir = path.join(rootDir, 'site')
const hiddenSiteDir = path.join(rootDir, '.site')
const preloadScript = path.join(__dirname, 'preload.cjs').replace(/\\/g, '/')

// Restore site directory if it was left renamed as .site by a previous interrupted run
if (fs.existsSync(hiddenSiteDir) && !fs.existsSync(siteDir)) {
  try {
    fs.renameSync(hiddenSiteDir, siteDir)
  } catch (err) {
    console.warn('Warning: Could not restore site directory:', err.message)
  }
}

function resolveZeusBin() {
  const possiblePaths = [rootDir]
  if (process.env.APPDATA) {
    possiblePaths.push(path.join(process.env.APPDATA, 'npm', 'node_modules'))
    possiblePaths.push(path.join(process.env.APPDATA, 'npm'))
  }
  if (process.env.PREFIX) {
    possiblePaths.push(path.join(process.env.PREFIX, 'lib', 'node_modules'))
    possiblePaths.push(path.join(process.env.PREFIX, 'node_modules'))
  }
  try {
    return require.resolve('@zeppos/zeus-cli/bin/main.js', { paths: possiblePaths })
  } catch {
    return null
  }
}

const cmd = process.argv[2] || 'build'
const extraArgs = process.argv.slice(3)

const zeusBin = resolveZeusBin()
let child

const nodeOptions = [process.env.NODE_OPTIONS || '', `-r "${preloadScript}"`]
  .filter(Boolean)
  .join(' ')
const env = {
  ...process.env,
  NODE_OPTIONS: nodeOptions
}

if (zeusBin) {
  child = spawn(process.execPath, ['-r', preloadScript, zeusBin, cmd, ...extraArgs], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: false,
    env
  })
} else {
  const isWindows = process.platform === 'win32'
  const npxCmd = isWindows ? 'npx.cmd' : 'npx'
  child = spawn(npxCmd, ['zeus', cmd, ...extraArgs], {
    cwd: rootDir,
    stdio: 'inherit',
    shell: isWindows,
    env
  })
}

child.on('close', (code) => {
  process.exit(code ?? 0)
})

child.on('error', (err) => {
  console.error('Failed to start zeus process:', err)
  process.exit(1)
})
