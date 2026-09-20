import './GrantPermission/device-polyfill.js'
import { MessageBuilder } from './GrantPermission/message.js'
import { getPackageInfo, requestPermission } from '@zos/app'
import * as ble from '@zos/ble'
import { log } from '@zos/utils'
import WidgetInterceptor from './lib/core/widgetInterceptor.js'
import PageInterceptor from './lib/core/pageInterceptor.js'
import ScreenReader from './lib/core/screenReader.js'
import ShortcutHandler from './lib/interaction/shortcut.js'
import GestureHandler from './lib/interaction/gesture.js'
import VoiceControlService from './lib/core/voiceControlService.js'
import AccessibilityService from './lib/core/accessibility.js'
import { loadSettings } from './lib/core/config.js'
import ErrorMonitor from './lib/utils/errorMonitor.js'
import { ServerConfig, saveSettings } from './lib/core/config.js'
import BrailleService from './lib/core/braille.js'
import SpeechHistory from './lib/utils/speechHistory.js'
// Side-effect import: ContextMenu (and, transitively, BrailleKeyboard) is a
// self-registering singleton (sets globalThis.ContextMenuInstance at
// module scope) - but nothing was ever importing this file, so that
// registration line never ran and globalThis.ContextMenuInstance stayed
// undefined for the whole app lifetime. gesture.js's LONG_PRESS handler
// and the "Open Context Menu" gesture action both silently no-op via
// optional chaining (`globalThis.ContextMenuInstance?.show()`) when this
// isn't loaded, so the entire context menu feature was unreachable dead
// code despite the menu logic itself being correct.
import './lib/components/contextMenu.js'

// Initialize interceptors as early as possible
WidgetInterceptor.init()
PageInterceptor.init()

