/**
 * Settings and signals that arrive from the phone's Settings App (`SETTING_UPDATE`).
 *
 * Settings Storage holds strings only, so a value is converted to the type of the setting's
 * default first. Only settings ZSR knows are stored: the phone's own UI state (selected tab, ...)
 * and unknown keys are ignored. Buttons in the Settings App arrive as "signals" (a changing
 * time stamp) and run an action instead of storing a value.
 */
import { gettext } from '../utils/i18n.js'
import ScreenReader from './screenReader.js'
import BrailleService from './braille.js'
import SpeechHistory from '../utils/speechHistory.js'
import AccessibilityService from './accessibility.js'
import { ServerConfig, saveSettings } from './config.js'
import { coerceSettingValue } from '../utils/settingValue.js'
import { sendReportAndSpeakResult } from '../utils/diagnosticReport.js'
import { backupSettingsAndSpeak, restoreSettingsAndSpeak } from './settingsBackupActions.js'

/**
 * @param {string} key
 * @param {any} value
 */
export async function applyPhoneSetting(key, value) {
  if (key === 'clearHistorySignal') {
    // "Clear History" button (setting/SpeechHistorySetting.js)
    // previously just stored a timestamp nobody read.
    SpeechHistory.clear()
  } else if (key === 'brailleTable') {
    // Previously the raw config value updated, but
    // BrailleService's own internal `currentTable` (what
    // translation actually uses) never synced with it.
    const table = coerceSettingValue(value, ServerConfig.brailleTable)
    BrailleService.setTable(table)
    if (globalThis.ScreenReaderConfig) {
      globalThis.ScreenReaderConfig[key] = table
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
  } else if (key === 'backupSignal') {
    // "Back up from the watch" on the phone (setting/AdvancedSettings.js)
    await backupSettingsAndSpeak()
  } else if (key === 'restoreSettingsText') {
    // "Restore to the watch": validated as a whole, or nothing changes
    if (await restoreSettingsAndSpeak(String(value))) AccessibilityService.applyRemoteTimer()
  } else if (key === 'exportLogSignal') {
    // "Prepare report" on the phone: build the problem report and hand it
    // back to the Side Service, which stores it for the Settings App's
    // ready-made e-mail link. The outcome is spoken.
    await sendReportAndSpeakResult()
  } else if (
    globalThis.ScreenReaderConfig &&
    typeof key === 'string' &&
    Object.prototype.hasOwnProperty.call(ServerConfig, key)
  ) {
    // Only settings ZSR knows: the phone's own UI state (selected tab, ...) and any
    // other key are not stored in the reader's configuration.
    // Settings Storage holds strings only ('false' is truthy), so convert to
    // the type of the setting's default before using it.
    globalThis.ScreenReaderConfig[key] = coerceSettingValue(value, ServerConfig[key])
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
    if (key === 'remoteAccessEnabled' || key === 'performanceMode' || key === 'autoBatterySaver') {
      AccessibilityService.applyRemoteTimer()
    }
  }
}
