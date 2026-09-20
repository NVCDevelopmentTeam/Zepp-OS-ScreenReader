// AudioBrailleSetting.js covers braille *output* (enable + translation
// table). This screen covers braille *input*.
//
// "Braille Input Mode" is the one control wired to real code: its values
// match lib/components/BrailleKeyboard.js's actual setMode('6dot'|'8dot')
// API 1:1, applied whenever the braille keyboard is opened (see
// lib/components/contextMenu.js's openBrailleKeyboard()).
//
// HONESTY NOTE: "Braille Display Mode" and "Braille Keyboard Layout" are
// persisted but not yet wired - BrailleKeyboard.js has no on-screen
// display widget yet (it only tracks the dot pattern/state) and no
// per-language layout concept, so there's no real behavior to attach
// these to today.
export default function renderBraille(_props) {
  return [
    Section({ title: 'Braille Input' }, [
      Row([
        Text('Braille Display Mode'),
        Select({
          settingsKey: 'brailleDisplayMode',
          options: [
            { label: 'Automatic', value: 'auto' },
            { label: 'Manual', value: 'manual' }
          ]
        })
      ]),
      Row([
        Text('Braille Input Mode'),
        Select({
          settingsKey: 'brailleInputMode',
          options: [
            { label: '6-dot', value: '6dot' },
            { label: '8-dot', value: '8dot' }
          ]
        })
      ]),
      Row([
        Text('Braille Keyboard Layout'),
        Select({
          settingsKey: 'brailleKeyboardLayout',
          options: [
            { label: 'English (US)', value: 'en-US' },
            { label: 'Vietnamese', value: 'vi-VN' }
          ]
        })
      ])
    ])
  ]
}
