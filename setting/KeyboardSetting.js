import { Row, SelectField } from './ui.js'

// Distinct from InputCompositionSetting's "Echo Behavior" (which covers
// how typed text in a field is echoed back). This covers the on-screen /
// braille keyboard's own key-press feedback and layout.
export default function renderKeyboard(_props) {
  return [
    Section({ title: 'Keyboard' }, [
      Row([
        Text({}, 'Announce Key Presses (experimental, not active yet)'),
        Toggle({ settingsKey: 'keyboardShortcutsEnabled' })
      ]),
      Row([
        Text({}, 'Key Press Echo (experimental, not active yet)'),
        SelectField({
          settingsKey: 'keyboardEchoMode',
          options: [
            { label: 'Character', value: 'character' },
            { label: 'Word', value: 'word' },
            { label: 'None', value: 'none' }
          ]
        })
      ]),
      Row([
        Text({}, 'Keyboard Layout (experimental, not active yet)'),
        SelectField({
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
