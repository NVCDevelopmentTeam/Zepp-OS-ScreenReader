// Shared state for the simulated Zepp OS runtime.
export const S =
  globalThis.__ZS ||
  (globalThis.__ZS = {
    issues: [],
    logs: [],
    apiLevel: parseFloat(process.env.ZSR_API || '4.2'),
    fs: new Map(),
    widgets: [],
    timers: new Set(),
    keyHandlers: [],
    gestureHandlers: [],
    route: [],
    spoken: [],
    vibrations: 0
  })
export function issue(kind, msg) {
  const where = (
    new Error().stack
      .split('\n')
      .slice(3, 6)
      .find((l) => l.includes(process.cwd()) && !l.includes('node_modules')) || ''
  )
    .trim()
    .replace('file://' + process.cwd() + '/', '')
    .replace(/^at /, '')
  const key = kind + '|' + msg + '|' + where
  if (!S.issues.some((i) => i.key === key)) S.issues.push({ key, kind, msg, where })
}
