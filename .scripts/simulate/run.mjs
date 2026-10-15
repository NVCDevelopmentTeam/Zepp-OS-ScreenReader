// Simulates the device: loads app.js, runs its lifecycle, then builds every page.
import fs from 'fs'
import { pathToFileURL } from 'url'
import { S, issue } from './state.mjs'
const root = process.cwd()
const captured = { app: null, pages: [], widgets: [] }
const realLog = console.log.bind(console)
const consoleHits = []
for (const k of ['log', 'warn', 'error', 'info', 'debug'])
  console[k] = (...a) => {
    consoleHits.push([k, a.map(String).join(' ').slice(0, 160)])
  }
globalThis.App = (o) => {
  captured.app = o
}
globalThis.Page = (o) => {
  captured.pages.push(o)
}
globalThis.getApp = () => ({
  _options: captured.app || { globalData: {} },
  globalData: (captured.app && captured.app.globalData) || {}
})
globalThis.AppWidget = (o) => captured.widgets.push(o)
globalThis.SecondaryWidget = (o) => captured.widgets.push(o)
globalThis.getCurrentPage = () => ({})
globalThis.DeviceRuntimeCore = {}
globalThis.__ZEPPOS__ = true
globalThis.messaging = undefined
process.on('unhandledRejection', (e) =>
  issue(
    'UNHANDLED_REJECTION',
    String((e && e.stack) || e)
      .split('\n')
      .slice(0, 3)
      .join(' | ')
  )
)
process.on('uncaughtException', (e) =>
  issue(
    'UNCAUGHT',
    String((e && e.stack) || e)
      .split('\n')
      .slice(0, 3)
      .join(' | ')
  )
)
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
async function step(name, fn) {
  try {
    await fn()
  } catch (e) {
    issue(
      'THROWN',
      `${name}: ${String((e && e.stack) || e)
        .split('\n')
        .slice(0, 4)
        .join(' | ')}`
    )
  }
}

