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
import { registerApiCapabilityProbes } from './lib/utils/apiCapability.js'
import { gettext, format } from './lib/utils/i18n.js'
import { loadMedia, getMediaModule as getMediaModuleSafe } from './lib/equipment/mediaSupport.js'
import SpeechPlayer from './lib/equipment/speechPlayer.js'
import { getApiCapabilityLevel } from './lib/utils/apiCapability.js'
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

    // Dynamic, try/catch-wrapped probes for APIs newer than this app's
    // declared baseline (apiVersion.minVersion 2.0.0). A STATIC
    // `import { x } from '@zos/y'` of a name that doesn't exist on a
    // given device's actual firmware can fail to resolve entirely - real
    // beta-testing feedback confirms this happens in practice: ZSR
    // installed but wouldn't run on Zepp OS 2.0, and wouldn't even
    // install on Zepp OS 5.0. Dynamic import() inside try/catch lets a
    // missing/renamed API on either an older or a newer device degrade
    // to "capability not detected" instead of crashing app startup or
    // failing installation validation.
    try {
      const probes = {}
      try {
        const settingsModule = await import('@zos/settings')
        probes.getSystemInfo = settingsModule.getSystemInfo
      } catch (_e) {
        // Not present on this firmware - fine, level stays at baseline.
      }
      try {
        const sensorModule = await import('@zos/sensor')
        probes.checkSensor = sensorModule.checkSensor
      } catch (_e) {
        // Not present on this firmware - fine.
      }
      try {
        const interactionModule = await import('@zos/interaction')
        probes.SYSTEM_KEYBOARD = interactionModule.SYSTEM_KEYBOARD
      } catch (_e) {
        // Not present on this firmware - fine.
      }
      registerApiCapabilityProbes(probes)
    } catch (e) {
      log.warn('API capability probing failed (non-fatal):', String(e))
    }

    // Audio playback ('@zos/media') exists from API_LEVEL 3.0 only; resolve it
    // before any service tries to create a player.
    const hasAudio = await loadMedia()
    // One line that tells, per watch/OS, which features are available. It is
    // meant to be copied from the console into a bug report.
    try {
      const media = getMediaModuleSafe()
      const diag = {
        apiLevel: getApiCapabilityLevel(),
        audioPlayback: hasAudio,
        recorder: !!(media && media.id && media.id.RECORDER && media.codec)
      }
      console.log('[ZSR diag] device ' + JSON.stringify(diag))
    } catch (_e) {
      console.log('[ZSR diag] device probe failed')
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

      // Ask the phone to download the speech engine now, in the background,
      // so the user's first sentence is not delayed. Best effort only.
      Promise.resolve()
        .then(() =>
          messageBuilder.request({ method: 'TTS_WARMUP', params: {} }, { timeout: 120000 })
        )
        // Then download the offline voice in the background (resumable) so
        // interface labels are spoken instantly with no phone round trip.
        .then(() => ScreenReader.syncOfflineVoice(messageBuilder))
        .catch((e) => log.info('Speech engine warm-up skipped: ' + String(e)))

      // 4. Handle incoming messages
      const handleIncoming = async (payloadBuf) => {
        try {
          const jsonRpc = messageBuilder.buf2Json(payloadBuf)
          const { method, params = {} } = jsonRpc || {}

          if (method === 'NOTIFICATION_RECEIVE') {
            const {
              title = '',
              content = '',
              appName = gettext('System'),
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
                announcement = format(gettext('New SMS from {0}: {1}'), title, content)
              } else if (type === 'call') {
                const callerName = params.callerName || title || ''
                const phoneNumber =
                  params.phoneNumber ||
                  params.callerNumber ||
                  (content !== callerName ? content : '')
                if (callerName && phoneNumber && callerName !== phoneNumber) {
                  announcement = format(
                    gettext('Incoming call from {0}, number {1}'),
                    callerName,
                    phoneNumber
                  )
                } else {
                  announcement = format(
                    gettext('Incoming call from {0}'),
                    callerName || phoneNumber || gettext('Unknown')
                  )
                }
              } else if (type === 'missed_call') {
                announcement = format(gettext('Missed call from {0}'), title || gettext('Unknown'))
              } else {
                announcement = format(
                  gettext('Notification from {0}: {1}. {2}'),
                  appName,
                  title,
                  content
                )
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
              if (globalThis.ScreenReaderConfig) {
                globalThis.ScreenReaderConfig[key] = value
                saveSettings(globalThis.ScreenReaderConfig)
              }
            } else if (key === 'resetSettingsSignal') {
              // "Reset All Settings" button (setting/DeveloperSettings.js)
              // previously just stored a timestamp nobody read.
              const defaults = JSON.parse(JSON.stringify(ServerConfig))
              globalThis.ScreenReaderConfig = defaults
              saveSettings(defaults)
              await ScreenReader.speak(gettext('All settings have been reset to defaults.'), {
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
                format(
                  gettext('Debug log summary: {0} errors recorded, {1} recovered.'),
                  stats.total,
                  stats.recovered
                ),
                { priority: 'high', force: true }
              )
            } else if (globalThis.ScreenReaderConfig && key !== undefined) {
              globalThis.ScreenReaderConfig[key] = value
              // CRITICAL FIX: every setting changed from the phone's
              // Settings App was only ever updated in-memory here - never
              // persisted to device storage. That meant every single
              // preference silently reverted to defaults the moment ZSR
              // restarted on the watch (app relaunch, device reboot),
              // regardless of how many settings screens correctly wrote
              // to config.js's schema. saveSettings() must run on every
              // update, not just the special-cased reset/braille-table
              // paths above.
              saveSettings(globalThis.ScreenReaderConfig)
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
      }

      // Phone -> watch delivery has two shapes, and BOTH must be handled:
      //  - side service `messageBuilder.call(...)` (fire-and-forget) is emitted
      //    on the device as a 'call' event whose argument IS the payload
      //    (payload bytes in `.payload`);
      //  - side service `messageBuilder.request(...)` is emitted as 'request'
      //    with `ctx.request.payload` and expects a response.
      // Only 'request' was handled before, so every setting change and
      // notification sent with call() was silently dropped.
      messageBuilder.on('call', (fullPayload) => handleIncoming(fullPayload && fullPayload.payload))
      messageBuilder.on('request', async (ctx) => {
        await handleIncoming(ctx.request.payload)
        try {
          ctx.response({ data: { result: 'OK' } })
        } catch (_e) {
          /* requester may have gone away */
        }
      })

      // Restore state and re-enable if it was on
      if (globalThis.ScreenReaderConfig?.autoStart !== false) {
        ScreenReader.enabled = true
        // Delay greeting to ensure TTS is ready
        setTimeout(() => {
          ScreenReader.vibration.vibrate('success')
          ScreenReader.speak(gettext('ZSR Started'), { priority: 'high' })
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
    // Must match the "permissions" array in app.json, and only lists codes that
    // the official documentation / typings publish: getDeviceInfo, localStorage
    // and the health sensors ZSR reads aloud on request. Audio playback and
    // recording ('@zos/media'), @zos/ble and the Vibrator document no
    // permission code, and ZSR uses no camera API, so none is requested.
    const permissions = [
      'data:os.device.info',
      'device:os.local_storage',
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
    // Free the audio player: the media docs call release() when playback is over.
    try {
      SpeechPlayer.dispose()
    } catch (_e) {
      /* nothing to release */
    }
    // Use getApp() to access globalData — avoids the 'this' type mismatch
    // in the @zeppos/device-types App Option definition which does not expose
    // globalData on the lifecycle context.
    const app = getApp()
    if (app._options.globalData && app._options.globalData.messageBuilder) {
      app._options.globalData.messageBuilder.disConnect()
    }
  }
})
