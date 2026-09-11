import { Section, Row, Text, Select } from '@zeppos/zml'

// Overall text scale lives in DisplaySetting.js's "ZSR Text Scale" slider.
// This screen covers typeface style, which is a separate, orthogonal
// choice from size.
export default function renderFont(_props) {
  return [
    Section({ title: 'Font Style' }, [
      Row([
        Text('Font Family'),
        Select({
          settingsKey: 'fontFamily',
          options: [
            { label: 'Default', value: 'default' },
            { label: 'Monospace', value: 'monospace' },
            { label: 'Large Print', value: 'large-print' }
          ]
        })
      ]),
      Row([
        Text('Font Weight'),
        Select({
          settingsKey: 'fontWeight',
          options: [
            { label: 'Normal', value: 'normal' },
            { label: 'Bold', value: 'bold' }
          ]
        })
      ])
    ])
  ]
}