const appJson = JSON.parse(fs.readFileSync(root + '/app.json', 'utf8'))
const pages = Object.values(appJson.targets)[0].module.page.pages
await step('import app.js', async () => {
  await import(pathToFileURL(root + '/app.js').href + '?' + Date.now())
})
if (captured.app) {
  await step('app.onCreate', async () => {
    ;(await captured.app.onCreate) && captured.app.onCreate.call(captured.app, {})
  })
  await sleep(300)
}
for (const p of pages) {
  const before = captured.pages.length
  await step('import ' + p, async () => {
    await import(pathToFileURL(root + '/' + p + '.js').href + '?' + Math.random())
  })
  const opts = captured.pages[captured.pages.length - 1]
  if (!opts || captured.pages.length === before) {
    issue('NO_PAGE_REGISTERED', p + ' did not call Page()')
    continue
  }
  const inst = Object.create(opts)
  inst.state = {}
  inst.setState = () => {}
  S.widgets.length = 0
  await step(p + ' onInit', async () => {
    opts.onInit && (await opts.onInit.call(inst, JSON.stringify({ initialized: true })))
  })
  await step(p + ' build', async () => {
    opts.build && (await opts.build.call(inst))
  })
  await sleep(50)
  captured.last = { p, n: S.widgets.length }
  if (process.env.VERBOSE) realLog(p, 'widgets:', S.widgets.length)
  await step(p + ' onDestroy', async () => {
    opts.onDestroy && (await opts.onDestroy.call(inst))
  })
}
// --- extensions wired into the reader: exercise every entry point once
const checks = []
const check = (name, ok) => checks.push([name, ok])
const zsr = globalThis.ZSR
check(
  'ZSR interface and registry are exposed as globalThis.ZSR',
  !!(zsr && zsr.extensions && zsr.core && zsr.Touch && zsr.Activation && zsr.Peripherals)
)
check('no variable named after another screen reader', typeof globalThis.NVDA === 'undefined')
const nav = globalThis.NavigationManagerInstance
const reader = globalThis.ScreenReaderInstance
const ui = await import('@zos/ui')
const ui_consts = ui
if (nav && zsr) {
  await step('QR description', async () => {
    const el = { getProperty: () => undefined }
    const options = { x: 0, y: 0, w: 10, h: 10, content: 'https://example.com/a?b=1' }
    check(
      'QR code is described, not read as raw data',
      nav.getElementText(el, ui.widget.QRCODE, options).includes('example.com')
    )
  })
  await step('custom label', async () => {
    const el = { getProperty: () => 'Original' }
    const options = { x: 1, y: 2, w: 10, h: 10, text: 'Original' }
    const key = String(ui.widget.TEXT) + ':Original'
    zsr.extensions.CustomLabelManager.addLabel(key, 'My label')
    check(
      'custom label replaces the app text',
      nav.getElementText(el, ui.widget.TEXT, options) === 'My label'
    )
    zsr.extensions.CustomLabelManager.removeLabel(key)
    check(
      'custom label can be removed',
      nav.getElementText(el, ui.widget.TEXT, options) === 'Original'
    )
  })
  await step('captcha', async () => {
    const r = zsr.extensions.readCaptcha('aB7!')
    check('captcha is spelled per character', r.success && r.text.split(', ').length === 4)
  })
}
// Stand-in for the phone's Side Service so requests are answered instead of waiting.
if (captured.app && captured.app.globalData && captured.app.globalData.messageBuilder) {
  captured.app.globalData.messageBuilder.request = async () => ({
    result: 'OK',
    text: 'A table with a cup'
  })
}
const menu = globalThis.ContextMenuInstance
if (menu) {
  for (const m of [
    'describeScene',
    'readCaptchaAloud',
    'editCustomLabel',
    'toggleGamerMode',
    'cycleBrightness',
    'toggleSpeech',
    'toggleSpeech'
  ]) {
    await step('menu.' + m, async () => {
      await menu[m]()
    })
  }
  const gamer = zsr && zsr.extensions.GamerMode
  if (gamer) {
    check('gamer mode switched by the menu', gamer.gamerMode.isEnabled === true)
    await menu.toggleGamerMode()
    check('gamer mode switched off again', gamer.gamerMode.isEnabled === false)
  }
}
if (reader) check('speech is on after the menu toggled it twice', reader.isMuted() === false)
// --- activation, touch exploration, accessibility button, navigation
if (nav && reader && zsr) {
  const inter = await import('@zos/interaction')
  const spoken = []
  const originalSpeak = reader.speak.bind(reader)
  reader.speak = (text, options) => {
    spoken.push(String(text))
    return originalSpeak(text, options)
  }
  const wait = (ms) => new Promise((r) => setTimeout(r, ms))
  const config = globalThis.ScreenReaderConfig
  const confirmSetting = config.confirmBeforeDisable
  check('crown triple press is on by default', config.accessibilityShortcut === 'triple_click_home')
  check('accessibility button is on by default', config.accessibilityButton !== false)
  check('activation gesture is on by default', config.activationGesture === 'zigzag')

  // Turning ZSR off normally asks for confirmation; switch that off so the toggle is visible.
  config.confirmBeforeDisable = false
  reader.enabled || (await reader.toggleEnabled(true))

  await step('crown', async () => {
    const keys = S.keyHandlers[S.keyHandlers.length - 1]
    const press = () => keys.callback(inter.KEY_HOME, inter.KEY_EVENT_CLICK)
    const before = reader.enabled
    const homesBefore = S.route.filter((r) => r[0] === 'home').length
    const a = press()
    await wait(800)
    check(
      'one crown press is held, then passed on as Home',
      a === true &&
        S.route.filter((r) => r[0] === 'home').length === homesBefore + 1 &&
        reader.enabled === before
    )
    press()
    press()
    const third = press()
    await wait(50)
    check(
      'three quick crown presses turn ZSR off',
      before === true && third === true && reader.enabled === false
    )
    press()
    press()
    press()
    await wait(50)
    check('three more presses turn it back on', reader.enabled === true)
  })

  await step('gesture', async () => {
    const swipes = S.gestureHandlers[S.gestureHandlers.length - 1]
    const before = reader.enabled
    swipes.callback(inter.GESTURE_UP)
    await wait(300)
    swipes.callback(inter.GESTURE_DOWN)
    await wait(300)
    swipes.callback(inter.GESTURE_UP)
    await wait(50)
    check('swipe up, down, up turns ZSR off', before === true && reader.enabled === false)
    await wait(400)
    swipes.callback(inter.GESTURE_UP)
    await wait(300)
    swipes.callback(inter.GESTURE_DOWN)
    await wait(300)
    swipes.callback(inter.GESTURE_UP)
    await wait(50)
    check('and turns it back on', reader.enabled === true)
    await wait(400)
    swipes.callback(inter.GESTURE_UP)
    await wait(2300)
    swipes.callback(inter.GESTURE_DOWN)
    swipes.callback(inter.GESTURE_UP)
    await wait(50)
    check('a too slow pattern does nothing', reader.enabled === true)
  })

  await step('touch exploration and button', async () => {
    const ui = globalThis.ScreenReaderUIInstance
    ui.detach()
    nav.clearElements()
    ui.attach()
    const layer = ui.interactionLayer
    const visible = () => layer.getProperty(ui_prop.VISIBLE)
    const ui_prop = ui_consts.prop
    reader.enabled || reader.toggleEnabled(true)
    ui.setEnabled(true)
    check('touch layer is active while exploration is on', visible() === true)
    zsr.Touch.setEnabled(false)
    check(
      'touch layer steps aside when exploration is off',
      visible() === false && config.exploreMode === false
    )
    zsr.Touch.toggle(false)
    check('touch exploration toggles back on', visible() === true && zsr.Touch.isEnabled())

    const b = ui.accessButton
    check('accessibility button exists', !!b)
    if (b) {
      const info = { w: 480, h: 480 }
      const size = b.__props.w
      const cx = b.__props.x + size / 2
      const cy = b.__props.y + size / 2
      const R = info.w / 2
      const farthest = Math.hypot(cx - R, cy - R) + size / 2
      check('button lies inside the round screen, bottom right', farthest <= R && cx > R && cy > R)
      check('button is large enough to find (>= 48 px)', size >= 48)
      check(
        'button is reachable in the navigation order',
        nav.elements.some(
          (e) => e.options && e.options.accessibility_label === 'ZSR accessibility button'
        )
      )
    }
  })

  await step('ocr and qr guidance', async () => {
    const requests = []
    const mb = captured.app.globalData.messageBuilder
    const previousRequest = mb.request
    mb.request = async (message) => {
      requests.push(message)
      return message.method === 'OCR_IMAGE'
        ? { result: 'OK', text: 'Exit sign' }
        : { result: 'OK', text: '' }
    }
    const OCR = zsr.extensions.OCR
    const read = await new OCR().readImageText('image/sample.png')
    const sent = requests.find((r) => r.method === 'OCR_IMAGE')
    check(
      'OCR sends the fields the phone expects (image, language, mime)',
      !!sent &&
        typeof sent.params.image === 'string' &&
        'language' in sent.params &&
        sent.params.mime === 'image/png'
    )
    check('OCR returns the recognised text', read.ok && read.text === 'Exit sign')
    const missing = await new OCR().readImageText('image/missing.png')
    check(
      'an unreadable picture is reported, not guessed',
      missing.ok === false && missing.code === 'NO_IMAGE_SOURCE'
    )
    check(
      'QR support is available',
      typeof zsr.extensions.QRCode === 'object' &&
        typeof zsr.extensions.prepareQrScan === 'function'
    )
    mb.request = previousRequest
    const menu = globalThis.ContextMenuInstance
    if (menu) {
      spoken.length = 0
      await menu.helpScanQr()
      check(
        'QR scan help speaks the instructions',
        spoken.some((t) => t.includes('20'))
      )
    }
  })

  await step('navigation', async () => {
    if (!reader.enabled) await reader.toggleEnabled(true)
    nav.clearElements()
    const texts = ['Alpha', 'Bravo', 'Charlie', 'Delta']
    texts.forEach((text, i) => {
      const el = { getProperty: (p) => (p === ui.prop.TEXT ? text : undefined) }
      nav.registerElement(el, ui.widget.BUTTON, { x: 20, y: 40 + i * 60, w: 200, h: 50, text })
    })
    spoken.length = 0
    await nav.navigate('next')
    await nav.navigate('next')
    await nav.navigate('next')
    const order = texts.filter((t) => spoken.some((s) => s.includes(t)))
    check(
      'swipe next reads the elements top to bottom',
      order.length >= 3 &&
        spoken.findIndex((s) => s.includes('Alpha')) < spoken.findIndex((s) => s.includes('Bravo'))
    )
    await nav.navigate('previous')
    check(
      'swipe previous goes back one element',
      spoken[spoken.length - 1].includes('Bravo') ||
        spoken.slice(-3).some((s) => s.includes('Bravo'))
    )
    const idx = nav.findElementAt(30, 40 + 3 * 60 + 5)
    check(
      'touch finds the element under the finger',
      idx !== -1 && nav.elements[idx].options.text === 'Delta'
    )
  })
  reader.speak = originalSpeak
  config.confirmBeforeDisable = confirmSetting
}
for (const [name, ok] of checks) realLog((ok ? 'CHECK ok   ' : 'CHECK FAIL ') + name)
await sleep(500)
if (captured.app)
  await step('app.onDestroy', async () => {
    captured.app.onDestroy && (await captured.app.onDestroy.call(captured.app))
  })
realLog(
  `\n=== API ${S.apiLevel} ===  pages ${pages.length}  issues ${S.issues.length}  console ${consoleHits.length}`
)
for (const i of S.issues) realLog(`ISSUE ${i.kind}: ${i.msg}${i.where ? '   @ ' + i.where : ''}`)
if (process.env.SHOW_INFO) {
  for (const [lvl, msg] of S.logs)
    if (lvl === 'info' || lvl === 'debug') realLog(`LOG ${lvl} ${msg.slice(0, 160)}`)
}
const byLevel = {}
for (const [lvl, msg] of S.logs)
  if (lvl === 'error' || lvl === 'warn') {
    byLevel[lvl + ' ' + msg] = (byLevel[lvl + ' ' + msg] || 0) + 1
  }
for (const [k, n] of Object.entries(byLevel))
  realLog(`LOG ${k.slice(0, 200)}${n > 1 ? ' x' + n : ''}`)
const seen = new Set()
for (const [k, m] of consoleHits) {
  const key = k + m
  if (seen.has(key)) continue
  seen.add(key)
  realLog(`CONSOLE.${k}: ${m}`)
}
process.exit(0)
