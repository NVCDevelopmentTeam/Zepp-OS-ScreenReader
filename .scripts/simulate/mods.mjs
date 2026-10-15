import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { S, issue } from './state.mjs'
const generated = path.join(path.dirname(fileURLToPath(import.meta.url)), '.generated')
const api = JSON.parse(fs.readFileSync(path.join(generated, 'zos-api.json'), 'utf8'))
const consts = JSON.parse(fs.readFileSync(path.join(generated, 'ui-consts.json'), 'utf8'))

function strictConsts(name, names) {
  const target = {}
  names.forEach((n, i) => (target[n] = i + 1))
  return new Proxy(target, {
    get(t, k) {
      if (typeof k === 'symbol' || k === 'then' || k === 'toJSON') return undefined
      if (!(k in t)) issue('UNKNOWN_CONST', `${name}.${String(k)} does not exist`)
      return t[k]
    }
  })
}
const NUM_REQ = {
  TEXT: ['x', 'y', 'w', 'h'],
  BUTTON: ['x', 'y', 'w', 'h'],
  IMG: ['x', 'y'],
  FILL_RECT: ['x', 'y', 'w', 'h'],
  GROUP: ['x', 'y', 'w', 'h'],
  STROKE_RECT: ['x', 'y', 'w', 'h'],
  SCROLL_LIST: ['x', 'y', 'w', 'h']
}
const WIDGET_METHODS = new Set([
  'setProperty',
  'getProperty',
  'addEventListener',
  'removeEventListener',
  'setEnable',
  'createWidget',
  'getLayout',
  'setFocus',
  'getTextLayout',
  'clear',
  'drawText',
  'drawRect',
  'drawLine',
  'drawCircle',
  'drawImage',
  'setPaint',
  'getText',
  'getVal',
  'setVal',
  'then',
  'toJSON',
  'constructor'
])
function makeWidget(typeName, type, opts) {
  const props = { ...(opts || {}) }
  const w = {
    __type: type,
    __typeName: typeName,
    __props: props,
    __children: [],
    __deleted: false,
    __listeners: {},
    setProperty(p, v) {
      if (p === 'MORE_SENTINEL') return
      if (typeof p === 'object' || p === undefined) {
        /* prop.MORE with object */
      }
      if (v && typeof v === 'object') Object.assign(props, v)
      else props[p] = v
    },
    getProperty(p) {
      return props[p]
    },
    addEventListener(ev, fn) {
      if (typeof fn !== 'function')
        issue('BAD_LISTENER', `addEventListener(${ev}) got ${typeof fn}`)
      ;(w.__listeners[ev] ||= []).push(fn)
    },
    removeEventListener() {},
    setEnable() {},
    createWidget(t, o) {
      return S.createWidget(t, o, w)
    },
    getLayout() {
      return { x: 0, y: 0, w: 0, h: 0 }
    }
  }
  return new Proxy(w, {
    get(t, k) {
      if (typeof k === 'symbol' || k in t) return t[k]
      if (!WIDGET_METHODS.has(k))
        issue('UNKNOWN_WIDGET_METHOD', `widget.${k} is not a widget method`)
      return undefined
    }
  })
}
const W = strictConsts('widget', consts.widget)
S.createWidget = (type, opts, parent) => {
  if (typeof type !== 'number') {
    issue('BAD_WIDGET_TYPE', `createWidget(${String(type)}) - type is not a number`)
    throw new Error('createWidget: invalid widget type ' + String(type))
  }
  const typeName = consts.widget[type - 1] || '?'
  const req = NUM_REQ[typeName]
  if (req)
    for (const k of req) {
      const v = opts && opts[k]
      if (typeof v !== 'number' || !Number.isFinite(v))
        issue('BAD_WIDGET_PARAM', `${typeName}.${k} = ${String(v)} (needs a finite number)`)
    }
  if (opts)
    for (const [k, v] of Object.entries(opts))
      if (typeof v === 'number' && !Number.isFinite(v))
        issue('NAN_PARAM', `${typeName}.${k} = ${v}`)
  const w = makeWidget(typeName, type, opts)
  S.widgets.push(w)
  if (parent) parent.__children.push(w)
  return w
}
const bytes = (s) => new TextEncoder().encode(s)
const fsMock = {
  O_RDONLY: 0,
  O_WRONLY: 1,
  O_RDWR: 2,
  O_CREAT: 64,
  O_EXCL: 128,
  O_TRUNC: 512,
  O_APPEND: 1024,
  writeFileSync({ path, data }) {
    if (typeof path !== 'string' || data === undefined)
      issue('FS_BAD_ARGS', 'writeFileSync needs {path,data}')
    S.fs.set(path, data)
    return true
  },
  readFileSync({ path }) {
    if (typeof path !== 'string') issue('FS_BAD_ARGS', 'readFileSync needs {path}')
    return S.fs.has(path) ? S.fs.get(path) : undefined
  },
  rmSync({ path }) {
    S.fs.delete(path)
    return 0
  },
  statSync({ path }) {
    return S.fs.has(path) ? { size: 1 } : undefined
  },
  mkdirSync() {
    return 0
  },
  readdirSync() {
    return []
  },
  renameSync() {
    return 0
  },
  openSync() {
    return 1
  },
  closeSync() {},
  readSync() {
    return 0
  },
  writeSync() {
    return 0
  },
  openAssetsSync() {
    return 1
  },
  // One readable picture, so OCR's file reading can be exercised
  statAssetsSync({ path }) {
    return path === 'image/sample.png' ? { size: 8 } : undefined
  }
}
export function build(name) {
  const m = api[name]
  const out = {}
  const generic = (n) =>
    Object.assign(
      function () {
        return undefined
      },
      { __n: name + '.' + n }
    )
  for (const v of m.values) out[v] = /^[A-Z0-9_]+$/.test(v) ? 1 : generic(v)
  switch (name) {
    case '@zos/ui':
      Object.assign(out, {
        widget: W,
        prop: strictConsts('prop', consts.prop),
        event: strictConsts('event', consts.event),
        align: strictConsts('align', consts.align),
        text_style: strictConsts('text_style', consts.text_style),
        createWidget: (t, o) => S.createWidget(t, o),
        deleteWidget(w) {
          if (!w || typeof w !== 'object') issue('BAD_DELETE', 'deleteWidget(non-widget)')
          else w.__deleted = true
        },
        data_type: new Proxy({}, { get: () => 1 }),
        arc_type: {},
        sport_data: {}
      })
      break
    case '@zos/utils':
      out.log = {
        debug: (...a) => S.logs.push(['debug', a.join(' ')]),
        info: (...a) => S.logs.push(['info', a.join(' ')]),
        warn: (...a) => S.logs.push(['warn', a.join(' ')]),
        error: (...a) => S.logs.push(['error', a.join(' ')]),
        getLogger: () => out.log
      }
      out.px = (n) => n
      out.assets = { path: '' }
      out.EventBus = class {
        constructor() {
          this.m = {}
        }
        on(e, f) {
          ;(this.m[e] ||= []).push(f)
        }
        off(e, f) {
          this.m[e] = (this.m[e] || []).filter((x) => x !== f)
        }
        emit(e, ...a) {
          ;(this.m[e] || []).forEach((f) => f(...a))
        }
      }
      out.stringToBuffer = (s) => bytes(s).buffer
      out.bufferToString = (b) => new TextDecoder().decode(b)
      break
    case '@zos/device':
      out.getDeviceInfo = () => ({
        width: 480,
        height: 480,
        screenShape: 1,
        deviceName: 'Sim',
        deviceSource: 1,
        keyNumber: 2,
        platform: 'sim'
      })
      out.getDiskInfo = () => ({ total: 1e9, free: 5e8 })
      break
    case '@zos/i18n':
      out.getText = (k) => {
        if (typeof k !== 'string') issue('GETTEXT_BAD', 'getText(' + typeof k + ')')
        return k
      }
      break
    case '@zos/fs':
      Object.assign(out, fsMock)
      break
    case '@zos/router':
      for (const k of ['push', 'replace', 'back', 'home', 'exit'])
        out[k] = (o) => {
          S.route.push([k, o && o.url])
          if ((k === 'push' || k === 'replace') && (!o || typeof o.url !== 'string'))
            issue('ROUTER_BAD', k + ' without url')
        }
      out.launchApp = () => {}
      out.checkSystemApp = () => false
      out.getAppIdByName = () => 0
      break
    case '@zos/interaction':
      out.onKey = (o) => {
        if (!o || typeof o.callback !== 'function') issue('KEY_BAD', 'onKey needs {callback}')
        S.keyHandlers.push(o)
        return 1
      }
      out.onGesture = (o) => {
        if (!o || typeof o.callback !== 'function')
          issue('GESTURE_BAD', 'onGesture needs {callback}')
        S.gestureHandlers.push(o)
        return 1
      }
      out.offKey = () => {}
      out.offGesture = () => {}
      out.onDigitalCrown = () => 1
      out.offDigitalCrown = () => {}
      out.onWristMotion = () => 1
      out.showToast = (o) => {
        if (!o || typeof o.content !== 'string')
          issue('TOAST_BAD', 'showToast needs {content: string}')
      }
      out.createModal = () => ({ show() {}, dismiss() {} })
      Object.assign(out, {
        GESTURE_UP: 1,
        GESTURE_DOWN: 2,
        GESTURE_LEFT: 3,
        GESTURE_RIGHT: 4,
        KEY_BACK: 1,
        KEY_SELECT: 2,
        KEY_UP: 3,
        KEY_DOWN: 4,
        KEY_HOME: 5,
        KEY_SHORTCUT: 6,
        KEY_EVENT_CLICK: 1,
        KEY_EVENT_DOUBLE_CLICK: 2,
        KEY_EVENT_LONG_PRESS: 3,
        KEY_EVENT_PRESS: 4,
        KEY_EVENT_RELEASE: 5
      })
      break
    case '@zos/timer':
      out.createSysTimer = () => {
        const id = Math.random()
        S.timers.add(id)
        return id
      }
      out.stopTimer = (id) => S.timers.delete(id)
      break
    case '@zos/sensor': {
      const cls = (n) =>
        class {
          constructor() {
            this.__n = n
          }
          getCurrent() {
            return 70
          }
          getLast() {
            return 70
          }
          getTarget() {
            return 10000
          }
          onChange() {}
          offChange() {}
          onPress() {}
          onRelease() {}
          start() {}
          stop() {}
          getStatus() {
            return 0
          }
          getAverage() {
            return 70
          }
          getToday() {
            return 0
          }
          getTotal() {
            return 0
          }
          getDaySleep() {
            return {}
          }
          getSleepStageList() {
            return []
          }
          getValue() {
            return 0
          }
          getTime() {
            return 0
          }
        }
      for (const v of m.values) if (/^[A-Z][a-z]/.test(v)) out[v] = cls(v)
      out.Vibrator = class {
        constructor() {}
        start() {
          S.vibrations++
        }
        stop() {}
        setMode() {}
        getType() {
          return 0
        }
      }
      out.Screen = class {
        constructor() {}
        getBrightness() {
          return 50
        }
        onChange() {}
      }
      out.checkSensor = () => true
      Object.assign(out, {
        FREQ_MODE_HIGH: 2,
        FREQ_MODE_NORMAL: 1,
        FREQ_MODE_LOW: 0,
        VIBRATOR_SCENE_SHORT_LIGHT: 1,
        VIBRATOR_SCENE_SHORT_MIDDLE: 2,
        VIBRATOR_SCENE_SHORT_STRONG: 3,
        VIBRATOR_SCENE_DURATION: 4,
        VIBRATOR_SCENE_DURATION_LONG: 5,
        VIBRATOR_SCENE_NOTIFICATION: 6,
        VIBRATOR_SCENE_CALL: 7,
        VIBRATOR_SCENE_STRONG_REMINDER: 8,
        VIBRATOR_SCENE_TIMER: 9
      })
      break
    }
    case '@zos/app':
      out.getPackageInfo = () => ({ type: 'app', name: 'ZSR', appId: 1 })
      out.queryPermission = () => [1]
      out.requestPermission = ({ callback }) => callback && callback([2])
      out.getScene = () => 0
      break
    case '@zos/settings':
      out.getLanguage = () => 0
      out.getSystemInfo = () => ({})
      break
    case '@zos/display':
      for (const k of [
        'setBrightness',
        'setAutoBrightness',
        'setScreenOff',
        'resetPageBrightTime',
        'setPageBrightTime',
        'setWakeUpRelaunch',
        'pauseDropWristScreenOff',
        'resetDropWristScreenOff'
      ])
        out[k] = () => 0
      out.getBrightness = () => 50
      out.getAutoBrightness = () => false
      break
    case '@zos/ble':
      out.connectStatus = () => true
      out.addListener = () => {}
      out.removeListener = () => {}
      out.send = () => (process.env.ZSR_NO_PHONE ? false : true)
      out.createConnect = () => {}
      out.disConnect = () => {}
      break
    case '@zos/storage': {
      const mk = () => {
        const d = new Map()
        return {
          getItem: (k, def) => (d.has(k) ? d.get(k) : def),
          setItem: (k, v) => void d.set(k, v),
          removeItem: (k) => d.delete(k),
          clear: () => d.clear()
        }
      }
      out.localStorage = mk()
      if (process.env.ZSR_PREV_CRASH)
        out.localStorage.setItem(
          'zsr_run_state',
          JSON.stringify({
            running: true,
            stage: 'services',
            crashes: Number(process.env.ZSR_PREV_CRASH) - 1
          })
        )
      out.sessionStorage = mk()
      out.LocalStorage = class {
        constructor() {
          Object.assign(this, mk())
        }
      }
      break
    }
    case '@zos/page':
      out.setScrollLock = () => {}
      out.scrollTo = () => {}
      out.setScrollMode = () => {}
      break
    case '@zos/notification':
      out.notify = () => {}
      out.cancel = () => {}
      out.getAllNotifications = () => []
      break
  }
  return out
}
export function buildMedia() {
  const handlers = {}
  const player = {
    event: { PREPARE: 1, COMPLETE: 2 },
    addEventListener(e, f) {
      handlers[e] = f
    },
    setSource() {},
    prepare() {
      setTimeout(() => handlers[1] && handlers[1](player, {}), 0)
    },
    start() {
      setTimeout(() => handlers[2] && handlers[2](player, {}), 0)
    },
    stop() {},
    release() {},
    setVolume() {},
    getVolume() {
      return 1
    },
    source: {},
    status: {}
  }
  return {
    create: (kind) => {
      if (kind === undefined) issue('MEDIA_BAD', 'create(undefined)')
      return player
    },
    id: { PLAYER: 1 }
  }
}
