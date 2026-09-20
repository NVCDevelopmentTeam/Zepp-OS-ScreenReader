// ─── App Settings Page DSL (running in the phone-side setting context) ─────────
declare function AppSettingsPage(options: any): void
declare function Section(props: any, children?: any): any
declare function Row(props: any, children?: any): any
declare function Text(props: any, children?: any): any
declare function Toggle(props: any): any
declare function Select(props: any): any
declare function Slider(props: any): any
declare function Button(props: any): any
declare function TextInput(props: any): any
declare function Link(props: any, children?: any): any
declare function View(props: any, children?: any): any
declare function gettext(key: string): string
declare function px(val: number): number

// ─── Standard JS globals not included in Zepp OS type target ─────────────────
declare var console: any
declare var setTimeout: any
declare var clearTimeout: any
declare var setInterval: any
declare var clearInterval: any
declare var fetch: any
declare var Promise: any

interface Performance {
  memory?: {
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
    [key: string]: any
  }
  [key: string]: any
}

// ─── Zepp OS Page / App / Widget globals ──────────────────────────────────────
declare var AppWidget: any
declare var SecondaryWidget: any
declare function App(options: any): any
declare function AppSideService(options: any): any

// ─── ZSR internal global state ────────────────────────────────────────────────
declare var GestureHandler: any
declare var Speech: any
declare var DEVICE_CAPABILITIES: any
declare var GestureManager: any
declare var EventManager: any
declare var settingsManager: any
declare var accessibility: any
declare var Buffer: any

// ─── getApp() return type ─────────────────────────────────────────────────────
interface ZSRApp {
  globalData: {
    messageBuilder: any
    [key: string]: any
  }
  [key: string]: any
}

declare function getApp(): ZSRApp

// ─── Page() global ────────────────────────────────────────────────────────────
interface ZSRPageOptions {
  onInit?(params?: any): void
  onShow?(): void
  onHide?(): void
  onDestroy?(): void
  build?(): any
  onKey?(event: any): boolean | void
  onGesture?(event: any): boolean | void
  [key: string]: any
}
declare function Page(options: ZSRPageOptions): any

// ─── requestPermission callback type fix ──────────────────────────────────────
declare module '@zos/app' {
  export function requestPermission(options: {
    permissions: string[]
    callback: (...args: any[]) => void
  }): void
  export function getPackageInfo(): { appId: number; [key: string]: any }
}

// ─── @zos/media Tts class ────────────────────────────────────────────────────
declare module '@zos/media' {
  export class Tts {
    onStatusChange(callback: (status: string) => void): void
    speak(options: { text: string; rate?: number; pitch?: number; volume?: number }): void
    stop(): void
  }
  export function create(type: any): any
  export const id: {
    PLAYER: any
    [key: string]: any
  }
}

// ─── ZSR widget instance type ─────────────────────────────────────────────────
interface ZSRWidget {
  createWidget(type: any, options?: any): ZSRWidget
  deleteWidget(widget: any): void
  setProperty(prop: any, value?: any): void
  getProperty(prop: any): any
  addEventListener(event: any, handler: (info: any) => void): void
  removeEventListener(event: any, handler?: (info: any) => void): void
  [key: string]: any
}

// ─── @zos/ui — fully permissive declaration ──────────────────────────────────
declare module '@zos/ui' {
  export function deleteWidget(widget: any): void
  export function createWidget(type: any, options?: any): ZSRWidget
  export function showDialog(options: any): void
  export function showToast(options: any): void
  export const align: any
  export const widget: {
    GROUP: any
    FILL_RECT: any
    RECT: any
    VIEW: any
    TEXT: any
    BUTTON: any
    IMG: any
    SLIDE_SWITCH: any
    CHECKBOX_GROUP: any
    RADIO_GROUP: any
    SCROLL_LIST: any
    CYCLE_LIST: any
    DIALOG: any
    SLIDER: any
    PROGRESS: any
    PICKER: any
    VIEW_CONTAINER: any
    TEXT_STYLE_WRAP: any
    PROPERTIES: {
      VISIBLE: any
      X: any
      Y: any
      W: any
      H: any
      [key: string]: any
    }
    prop: {
      VISIBLE: any
      X: any
      Y: any
      W: any
      H: any
      TEXT: any
      MORE: any
      CHECKED: any
      ENABLED: any
      VALUE: any
      STYLE_STROKE: any
      [key: string]: any
    }
    event: {
      CLICK: any
      CLICK_DOWN: any
      CLICK_UP: any
      MOVE: any
      PREPARE: any
      [key: string]: any
    }
    TEXT_STYLE_BOLD: any
    [key: string]: any
  }
  export const prop: {
    VISIBLE: any
    X: any
    Y: any
    W: any
    H: any
    TEXT: any
    MORE: any
    CHECKED: any
    ENABLED: any
    VALUE: any
    STYLE_STROKE: any
    [key: string]: any
  }
  export const event: {
    CLICK: any
    CLICK_DOWN: any
    CLICK_UP: any
    MOVE: any
    PREPARE: any
    [key: string]: any
  }
  export const text_style: {
    WRAP: any
    NONE: any
    ELLIPSIS: any
    [key: string]: any
  }
}

// ─── @zos/ble extended types ──────────────────────────────────────────────────
declare module '@zos/ble' {
  export function startScan(options: any): void
  export function stopScan(): void
  export function connect(options: any): void
  export function disconnect(options: any): void
  export function on(event: string, callback: (...args: any[]) => void): void
  export function off(event: string, callback: (...args: any[]) => void): void
  export function send(options: any): void
  export function createConnection(options: any): any
  export const mtu: number
  export function getLinkStatus(options: any): any
}

