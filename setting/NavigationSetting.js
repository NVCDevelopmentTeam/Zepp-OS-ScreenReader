import { Section, Row, Text, Select, Toggle } from '@zeppos/zml'

export default function renderNavigation(_props) {
  return [
    Section({ title: 'Cursor & Navigation' }, [
      Row([Text('Review Cursor'), Toggle({ settingsKey: 'reviewCursor' })]),
      Row([
        Text('Cursor Style'),
        Select({
          settingsKey: 'cursorStyle',
          options: [
            { label: 'Border', value: 'border' },
            { label: 'Highlight', value: 'highlight' },
            { label: 'None', value: 'none' }
          ]
        })
      ]),
      Row([
        Text('Browse Mode Order'),
        Select({
          settingsKey: 'browseOrder',
          options: [
            { label: 'Default', value: 'default' },
            { label: 'By Type', value: 'type' }
          ]
        })
      ])
    ])
  ]
}
