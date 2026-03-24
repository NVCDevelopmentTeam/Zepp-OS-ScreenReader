import { Section, Row, Text, Select, Toggle } from '@zeppos/zml'

export default function renderInputComposition(_props) {
  return [
    Section({ title: 'Input Composition' }, [
      Row([
        Text('Echo Behavior'),
        Select({
          settingsKey: 'echoBehavior',
          options: [
            { label: 'Characters', value: 'chars' },
            { label: 'Words', value: 'words' },
            { label: 'Both', value: 'both' },
            { label: 'None', value: 'none' }
          ]
        })
      ]),
      Row([Text('Autocomplete suggestions'), Toggle({ settingsKey: 'announceAutocomplete' })]),
      Row([Text('Selection changes'), Toggle({ settingsKey: 'announceSelection' })])
    ])
  ]
}
