/**
 * Declarations for things the official @zeppos/device-types typings do not cover.
 *
 * Everything under `@zos/*` is typed by the official package; nothing in it is redeclared
 * here, so a wrong name or wrong arguments are reported by `npm run check`. Only the
 * pieces below are added, each with the reason.
 */

// ─── Settings App (phone) components: every one has the shape (props, children?) ───
declare function AppSettingsPage(options: any): void
declare function Section(props: any, children?: any): any
declare function Text(props: any, children?: any): any
declare function Toggle(props: any, children?: any): any
declare function Select(props: any, children?: any): any
declare function Slider(props: any, children?: any): any
declare function Button(props: any, children?: any): any
declare function TextInput(props: any, children?: any): any
declare function Link(props: any, children?: any): any
declare function View(props: any, children?: any): any

// ─── Globals that exist on the device / phone runtime ──────────────────────────────
declare var console: any
declare var setTimeout: (callback: (...args: any[]) => void, ms?: number) => any
declare var clearTimeout: (id: any) => void
declare var setInterval: (callback: (...args: any[]) => void, ms?: number) => any
declare var clearInterval: (id: any) => void
declare var fetch: any
declare var AppWidget: any
declare var SecondaryWidget: any
declare function App(options: any): any
declare function AppSideService(options: any): any

/** Probed (with typeof) by lib/utils/polyfills.js to find the global object on any engine. */
declare var self: any
declare var window: any
declare var global: any

/** True on the watch, undefined on the phone (used by the messaging library). */
declare var __ZEPPOS__: boolean | undefined
/** Phone-side messaging bridge; not defined on the watch. */
declare var messaging: any

// ─── getApp() return type ──────────────────────────────────────────────────────────
interface ZSRApp {
  globalData: {
    messageBuilder: any
    [key: string]: any
  }
  [key: string]: any
}
declare function getApp(): ZSRApp

// ─── Page() global ─────────────────────────────────────────────────────────────────
interface ZSRPageOptions {
  onInit?(params?: any): void
  onShow?(): void
  onHide?(): void
  onDestroy?(): void
  build?(): any
  [key: string]: any
}
declare function Page(options: ZSRPageOptions): any

/** Widget object returned by createWidget (a group also creates children). */
interface ZSRWidget {
  createWidget?(type: any, options?: any): ZSRWidget
  setProperty(prop: any, value?: any): void
  getProperty(prop: any): any
  addEventListener(event: any, handler: (info: any) => void): void
  removeEventListener(event: any, handler?: (info: any) => void): void
  [key: string]: any
}

// ─── Additions to modules ──────────────────────────────────────────────────────────

/** `hmUI.deleteWidget` is documented, but this typings version does not export it. */
declare module '@zos/ui' {
  export function deleteWidget(widget: any): void
}

/**
 * Audio playback exists from API_LEVEL 3.0 and is missing from the typings. ZSR only
 * reaches it through a guarded dynamic import (lib/equipment/mediaSupport.js).
 */
declare module '@zos/media' {
  export function create(type: any): any
  export const id: { PLAYER: any; [key: string]: any }
}
