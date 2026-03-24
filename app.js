import './shared/device-polyfill.js'
import { MessageBuilder } from './shared/message.js'
import { getPackageInfo, permission } from '@zos/app'
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
      await ScreenReader.init().catch((e) => log.error('ScreenReader init failed:', e))

      ShortcutHandler.init()
      GestureHandler.init()
      VoiceControlService.init()
      AccessibilityService.init()

      // 4. Handle incoming messages
      messageBuilder.on('request', async (ctx) => {
        const jsonRpc = messageBuilder.buf2Json(ctx.request.payload)
        const { method, params } = jsonRpc

        try {
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
            if (globalThis.ScreenReaderConfig) {
              globalThis.ScreenReaderConfig[key] = value
            }
          }
        } catch (error) {
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

    try {
      if (permission && permission.request) {
        permission.request({
          permissions,
          success: (res) => {
            console.log('Permissions granted successfully:', res)
          },
          fail: (error) => {
            console.error('Permission request failed:', error)
          }
        })
      }
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
