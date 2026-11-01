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
