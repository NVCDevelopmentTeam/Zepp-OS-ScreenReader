import { Section, Row, Text, Toggle, Select } from '@zeppos/zml'

// Toggle keys match the actual menu items built in
// lib/components/contextMenu.js's show() method 1:1 (settingsKey
// 'menuShow<Item>') so this screen can genuinely hide/show entries instead
// of listing options that don't exist in the real menu. "Cancel" always
// shows and isn't listed here since hiding the only way to close the menu
// would trap the user.
export default function renderMenu(_props) {
  return [
    Section({ title: 'Context Menu' }, [
      Row([Text('Read from Top'), Toggle({ settingsKey: 'menuShowReadFromTop' })]),
      Row([Text('Read from Bottom'), Toggle({ settingsKey: 'menuShowReadFromBottom' })]),
      Row([Text('Cycle Navigation Mode'), Toggle({ settingsKey: 'menuShowCycleNavigationMode' })]),
      Row([Text('Object Details'), Toggle({ settingsKey: 'menuShowObjectDetails' })]),
      Row([Text('Screen Curtain'), Toggle({ settingsKey: 'menuShowScreenCurtain' })]),
      Row([Text('Read Sensors'), Toggle({ settingsKey: 'menuShowReadSensors' })]),
      Row([Text('Read Status Bar'), Toggle({ settingsKey: 'menuShowReadStatusBar' })]),
      Row([Text('Screen Recognition (OCR)'), Toggle({ settingsKey: 'menuShowScreenRecognition' })]),
      Row([Text('Photo Guidance'), Toggle({ settingsKey: 'menuShowPhotoGuidance' })]),
      Row([Text('Image Description'), Toggle({ settingsKey: 'menuShowImageDescription' })]),
      Row([Text('Spell Out'), Toggle({ settingsKey: 'menuShowSpellOut' })]),
      Row([Text('Braille Keyboard'), Toggle({ settingsKey: 'menuShowBrailleKeyboard' })]),
      Row([Text('Repeat Last'), Toggle({ settingsKey: 'menuShowRepeatLast' })]),
      Row([
        Text('Menu Order'),
        Select({
          settingsKey: 'menuOrder',
          options: [
            { label: 'Default', value: 'default' },
            { label: 'Alphabetical', value: 'alphabetical' }
          ]
        })
      ])
    ])
  ]
}
