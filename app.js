import './shared/device-polyfill.js'
import { MessageBuilder } from './shared/message.js'
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
      log.error('Failed to load settings:', e)
      globalThis.ScreenReaderConfig = {}
    }

    try {
      // 1. Initialize core communications
      const { appId } = getPackageInfo()
      const messageBuilder = new MessageBuilder({
        appId,
        ble
      })

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
            const { title = '', content = '', appName = 'System', type = 'push' } = params
            let announcement = ''

            if (type === 'sms') {
              announcement = `New SMS from ${title}: ${content}`
            } else if (type === 'call') {
              announcement = `Incoming call from ${title}. ${content}`
            } else if (type === 'missed_call') {
              announcement = `Missed call from ${title}`
            } else {
              announcement = `Notification from ${appName}: ${title}. ${content}`
            }

            await ScreenReader.speak(announcement, { priority: 'high', secondary: true })
          } else if (method === 'SETTING_UPDATE') {
            const { key, value } = params
            if (globalThis.ScreenReaderConfig && key !== undefined) {
              globalThis.ScreenReaderConfig[key] = value
            }
          }
        } catch (error) {
          // A malformed/corrupted BLE payload (dropped bytes, mid-transfer
          // disconnect, etc.) would otherwise throw inside JSON.parse and
          // crash this handler as an unhandled rejection. Parsing now lives
          // inside the try block so a single bad message can't take down
          // message handling for the rest of the session.
          log.error('App Message Receive Error:', error)
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
      log.error('App onCreate fatal error:', error)
    }
  },

  onBoot() {
    console.log('app on boot invoke')
  },

  async initScreenReaderWithRecovery() {
    const config = globalThis.ScreenReaderConfig || {}
    const autoRecoveryEnabled = config.autoRecoveryEnabled !== false
    const maxAttempts = autoRecoveryEnabled ? Math.max(1, config.maxRecoveryAttempts || 3) : 1
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
          log.error(`ScreenReader init failed after ${attempt} attempt(s), giving up:`, error)
          return
        }
        log.warn(`ScreenReader init failed (attempt ${attempt}/${maxAttempts}), retrying...`, error)
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
      'data:user.hd.stress'
    ]

    // @zos/app has no `permission` object - the real Zepp OS 2.0/3.0 API is
    // the standalone requestPermission() function, and its result comes
    // back through a single `callback` (not separate success/fail
    // handlers). See
    // https://docs.zepp.com/docs/reference/device-app-api/newAPI/app/requestPermission/
    try {
      requestPermission({
        permissions,
        callback: (result) => {
          console.log('Permission request result:', result)
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
    if (this.globalData && this.globalData.messageBuilder) {
      this.globalData.messageBuilder.disConnect()
    }
  }
})