App({
  globalData: {
    messageBuilder: null
  },
  async onCreate() {
    log.info('app on create invoke')

    // Initialize globalData if it doesn't exist (some versions of Zepp OS)
    if (!this.globalData) {
      this.globalData = {}
    }

    // Load configuration
    try {
      globalThis.ScreenReaderConfig = loadSettings()
    } catch (e) {
      log.error('Failed to load settings:', String(e))
      globalThis.ScreenReaderConfig = {}
    }

    try {
      // 1. Initialize core communications
      const { appId } = getPackageInfo()
      const messageBuilder = new MessageBuilder(
        /** @type {any} */ ({
          appId,
          ble
        })
      )

      this.globalData.messageBuilder = messageBuilder
      messageBuilder.connect()

      // 2. Grant permissions
      this.grantPermissions()

      // 3. Initialize Services
      // "Reliability & Diagnostics" settings (settingsKeys
      // 'autoRecoveryEnabled' / 'maxRecoveryAttempts' from
      // setting/accessibilitySetting.js) are applied here: on init failure,
      // retry with backoff instead of leaving the screen reader silently
      // dead for the rest of the session.
      await this.initScreenReaderWithRecovery()

      ShortcutHandler.init()
      GestureHandler.init()
      VoiceControlService.init()
      AccessibilityService.init()

      // 4. Handle incoming messages
      messageBuilder.on('request', async (ctx) => {
        try {
          const jsonRpc = messageBuilder.buf2Json(ctx.request.payload)
          const { method, params = {} } = jsonRpc || {}

          if (method === 'NOTIFICATION_RECEIVE') {
            const {
              title = '',
              content = '',
              appName = 'System',
              type = 'push',
              isPriority
            } = params
            const config = globalThis.ScreenReaderConfig || {}

            // Per-category filters from setting/NotificationSetting.js -
            // previously every notification was announced regardless of
            // these toggles.
            const typeEnabled = {
              sms: config.notifySMS !== false,
              call: config.notifyCalls !== false,
              missed_call: config.notifyMissedCalls !== false,
              push: config.notifyPush !== false
            }
            const shouldAnnounceType = typeEnabled[type] !== false

            // "Priority Notifications" only restricts when explicitly
            // enabled AND the incoming notification identifies itself as
            // non-priority - a notification that doesn't report a
            // priority flag at all still gets announced normally, so this
            // can't silently swallow every notification just because the
            // sender never set isPriority.
            const passesPriorityFilter = config.notifyPriority !== true || isPriority !== false

            if (shouldAnnounceType && passesPriorityFilter) {
              let announcement = ''

              if (type === 'sms') {
                announcement = `New SMS from ${title}: ${content}`
              } else if (type === 'call') {
                const callerName = params.callerName || title || ''
                const phoneNumber =
                  params.phoneNumber ||
                  params.callerNumber ||
                  (content !== callerName ? content : '')
                if (callerName && phoneNumber && callerName !== phoneNumber) {
                  announcement = `Incoming call from ${callerName}, number ${phoneNumber}`
                } else {
                  announcement = `Incoming call from ${callerName || phoneNumber || 'Unknown'}`
                }
              } else if (type === 'missed_call') {
                announcement = `Missed call from ${title || 'Unknown'}`
              } else {
                announcement = `Notification from ${appName}: ${title}. ${content}`
              }

              await ScreenReader.speak(announcement, { priority: 'high', secondary: true })
            }
          } else if (method === 'SETTING_UPDATE') {
            const { key, value } = params
            if (key === 'clearHistorySignal') {
              // "Clear History" button (setting/SpeechHistorySetting.js)
              // previously just stored a timestamp nobody read.
              SpeechHistory.clear()
            } else if (key === 'brailleTable') {
              // Previously the raw config value updated, but
              // BrailleService's own internal `currentTable` (what
              // translation actually uses) never synced with it.
              BrailleService.setTable(value)
              if (globalThis.ScreenReaderConfig) globalThis.ScreenReaderConfig[key] = value
            } else if (key === 'resetSettingsSignal') {
              // "Reset All Settings" button (setting/DeveloperSettings.js)
              // previously just stored a timestamp nobody read.
              const defaults = JSON.parse(JSON.stringify(ServerConfig))
              globalThis.ScreenReaderConfig = defaults
              saveSettings(defaults)
              await ScreenReader.speak('All settings have been reset to defaults.', {
                priority: 'high',
                force: true
              })
            } else if (key === 'exportLogSignal') {
              // "Export Debug Log" button - there's no file-sharing API
              // exposed to a Mini Program's device-side code to actually
              // write a shareable file, so this speaks a summary via TTS
              // instead of silently doing nothing.
              const stats = ErrorMonitor.getErrorStats()
              await ScreenReader.speak(
                `Debug log summary: ${stats.total} errors recorded, ${stats.recovered} recovered.`,
                { priority: 'high', force: true }
              )
            } else if (globalThis.ScreenReaderConfig && key !== undefined) {
              globalThis.ScreenReaderConfig[key] = value
            }
          }
        } catch (error) {
          // A malformed/corrupted BLE payload (dropped bytes, mid-transfer
          // disconnect, etc.) would otherwise throw inside JSON.parse and
          // crash this handler as an unhandled rejection. Parsing now lives
          // inside the try block so a single bad message can't take down
          // message handling for the rest of the session.
          log.error('App Message Receive Error:', String(error))
        }
      })

      // Restore state and re-enable if it was on
      if (globalThis.ScreenReaderConfig?.autoStart !== false) {
        ScreenReader.enabled = true
        // Delay greeting to ensure TTS is ready
        setTimeout(() => {
          ScreenReader.vibration.vibrate('success')
          ScreenReader.speak('ZSR Started', { priority: 'high' })
        }, 1500)
      }
    } catch (error) {
      log.error('App onCreate fatal error:', String(error))
    }
  },

  // onBoot is a Zepp OS lifecycle hook; the @zeppos/device-types package does
  // not declare it in the App Option type. Suppress the type error here since
  // removing it would break runtime behavior on devices that call onBoot.
  // @ts-ignore - onBoot is a valid Zepp OS lifecycle hook not in the type package
  onBoot() {
    console.log('app on boot invoke')
  },

  async initScreenReaderWithRecovery() {
    const config = globalThis.ScreenReaderConfig || {}
    const autoRecoveryEnabled = config.autoRecoveryEnabled !== false
    const maxAttempts = autoRecoveryEnabled ? Math.max(1, config.maxRecoveryAttempts || 3) : 1
    /** @type {{ timestamp: number; error: any; stack: any; context: any; recovered: boolean; } | null} */
    let lastErrorEntry = null

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        await ScreenReader.init()
        if (lastErrorEntry) {
          ErrorMonitor.markAsRecovered(lastErrorEntry)
        }
        return
      } catch (error) {
        lastErrorEntry = ErrorMonitor.trackError(error, `ScreenReader.init (attempt ${attempt})`)
        if (attempt >= maxAttempts) {
          log.error(
            `ScreenReader init failed after ${attempt} attempt(s), giving up:`,
            String(error)
          )
          return
        }
        log.warn(
          `ScreenReader init failed (attempt ${attempt}/${maxAttempts}), retrying...`,
          String(error)
        )
        // Simple linear backoff so a fast-failing sensor/service doesn't
        // spin the retry loop.
        await new Promise((resolve) => setTimeout(resolve, attempt * 500))
      }
    }
  },

  grantPermissions() {
    const permissions = [
      'data:os.device.info',
      'device:os.local_storage',
      'device:os.vibration',
      'device:os.sound',
      'device:os.camera',
      'device:os.ble',
      'data:user.hd.heart_rate',
      'data:user.hd.sleep',
      'data:user.hd.spo2',
      'data:user.hd.step',
      'data:user.hd.stress',
      'data:user.hd.calorie',
      'data:user.hd.distance'
    ]

    // @zos/app has no `permission` object - the real Zepp OS 2.0/3.0 API is
    // the standalone requestPermission() function, and its result comes
    // back through a single `callback` (not separate success/fail
    // handlers). See
    // https://docs.zepp.com/docs/reference/device-app-api/newAPI/app/requestPermission/
    try {
      requestPermission({
        permissions,
        callback: (...args) => {
          console.log('Permission request result:', args)
        }
      })
    } catch (_e) {
      console.log(
        'Standard permission request not supported or failed, proceeding with system defaults.'
      )
    }
  },

  onDestroy() {
    console.log('app on destroy invoke')
    // Use getApp() to access globalData — avoids the 'this' type mismatch
    // in the @zeppos/device-types App Option definition which does not expose
    // globalData on the lifecycle context.
    const app = getApp()
    if (app.globalData && app.globalData.messageBuilder) {
      app.globalData.messageBuilder.disConnect()
    }
  }
})
