/**
 * Problem report a blind user can send to the developers without help.
 *
 * Flow: watch -> (this module builds an English, non-personal report) -> phone
 * Side Service -> Settings Storage -> the Settings App shows a ready-made
 * e-mail link. Nothing leaves the phone unless the user sends that e-mail.
 *
 * The report holds ONLY: ZSR version, Zepp OS API level, device model and
 * screen, language, feature support and recent internal error messages. It
 * never includes health data, notifications, spoken text or settings values.
 */
import { log } from '@zos/utils'
import { safeDeviceInfo } from './deviceInfo.js'
import { getApiCapabilityLevel } from './apiCapability.js'
import { getFeatureRegistry } from './featureSupport.js'
import { getRecentErrors } from './errorBuffer.js'
import { announceBootProblems, getBootErrors } from './bootErrors.js'
import { ZSR_VERSION } from './version.js'
import { gettext } from './i18n.js'

/** Maximum report length: keeps the e-mail link within what mail apps accept. */
const MAX_REPORT_CHARS = 1500
const SEND_TIMEOUT_MS = 8000

/** Control characters other than newline are removed from the report. */
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u0009\u000b-\u001f\u007f]/g

/** @returns {string} English report text, at most MAX_REPORT_CHARS long */
export function buildDiagnosticReport() {
  const info = safeDeviceInfo()
  const config = globalThis.ScreenReaderConfig || {}
  const lines = [
    `ZSR ${ZSR_VERSION}`,
    `API level ${getApiCapabilityLevel()}`,
    `Device ${String(info.deviceName)} (${String(info.deviceSource)}), ${info.width}x${info.height}, shape ${info.screenShape}, keys ${info.keyNumber}`,
    `Language ${config.language || 'default'}, engine ${config.primaryTTSEngine || 'espeak'}`,
    `Safe mode ${globalThis.ZSRSafeMode ? 'on' : 'off'}`
  ]
  try {
    getFeatureRegistry().forEach((f) => lines.push(`${f.id}: ${f.state}`))
  } catch (_e) {
    lines.push('feature list unavailable')
  }
  const errors = getRecentErrors()
  lines.push(errors.length === 0 ? 'No errors recorded' : `Errors (${errors.length}):`)
  errors.slice(-8).forEach((e) => lines.push(`- ${e.source}: ${e.message}`))
  return lines.join('\n').replace(CONTROL_CHARS, ' ').slice(0, MAX_REPORT_CHARS)
}

/**
 * Hand the report to the phone. Resolves to 'sent', 'no-phone' (no connection
 * to the Side Service) or 'failed'; never throws.
 * @returns {Promise<'sent' | 'no-phone' | 'failed'>}
 */
export async function sendReportToPhone() {
  try {
    const app = getApp()
    const builder =
      app && app._options && app._options.globalData && app._options.globalData.messageBuilder
    if (!builder) return 'no-phone'
    const answer = await builder.request(
      { method: 'DIAGNOSTIC_REPORT', params: { report: buildDiagnosticReport() } },
      { timeout: SEND_TIMEOUT_MS }
    )
    return answer && answer.result === 'OK' ? 'sent' : 'failed'
  } catch (e) {
    log.warn('Report could not be sent to the phone: ' + String(e))
    return 'failed'
  }
}

/**
 * After a start-up problem: vibrate and speak (see bootErrors), then prepare the
 * e-mail report on the phone so the user only has to open the Zepp app.
 */
export async function announceAndReportBootProblems() {
  if (getBootErrors().length === 0) return
  announceBootProblems()
  const outcome = await sendReportToPhone()
  if (outcome !== 'sent') return
  try {
    const reader = globalThis.ScreenReaderInstance
    if (reader && typeof reader.speak === 'function') {
      await reader.speak(
        gettext(
          'A problem report was sent to your phone. In the Zepp app, open ZSR settings, then Report a problem, to email it.'
        ),
        { priority: 'high' }
      )
    }
  } catch (e) {
    log.warn('Report notice could not be spoken: ' + String(e))
  }
}

/**
 * Send the report and tell the user the outcome in words (they cannot read the
 * screen). Used by the Contact page button and by "Prepare report" on the phone.
 */
export async function sendReportAndSpeakResult() {
  const outcome = await sendReportToPhone()
  const text =
    outcome === 'sent'
      ? gettext(
          'Report sent to your phone. In the Zepp app, open ZSR settings, then Report a problem, to email it.'
        )
      : gettext(
          'The report could not be sent. Keep the watch connected to the phone and try again.'
        )
  try {
    const reader = globalThis.ScreenReaderInstance
    if (reader && typeof reader.speak === 'function') {
      await reader.speak(text, { priority: 'high', force: true })
    }
  } catch (e) {
    log.warn('Report result could not be spoken: ' + String(e))
  }
  return outcome
}
