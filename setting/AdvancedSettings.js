import { Row, SelectField } from './ui.js'

/**
 * Advanced: performance (battery saver) and backup / restore of the watch's settings.
 * @param {any} props Settings App props
 */
export default function renderAdvanced(props) {
  const backup = props.settingsStorage.getItem('settingsBackupText') || ''
  const stored = Number(props.settingsStorage.getItem('settingsBackupTime'))
  const when = stored ? new Date(stored).toLocaleString() : ''

  return [
    Section({ title: 'Performance' }, [
      Row([
        Text({}, 'Performance mode'),
        SelectField({
          settingsKey: 'performanceMode',
          options: [
            { label: 'Normal', value: 'normal' },
            { label: 'Battery saver', value: 'saver' }
          ]
        })
      ]),
      Row([
        Text({}, 'Switch to battery saver automatically at 15% battery'),
        Toggle({ settingsKey: 'autoBatterySaver' })
      ]),
      Row([
        Text(
          {},
          'Battery saver keeps the core reader running and turns off voice commands, extras, speech warm-up and interface sounds, and updates the phone link less often.'
        )
      ])
    ]),
    Section({ title: 'Online services (optional)' }, [
      Row([
        Text(
          {},
          'Voice commands, reading text in pictures, describing pictures and translation send audio, pictures or text to the service you choose here, only when you use them. The key stays on the phone: it is never sent to the watch.'
        )
      ]),
      Row([
        TextInput({
          label: 'Service address (for example https://api.openai.com/v1)',
          settingsKey: 'aiBaseUrl'
        })
      ]),
      Row([TextInput({ label: 'Service key', settingsKey: 'aiApiKey' })]),
      Row([TextInput({ label: 'Speech recognition model', settingsKey: 'aiSttModel' })]),
      Row([TextInput({ label: 'Picture model', settingsKey: 'aiVisionModel' })]),
      Row([TextInput({ label: 'Text and translation model', settingsKey: 'aiTextModel' })])
    ]),
    Section({ title: 'Translation' }, [
      Row([
        Text({}, 'Translation'),
        SelectField({
          settingsKey: 'translationMode',
          options: [
            { label: 'Off', value: 'off' },
            { label: 'Manual (menu: Translate)', value: 'manual' },
            { label: 'Automatic (also speak the translation)', value: 'auto' }
          ]
        })
      ]),
      Row([
        Text({}, 'Translate into'),
        SelectField({
          settingsKey: 'translationTarget',
          options: [
            { label: 'The interface language', value: '' },
            { label: 'English', value: 'en-US' },
            { label: 'Vietnamese', value: 'vi-VN' },
            { label: 'Chinese (Simplified)', value: 'zh-CN' }
          ]
        })
      ]),
      Row([
        Text({}, 'Translate from'),
        SelectField({
          settingsKey: 'translationSource',
          options: [
            { label: 'Detect automatically', value: 'auto' },
            { label: 'English', value: 'en-US' },
            { label: 'Vietnamese', value: 'vi-VN' },
            { label: 'Chinese (Simplified)', value: 'zh-CN' }
          ]
        })
      ]),
      Row([
        Text({}, 'Keep translations on the watch for offline use (up to 50 phrases)'),
        Toggle({ settingsKey: 'translationRemember' })
      ])
    ]),
    Section({ title: 'Backup and restore' }, [
      Row([
        Button({
          label: 'Back up settings from the watch',
          onClick: () => {
            props.settingsStorage.setItem('backupSignal', String(Date.now()))
          }
        })
      ]),
      Row([Text({}, backup ? `Last backup: ${when}` : 'No backup from the watch yet.')]),
      backup ? Row([Text({}, backup)]) : Row([Text({}, 'The backup text will appear here.')]),
      Row([
        TextInput({
          label: 'Paste a backup here to restore it',
          settingsKey: 'settingsRestoreInput'
        })
      ]),
      Row([
        Button({
          label: 'Restore settings to the watch',
          onClick: () => {
            const text = props.settingsStorage.getItem('settingsRestoreInput') || backup
            if (!text) return
            // The time stamp makes restoring the same text twice a new change.
            props.settingsStorage.setItem('restoreSettingsText', `${Date.now()}\n${text}`)
          }
        })
      ]),
      Row([
        Text(
          {},
          'Restoring replaces the settings on the watch. A backup that cannot be read, or that comes from a newer ZSR, changes nothing.'
        )
      ])
    ])
  ]
}
