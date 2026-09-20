// HONESTY NOTE: no on-screen/braille keyboard input pipeline exists in
// lib/ yet (lib/extensions/keyboard.js and virtualKeyboard.js are unused
// scaffolding - see setting/KeyboardSetting.js's own notes), so
// 'echoBehavior', 'announceAutocomplete', and 'announceSelection' are all
// persisted safely but not yet backed by real behavior.
export default function renderInputComposition(_props) {
  return [
    Section({ title: 'Input Composition' }, [
      Row([
        Text('Echo Behavior (feature not yet built)'),
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
      Row([
        Text('Autocomplete suggestions (feature not yet built)'),
        Toggle({ settingsKey: 'announceAutocomplete' })
      ]),
      Row([
        Text('Selection changes (feature not yet built)'),
        Toggle({ settingsKey: 'announceSelection' })
      ])
    ])
  ]
}