// ─── @zos/interaction extended types ─────────────────────────────────────────
declare module '@zos/interaction' {
  export function onGesture(options: { callback: (event: any) => boolean | void }): void
  export const GESTURE_UP: any
  export const GESTURE_DOWN: any
  export const GESTURE_LEFT: any
  export const GESTURE_RIGHT: any
}

// ─── @zos/router extended types ───────────────────────────────────────────────
declare module '@zos/router' {
  export function push(options: { url: string; params?: any }): void
  export function replace(options: { url: string; params?: any }): void
  export function back(): void
  export function home(): void
}

// ─── @zos/sensor extended types ───────────────────────────────────────────────
declare module '@zos/sensor' {
  export class Vibrator {
    setMode(options: { mode: any }): void
    start(): void
    stop(): void
    static stop(): Promise<void> | void
    static vibrate(options: any): Promise<void> | void
    [key: string]: any
  }
  export const VIBRATOR_SCENE_SHORT_LIGHT: number
  export const VIBRATOR_SCENE_SHORT_MIDDLE: number
  export const VIBRATOR_SCENE_SHORT_STRONG: number
  export const VIBRATOR_SCENE_NOTIFICATION: number
  export const VIBRATOR_SCENE_STRONG_REMINDER: number
  export const VIBRATOR_SCENE_TIMER: number
  export class Battery {
    getCurrent(): number
    isCharging(): boolean
  }
  export class HeartRate {
    getLast(): number | undefined
    start(): void
    stop(): void
    onChange(callback: () => void): void
    offChange(): void
  }
  export class Step {
    getCurrent(): number
    getTarget(): number
    onChange(callback: () => void): void
    offChange(): void
  }
  export class Stress {
    getCurrent(): { value: number }
  }
  export class Sleep {
    getInfo(): { totalTime: number; deepTime: number; [key: string]: any } | null
    getStage(): Array<{ model: number; start: number; stop: number }> | null
    getStageConstantObj(): { LIGHT_STAGE: number; REM_STAGE: number; [key: string]: any } | null
  }
  export class BloodOxygen {
    getCurrent(): { value: number; time: number; retCode: number }
    start(): void
    stop(): void
  }
  export class Accelerometer {
    getCurrent(): { x: number; y: number; z: number }
    start(): void
    stop(): void
    onChange(callback: () => void): void
    offChange(): void
  }
  export class Compass {
    getCurrent(): { direction: number }
    start(): void
    stop(): void
    onChange(callback: () => void): void
    offChange(): void
  }
  export class Barometer {
    getCurrent(): { pressure: number; altitude: number }
    start(): void
    stop(): void
    onChange(callback: () => void): void
    offChange(): void
  }
  export class Calorie {
    getCurrent(): number
  }
  export class Distance {
    getCurrent(): number
  }
}

// ─── @zos/device extended types ───────────────────────────────────────────────
declare module '@zos/device' {
  export function getDeviceInfo(): {
    width: number
    height: number
    deviceName: string
    platformName: string
    [key: string]: any
  }
}

// ─── @zos/display extended types ──────────────────────────────────────────────
declare module '@zos/display' {
  export class Display {
    static setBrightness(level: number): Promise<void> | void
    static setContrast(level: number): Promise<void> | void
    [key: string]: any
  }
  export function setBrightScreen(options: any): void
  export function resetBrightScreen(): void
  export function getBrightness(): number
  export function setBrightness(options: any): void
}

// ─── @zos/qrcode extended types ───────────────────────────────────────────────
declare module '@zos/qrcode' {
  export function createQRCode(...args: any[]): any
}

// ─── @zos/events extended types ───────────────────────────────────────────────
declare module '@zos/events' {
  export class EventEmitter {
    on(event: string, callback: (...args: any[]) => void): void
    off(event: string, callback?: (...args: any[]) => void): void
    emit(event: string, ...args: any[]): void
    [key: string]: any
  }
}

// ─── @zos/buffer extended types ───────────────────────────────────────────────
declare module '@zos/buffer' {
  export const Buffer: any
}

// ─── @zos/i18n extended types ─────────────────────────────────────────────────
declare module '@zos/i18n' {
  export function gettext(key: string): string
  export function setLanguage(lang: string): void
}

// ─── @zos/utils extended types ────────────────────────────────────────────────
declare module '@zos/utils' {
  export const log: {
    info: (...args: any[]) => void
    warn: (...args: any[]) => void
    error: (...args: any[]) => void
    debug: (...args: any[]) => void
  }
  export class EventBus {
    on(event: string, callback: (...args: any[]) => void): void
    off(event: string, callback?: (...args: any[]) => void): void
    emit(event: string, ...args: any[]): void
    [key: string]: any
  }
}

// ─── hmStorage global ─────────────────────────────────────────────────────────
interface HmStorage {
  setItem(key: string, value: string): void
  getItem(key: string): string | null
  removeItem(key: string): void
}
declare var hmStorage: HmStorage | undefined

// ─── hmUI global (legacy API present on some device firmware) ────────────────
declare var hmUI: any

// ─── @zos/settings extended types ─────────────────────────────────────────────
declare module '@zos/settings' {
  export const settings: {
    setItem(key: string, value: string): void
    getItem(key: string): string | null
    removeItem(key: string): void
    [key: string]: any
  }
}
