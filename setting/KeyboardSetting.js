import { Section, Row, Text, Toggle, Select } from '@zeppos/zml'

// Distinct from InputCompositionSetting's "Echo Behavior" (which covers
// how typed text in a field is echoed back). This covers the on-screen /
// braille keyboard's own key-press feedback and layout.
export default function renderKeyboard(_props) {
  return [
    Section({ title: 'Keyboard' }, [
      Row([Text('Announce Key Presses'), Toggle({ settingsKey: 'keyboardShortcutsEnabled' })]),
      Row([
        Text('Key Press Echo'),
        Select({
          settingsKey: 'keyboardEchoMode',
          options: [
            { label: 'Character', value: 'character' },
            { label: 'Word', value: 'word' },
            { label: 'None', value: 'none' }
          ]
        })
      ]),
      Row([
        Text('Keyboard Layout'),
        Select({
          settingsKey: 'keyboardLayout',
          options: [
            { label: 'English (US)', value: 'en-US' },
            { label: 'Vietnamese', value: 'vi-VN' }
          ]
        })
      ])
    ])
  ]
}
