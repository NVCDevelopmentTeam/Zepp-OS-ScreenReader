import { Section, Row, Text, Toggle, Select, Button } from '@zeppos/zml'

export default function renderDeveloperOptions(props) {
  return [
    Section({ title: 'Developer Options' }, [
      Row([Text('Debug Logging'), Toggle({ settingsKey: 'debugLogging' })]),
      Row([Text('Verbose Speech'), Toggle({ settingsKey: 'verboseSpeech' })]),
      Row([
        Text('API Version Override'),
        Select({
          settingsKey: 'apiVersionOverride',
          options: [
            { label: 'Default', value: 'default' },
            { label: '3.0.0', value: '3.0.0' },
            { label: '2.0.0', value: '2.0.0' }
          ]
        })
      ]),
      Row([
        Button({
          label: 'Export Debug Log',
          onPress: () => {
            props.settingsStorage.setItem('exportLogSignal', Date.now())
          }
        })
      ]),
      Row([
        Button({
          label: 'Reset All Settings',
          onPress: () => {
            props.settingsStorage.setItem('resetSettingsSignal', Date.now())
          }
        })
      ])
    ])
  ]
}
