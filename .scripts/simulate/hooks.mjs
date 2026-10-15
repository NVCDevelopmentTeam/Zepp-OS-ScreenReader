import path from 'path'
import { fileURLToPath, pathToFileURL } from 'url'
const here = path.dirname(fileURLToPath(import.meta.url))
const projectUrl = pathToFileURL(process.cwd()).href + '/'
const hereUrl = pathToFileURL(here).href + '/'
const api = parseFloat(process.env.ZSR_API || '4.2')
const MIN = { '@zos/media': 3.0, '@zos/transfer-file': 3.0 }
export async function resolve(specifier, context, next) {
  // Only the project's own sources are held to device rules; the simulator itself
  // and third-party packages may use Node built-ins.
  const parent = context.parentURL
  const inProject =
    !parent ||
    (parent.startsWith(projectUrl) &&
      !parent.startsWith(hereUrl) &&
      !parent.includes('/node_modules/'))
  if (!inProject && !specifier.startsWith('@zos/')) return next(specifier, context)
  if (specifier.startsWith('@zos/')) {
    if (MIN[specifier] && api < MIN[specifier]) {
      const e = new Error(
        `Cannot find module '${specifier}' (needs API_LEVEL ${MIN[specifier]}, device has ${api})`
      )
      e.code = 'ERR_MODULE_NOT_FOUND'
      throw e
    }
    const file = path.join(here, '.generated', 'mods', specifier.replace('@zos/', 'zos-') + '.mjs')
    return { url: pathToFileURL(file).href, shortCircuit: true }
  }
  if (
    specifier.startsWith('@zeppos/') ||
    (!specifier.startsWith('.') &&
      !specifier.startsWith('/') &&
      !specifier.startsWith('file:') &&
      !specifier.startsWith('node:'))
  ) {
    const e = new Error(`Cannot find module '${specifier}' (not available on device)`)
    e.code = 'ERR_MODULE_NOT_FOUND'
    throw e
  }
  try {
    return await next(specifier, context)
  } catch (err) {
    // The Zepp bundler resolves extension-less relative imports; Node does not.
    if (specifier.startsWith('.') && err.code === 'ERR_MODULE_NOT_FOUND') {
      for (const suffix of ['.js', '/index.js']) {
        try {
          return await next(specifier + suffix, context)
        } catch (_e) {
          /* try next */
        }
      }
    }
    throw err
  }
}
