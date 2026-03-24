import { Section, Row, Text, Select, Toggle } from '@zeppos/zml'

export default function renderDocument(_props) {
  return [
    Section({ title: 'Document Settings' }, [
      Row([
        Text('Navigation mode'),
        Select({
          settingsKey: 'docNavMode',
          options: [
            { label: 'Standard', value: 'standard' },
            { label: 'Strict', value: 'strict' }
          ]
        })
      ]),
      Row([Text('Announce formatting'), Toggle({ settingsKey: 'announceFormatting' })]),
      Row([
        Text('Browse mode behavior'),
        Select({
          settingsKey: 'browseBehavior',
          options: [
            { label: 'Automatic', value: 'auto' },
            { label: 'Manual', value: 'manual' }
          ]
        })
      ])
    ])
  ]
}
