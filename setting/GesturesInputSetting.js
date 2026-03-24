import { Section, Row, Text, Select, Toggle } from '@zeppos/zml'

export default function renderGesturesInput(_props) {
  return [
    Section({ title: 'Gestures & Input' }, [
      Row([
        Text('Single Finger Swipe Left'),
        Select({
          settingsKey: 'gestureSwipeLeft',
          options: [
            { label: 'Previous Item', value: 'prev_item' },
            { label: 'Next Item', value: 'next_item' },
            { label: 'Back', value: 'back' }
          ]
        })
      ]),
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
