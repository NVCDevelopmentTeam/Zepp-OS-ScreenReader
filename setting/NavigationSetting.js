import { Row, SelectField } from './ui.js'

export default function renderNavigation(_props) {
  return [
    Section({ title: 'Cursor & Navigation' }, [
      Row([Text({}, 'Announce screen regions'), Toggle({ settingsKey: 'announceRegions' })]),
      Row([Text({}, 'Review Cursor'), Toggle({ settingsKey: 'reviewCursor' })]),
      Row([
        Text({}, 'Cursor Style'),
        SelectField({
          settingsKey: 'cursorStyle',
          options: [
            { label: 'Border', value: 'border' },
            { label: 'Highlight', value: 'highlight' },
            { label: 'None', value: 'none' }
          ]
        })
      ]),
      Row([
        Text({}, 'Cursor Color'),
        SelectField({
          settingsKey: 'cursorColor',
          options: [
            { label: 'Green', value: '00ff00' },
            { label: 'Yellow', value: 'ffff00' },
            { label: 'Cyan', value: '00ffff' },
            { label: 'White', value: 'ffffff' },
            { label: 'Orange', value: 'ff8800' }
          ]
        })
      ]),
      Row([
        Text({}, 'Browse Mode Order'),
        SelectField({
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
