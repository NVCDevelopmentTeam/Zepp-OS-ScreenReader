import { Section, Row, Text, Select, Toggle } from '@zeppos/zml'

// Swipe-direction-to-action mapping lives in InputGestureSetting.js
// ("Gesture Actions"), where the settingsKey names match what
// lib/interaction/gesture.js actually reads. This file covers the other,
// non-swipe input remapping options.
export default function renderGesturesInput(_props) {
  return [
    Section({ title: 'Gestures & Input' }, [
      Row([Text('Button Remapping'), Toggle({ settingsKey: 'buttonRemappingEnabled' })]),
      Row([Text('Fingerprint Actions'), Toggle({ settingsKey: 'fingerprintActions' })]),
      Row([
        Text('Keyboard Mode'),
        Select({
          settingsKey: 'keyboardMode',
          options: [
            { label: 'Standard', value: 'standard' },
            { label: 'Accessibility', value: 'accessibility' }
          ]
        })
      ]),
      Row([Text('Braille Keyboard'), Toggle({ settingsKey: 'brailleKeyboardEnabled' })])
    ])
  ]
}
