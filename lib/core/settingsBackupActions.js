/**
 * Backup and restore as the user experiences them: every outcome is spoken, and a copy of the
 * backup is handed to the phone so it survives a reset of the watch.
 */
import { log } from '@zos/utils'
import { gettext } from '../utils/i18n.js'
import {
  createBackup,
  parseBackup,
  restoreBackup,
  saveLocalBackup,
  loadLocalBackup
} from './settingsBackup.js'

/** @param {string} text */
function say(text) {
  const reader = globalThis.ScreenReaderInstance
  if (reader && typeof reader.speak === 'function') {
    return reader.speak(text, { priority: 'high', force: true })
  }
  return undefined
}

/** @param {string} code error from parseBackup @returns {string} */
export function backupErrorText(code) {
  switch (code) {
    case 'NEWER_SCHEMA':
      return gettext('This backup is from a newer version of ZSR and cannot be restored.')
    case 'TOO_LARGE':
      return gettext('The backup is too large.')
    case 'EMPTY':
      return gettext('The backup is empty.')
    case 'NOT_ZSR':
    case 'NO_SETTINGS':
      return gettext('This is not a ZSR backup.')
    default:
      return gettext('The backup could not be read.')
  }
}

/**
 * Back up the settings on the watch and send a copy to the phone.
 * @returns {Promise<'sent' | 'local'>}
 */
export async function backupSettingsAndSpeak() {
  const backup = saveLocalBackup(globalThis.ScreenReaderConfig || {})
  let sent = false
  try {
    const app = getApp()
    const builder =
      app && app._options && app._options.globalData && app._options.globalData.messageBuilder
    if (builder) {
      const answer = await builder.request(
        { method: 'SETTINGS_BACKUP', params: { backup } },
        { timeout: 15000 }
      )
      sent = !!answer && answer.result === 'OK'
    }
  } catch (e) {
    log.warn('Settings backup could not be sent to the phone: ' + String(e))
  }
  await say(
    sent
      ? gettext('Settings backed up. A copy was sent to your phone.')
      : gettext('Settings backed up on the watch. The phone could not be reached.')
  )
  return sent ? 'sent' : 'local'
}

/**
 * Restore a backup (text from the phone, or the one kept on the watch when no text is given).
 * @param {string} [text]
 * @returns {Promise<boolean>} true when the settings were replaced
 */
export async function restoreSettingsAndSpeak(text) {
  // The phone prefixes a time stamp so that restoring the same text twice is still a change.
  const raw =
    typeof text === 'string' ? text.slice(Math.max(0, text.indexOf('{'))) : loadLocalBackup()
  if (!raw) {
    await say(gettext('No backup was found.'))
    return false
  }
  const result = restoreBackup(raw)
  if ('error' in result) {
    await say(backupErrorText(result.error))
    return false
  }
  await say(gettext('Settings restored.'))
  return true
}

export { createBackup, parseBackup }
