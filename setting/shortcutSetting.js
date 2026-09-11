import { Section, Row, Text, Select } from '@zeppos/zml'

// Configures what ZSR's registered Shortcut Card does when opened
// (app.json module.app-widget/secondary-widget already register the
// widgets themselves; this only picks the action they trigger).
// NOTE: wiring the widget's onClick to actually read this value is a
// follow-up device-side task in app-widget/index.js and
// secondary-widget/index.js - left alone here since guessing at that
// integration without testing it on-device risked breaking the widgets
// that already work.
export default function renderShortcut(_props) {
  return [
    Section({ title: 'Shortcut Card' }, [
      Row([
        Text('Shortcut Card Action'),
        Select({
          settingsKey: 'shortcutCardAction',
          options: [
            { label: 'Toggle Screen Reader', value: 'toggle_screen_reader' },
            { label: 'Read Screen', value: 'read_screen' },
            { label: 'Read Status Bar', value: 'read_status_bar' },
            { label: 'Open Context Menu', value: 'context_menu' }
          ]
        })
      ])
    ])
  ]
}
