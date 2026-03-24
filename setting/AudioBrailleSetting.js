import { Section, Row, Text, Toggle, Select } from '@zeppos/zml'

export default function renderAudioBraille(_props) {
  return [
    Section({ title: 'Audio & Braille' }, [
      Row([Text('Braille Output'), Toggle({ settingsKey: 'brailleEnabled' })]),
      Row([
        Text('Braille Table'),
        Select({
          settingsKey: 'brailleTable',
          options: [
            { label: 'English (US)', value: 'en-US' },
            { label: 'Vietnamese', value: 'vi' }
          ]
        })
      ]),
      Row([
        Text('Audio Routing'),
        Select({
          settingsKey: 'audioRouting',
          options: [
            { label: 'System Default', value: 'default' },
            { label: 'Bluetooth Only', value: 'bluetooth' }
          ]
        })
      ])
    ])
  ]
}
