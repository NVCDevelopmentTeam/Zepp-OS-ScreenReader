// Simulates the device: loads app.js, runs its lifecycle, then builds every page.
import fs from 'fs'
import { pathToFileURL } from 'url'
import { S, issue } from './state.mjs'
const root = process.cwd()
const toggleChecks = []
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
const uiModule = await import('@zos/ui')
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
  // Horizontal layout: nothing may stick out of the screen sideways (vertical overflow is normal,
  // pages scroll). The focus ring is deliberately 4 px wider than the screen.
  {
    const W = Number(process.env.ZSR_WIDTH || 480)
    for (const w of S.widgets) {
      const { x, w: width, y, h } = w.__props
      if (typeof x !== 'number' || typeof width !== 'number') continue
      if (w.__typeName === 'STROKE_RECT') continue
      if (x < -1 || x + width > W + 1 || width < 0 || (typeof h === 'number' && h < 0)) {
        issue(
          'OFFSCREEN',
          `${p}: ${w.__typeName} x=${x} w=${width} y=${y} h=${h} on a ${W}px wide screen`
        )
      }
    }
  }
  // Every switch of a settings page must hand its page callback a boolean, from the platform
  // call (slideSwitch, checked) and from ZSR's own activation (double tap).
  if (p === 'page/settings/Activation') {
    const config = globalThis.ScreenReaderConfig
    const switches = S.widgets.filter((w) => w.__typeName === 'SLIDE_SWITCH')
    const callbacks = switches.map((w) => w.__props.checked_change_func)
    callbacks[0](switches[0], false)
    toggleChecks.push([
      'switch: platform call turns the crown shortcut off',
      config.accessibilityShortcut === 'off'
    ])
    callbacks[0](switches[0], true)
    toggleChecks.push([
      'switch: platform call turns it back on',
      config.accessibilityShortcut === 'triple_click_home'
    ])
    callbacks[1](switches[1], false)
    toggleChecks.push([
      'switch: accessibility button saved as boolean false',
      config.accessibilityButton === false
    ])
    callbacks[1](switches[1], true)
    const navigation = globalThis.NavigationManagerInstance
    const at = navigation.elements.findIndex((e) => e.element === switches[2])
    toggleChecks.push(['switch: it is reachable by ZSR navigation', at >= 0])
    if (at >= 0) {
      navigation.currentIndex = at
      const before = config.activationGesture
      navigation.handleSelection()
      toggleChecks.push([
        'switch: double tap activation gives the callback a boolean',
        before === 'zigzag'
          ? config.activationGesture === 'off'
          : config.activationGesture === 'zigzag'
      ])
      navigation.handleSelection()
    }
  }
  if (p === 'page/tools/TextEditor') {
    try {
      const press = (label) => {
        const b = S.widgets.find((w) => w.__typeName === 'BUTTON' && w.__props.text === label)
        if (!b) throw new Error('no button ' + label)
        return b.__props.click_func(b)
      }
      // The page changes the shown text with setProperty(prop.TEXT, ...), read back the same way
      const screenText = () => {
        const w = S.widgets.find((x) => x.__typeName === 'TEXT' && x.__props.text !== 'Text Editor')
        return w.getProperty(uiModule.prop.TEXT)
      }
      const add = (name, ok) => toggleChecks.push([name, ok])
      add(
        'editor page has the Braille dot buttons and the editing buttons',
        ['Dot 1', 'Dot 6', 'Write character', 'Backspace', 'Undo', 'Done', 'Cancel'].every((l) =>
          S.widgets.some((w) => w.__props.text === l)
        )
      )
      press('Dot 1')
      press('Write character')
      add('dot 1 then Write character types "a"', screenText() === 'a')
      press('Dot 1')
      press('Dot 2')
      press('Write character')
      add('dots 1 and 2 type "b"', screenText() === 'ab')
      press('Space')
      press('Dot 1')
      press('Dot 4')
      press('Write character')
      add('space and dots 1 and 4 type "c" after a space', screenText() === 'ab c')
      press('Backspace')
      press('Undo')
      add('backspace then undo gives the text back', screenText() === 'ab c')
      for (const dot of [1, 2, 3, 4, 5, 6]) press('Dot ' + dot)
      press('Write character')
      add('dots that are no character do not change the text', screenText() === 'ab c')
    } catch (e) {
      issue(
        'EDITOR_TEST',
        String((e && e.stack) || e)
          .split('\n')
          .slice(0, 3)
          .join(' | ')
      )
    }
  }
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
      const W = Number(process.env.ZSR_WIDTH || 480)
      const H = Number(process.env.ZSR_HEIGHT || 480)
      const round = process.env.ZSR_SHAPE !== '0'
      const size = b.__props.w
      const cx = b.__props.x + size / 2
      const cy = b.__props.y + size / 2
      const R = Math.min(W, H) / 2
      const inside = round
        ? Math.hypot(cx - W / 2, cy - H / 2) + size / 2 <= R
        : b.__props.x >= 0 && b.__props.y >= 0 && b.__props.x + size <= W && b.__props.y + size <= H
      check('button lies on the screen, in the bottom right', inside && cx > W / 2 && cy > H / 2)
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
  await step('text editor core', async () => {
    const editorModule = await import(pathToFileURL(root + '/lib/core/textEditor.js').href)
    const { TextEditor, echoFor, MAX_TEXT_LENGTH, getClipboard } = editorModule
    const e = new TextEditor('hello world')
    check('cursor starts at the end', e.cursor === 11)
    e.moveBy(-5)
    e.insert('big ')
    check('insert at the cursor', e.text === 'hello big world' && e.cursor === 10)
    check(
      'delete backward removes one character',
      e.deleteBackward() === ' ' && e.text === 'hello bigworld'
    )
    e.undo()
    check('undo restores text and cursor', e.text === 'hello big world' && e.cursor === 10)
    e.moveToEdge('start')
    check(
      'word movement stops at word ends',
      e.moveWord(1) && e.cursor === 5 && e.moveWord(1) && e.cursor === 9
    )
    e.moveToEdge('start')
    e.moveWord(1, true)
    check('selection by word', e.selectedText() === 'hello')
    check(
      'copy then cut then paste',
      e.copy() === 'hello' &&
        e.cut() === 'hello' &&
        e.text === ' big world' &&
        (e.moveToEdge('end'), e.paste() === 'hello') &&
        e.text === ' big worldhello' &&
        getClipboard() === 'hello'
    )
    e.selectAll()
    e.insert('x')
    check('typing over a selection replaces it', e.text === 'x')
    const full = new TextEditor('a'.repeat(MAX_TEXT_LENGTH))
    check(
      'the text length is limited',
      full.insert('b') === '' && full.text.length === MAX_TEXT_LENGTH
    )
    const t = new TextEditor('say hi')
    t.insert(' ')
    check(
      'word echo says the finished word',
      echoFor(t, ' ', 'words') === 'hi' && echoFor(t, ' ', 'both') === 'space hi'
    )
    check(
      'character echo and no echo',
      echoFor(t, 'z', 'chars') === 'z' &&
        echoFor(t, 'z', 'none') === '' &&
        echoFor(t, 'z', 'words') === ''
    )
    const vi = new TextEditor('Xin chào')
    vi.moveToEdge('start')
    check(
      'words of other languages move as words',
      vi.moveWord(1) && vi.cursor === 3 && vi.moveWord(1) && vi.cursor === 8
    )
  })

  await step('verbosity', async () => {
    if (!reader.enabled) await reader.toggleEnabled(true)
    nav.clearElements()
    const mk = (text) => ({ getProperty: (p) => (p === ui.prop.TEXT ? text : undefined) })
    nav.registerElement(mk('Save'), ui.widget.BUTTON, { x: 20, y: 40, w: 200, h: 50, text: 'Save' })
    nav.registerElement(mk(''), ui.widget.BUTTON, { x: 20, y: 120, w: 200, h: 50, text: '' })
    const said = async (index) => {
      spoken.length = 0
      await nav.focusElement(index)
      return spoken.join(' | ')
    }
    const saved = config.verbosity
    config.verbosity = 'detailed'
    const detailed = await said(0)
    check('detailed gives the usage hint', /Double tap to activate/i.test(detailed))
    config.verbosity = 'standard'
    const standard = await said(0)
    const standardUnlabeled = await said(1)
    config.verbosity = 'minimal'
    const minimal = await said(0)
    const minimalUnlabeled = await said(1)
    config.verbosity = 'custom'
    config.speakRoles = false
    const customNoRole = await said(0)
    config.speakRoles = true
    config.verbosity = saved
    check('detailed: label and role', /Save/.test(detailed) && /Button/i.test(detailed))
    check('standard: label and role', /Save/.test(standard) && /Button/i.test(standard))
    check('minimal: label only', /Save/.test(minimal) && !/Button/i.test(minimal))
    check('standard names an unlabeled control', /Unlabeled button/i.test(standardUnlabeled))
    check('standard keeps no usage hints', !/Double tap/i.test(standardUnlabeled))
    check(
      'minimal stays silent on an unlabeled control',
      !/Unlabeled|Button/i.test(minimalUnlabeled)
    )
    check(
      'custom with roles off: label only',
      /Save/.test(customNoRole) && !/Button/i.test(customNoRole)
    )
    check(
      'verbosity cycles minimal -> standard -> detailed -> custom',
      (() => {
        config.verbosity = 'minimal'
        const seen = []
        for (let i = 0; i < 4; i++) {
          globalThis.ShortcutHandlerInstance.execute('cycleVerbosity')
          seen.push(config.verbosity)
        }
        config.verbosity = saved
        return seen.join() === 'standard,detailed,custom,minimal'
      })()
    )
  })

  await step('phone settings, backup and battery saver', async () => {
    const load = (file) => import(pathToFileURL(root + '/lib/' + file).href)
    const backup = await load('core/settingsBackup.js')
    const phone = await load('core/phoneSettings.js')
    const power = await load('core/powerMode.js')
    const accessibility = (await load('core/accessibility.js')).default
    const cfg = () => globalThis.ScreenReaderConfig

    // --- settings from the phone: typed, and only known settings are stored
    await phone.applyPhoneSetting('verbosity', 'minimal')
    check('phone setting is stored', cfg().verbosity === 'minimal')
    await phone.applyPhoneSetting('exploreMode', 'false')
    check('"false" from the phone becomes a real boolean false', cfg().exploreMode === false)
    await phone.applyPhoneSetting('exploreMode', 'true')
    await phone.applyPhoneSetting('activeTab', 'audio')
    check('phone UI state is not stored as a reader setting', cfg().activeTab === undefined)
    await phone.applyPhoneSetting('__proto__', '{"polluted":1}')
    check('a __proto__ key cannot change every object', {}.polluted === undefined)

    // --- backup and restore
    cfg().verbosity = 'minimal'
    cfg().soundVolume = 0.3
    const saved = backup.createBackup(cfg())
    check(
      'a backup is JSON with app, schema and settings',
      (() => {
        const o = JSON.parse(saved)
        return (
          o.app === 'ZSR' &&
          o.schema === backup.SETTINGS_SCHEMA_VERSION &&
          typeof o.settings === 'object'
        )
      })()
    )
    cfg().verbosity = 'detailed'
    cfg().soundVolume = 0.9
    const restored = backup.restoreBackup(saved)
    check(
      'restore brings the saved settings back',
      restored.ok && cfg().verbosity === 'minimal' && cfg().soundVolume === 0.3
    )

    const before = JSON.stringify(cfg())
    const rejects = {
      'not JSON': ['{bad', 'NOT_JSON'],
      empty: ['', 'EMPTY'],
      'another app': [JSON.stringify({ app: 'X', schema: 1, settings: {} }), 'NOT_ZSR'],
      'newer schema': [
        JSON.stringify({ app: 'ZSR', schema: 99, settings: { verbosity: 'standard' } }),
        'NEWER_SCHEMA'
      ],
      'too large': ['{"app":"ZSR"' + ' '.repeat(30000) + '}', 'TOO_LARGE'],
      'no settings': [JSON.stringify({ app: 'ZSR', schema: 2 }), 'NO_SETTINGS']
    }
    for (const [name, [text, code]] of Object.entries(rejects)) {
      const result = backup.restoreBackup(text)
      check(
        `restore refuses a backup that is ${name}`,
        result.ok === false && result.error === code
      )
    }
    check('a refused backup changes nothing', JSON.stringify(cfg()) === before)

    const odd = backup.parseBackup(
      JSON.stringify({
        app: 'ZSR',
        schema: 2,
        settings: {
          verbosity: 'standard',
          exploreMode: 'maybe',
          notASetting: 1,
          soundVolume: 'loud'
        }
      })
    )
    check(
      'unknown keys are ignored and types are repaired',
      odd.ok &&
        odd.settings.verbosity === 'standard' &&
        odd.settings.exploreMode === false &&
        !('notASetting' in odd.settings) &&
        odd.ignored >= 1
    )
    const proto = backup.parseBackup('{"app":"ZSR","schema":2,"settings":{"__proto__":{"x":1}}}')
    check('prototype is untouched by a backup', proto.ok && {}.x === undefined)

    const old = backup.parseBackup(
      JSON.stringify({ app: 'ZSR', schema: 1, settings: { gesture_down: 'read_screen' } })
    )
    check(
      'an older backup is migrated (read_screen -> read_all)',
      old.ok && old.settings.gesture_down === 'read_all'
    )

    backup.saveLocalBackup(cfg())
    check(
      'the backup kept on the watch can be read back',
      backup.loadLocalBackup() === backup.createBackup(cfg())
    )

    // --- battery saver
    cfg().performanceMode = 'normal'
    cfg().autoBatterySaver = true
    power.refreshBatteryLevel()
    const level = Number(process.env.ZSR_BATTERY || 70)
    check(
      `saver follows the battery (${level}%)`,
      power.isSaverMode() === level <= power.SAVER_BELOW_PERCENT
    )
    cfg().autoBatterySaver = false
    check('automatic saver can be switched off', power.isSaverMode() === false)
    cfg().autoBatterySaver = true
    cfg().performanceMode = 'saver'
    check(
      'saver can be chosen, and slows the phone-link timer',
      power.isSaverMode() && power.remoteStateIntervalMs() === 30000
    )
    cfg().performanceMode = 'normal'
    power.refreshBatteryLevel()
    check(
      'normal mode polls every 5 s (when the battery is fine)',
      level <= 15 || power.remoteStateIntervalMs() === 5000
    )

    // --- the phone-link timer only exists while remote access is on
    await phone.applyPhoneSetting('remoteAccessEnabled', 'false')
    check('no timer while remote access is off', accessibility.remoteTimer === null)
    await phone.applyPhoneSetting('remoteAccessEnabled', 'true')
    check('timer starts when remote access is switched on', !!accessibility.remoteTimer)
    await phone.applyPhoneSetting('performanceMode', 'saver')
    check('timer period follows saver mode', accessibility.remoteTimerPeriod === 30000)
    await phone.applyPhoneSetting('performanceMode', 'normal')
    await phone.applyPhoneSetting('remoteAccessEnabled', 'false')
    check('timer stops when it is switched off', accessibility.remoteTimer === null)
    await phone.applyPhoneSetting('verbosity', 'detailed')
  })

  await step('sensors', async () => {
    const sensorReader = (
      await import(pathToFileURL(root + '/lib/extensions/sensorReader.js').href)
    ).default
    const said = async (fn) => {
      spoken.length = 0
      await fn()
      return spoken.join(' | ')
    }
    const gps = await said(() => sensorReader.readLocation())
    check(
      'GPS reads the position on request',
      /Latitude 10\.77621 degrees north/.test(gps) && /longitude 106\.70098 degrees east/.test(gps)
    )
    const altitude = await said(() => sensorReader.readAltitude())
    check(
      'altitude and air pressure are read with units',
      /Altitude 12 meters/.test(altitude) && /1013 hectopascals/.test(altitude)
    )
    const compass = await said(() => sensorReader.readCompass())
    check('compass heading is read', /Facing N, 92 degrees/.test(compass))
    const battery = await said(() => sensorReader.readBattery())
    check('battery level is read', /Battery: \d+ percent/.test(battery))
    const steps = await said(() => sensorReader.readSteps())
    check('step count goes through translation', /Step count is/.test(steps))
  })

  reader.speak = originalSpeak
  config.confirmBeforeDisable = confirmSetting
}
// A normal start must not write warnings or errors to the log (expected conditions such as no
// phone, no audio on API 2.0 or a low battery are information, not errors). The one exception is
// a simulated crash of the previous run, which is reported on purpose.
if (!process.env.ZSR_PREV_CRASH) {
  const noisy = S.logs.filter(([level]) => level === 'error' || level === 'warn')
  check('a normal start writes no warning or error to the log', noisy.length === 0)
  if (noisy.length > 0)
    noisy.slice(0, 5).forEach(([level, text]) => realLog(`  ${level}: ${text.slice(0, 140)}`))
}
for (const [name, ok] of [...toggleChecks, ...checks])
  realLog((ok ? 'CHECK ok   ' : 'CHECK FAIL ') + name)
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
