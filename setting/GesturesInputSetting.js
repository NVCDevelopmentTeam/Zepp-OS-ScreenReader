// Swipe-direction-to-action mapping lives in InputGestureSetting.js
// ("Gesture Actions"), where the settingsKey names match what
// lib/interaction/gesture.js actually reads. This file covers the other,
// non-swipe input remapping options.
export default function renderGesturesInput(_props) {
  return [
    Section({ title: 'Gestures & Input' }, [
      Row([
        Text('Button Remapping (experimental, not active yet)'),
        Toggle({ settingsKey: 'buttonRemappingEnabled' })
      ]),
      Row([
        Text('Fingerprint Actions (experimental, not active yet)'),
        Toggle({ settingsKey: 'fingerprintActions' })
      ]),
      Row([
        Text('Keyboard Mode (experimental, not active yet)'),
        Select({
          settingsKey: 'keyboardMode',
          options: [
            { label: 'Standard', value: 'standard' },
            { label: 'Accessibility', value: 'accessibility' }
          ]
        })
      ]),
      Row([
        Text('Invert Swipes (Vertical/Horizontal)'),
        Toggle({ settingsKey: 'invertSwipeGestures' })
      ]),
      Row([
        Text('Braille Keyboard (experimental, not active yet)'),
        Toggle({ settingsKey: 'brailleKeyboardEnabled' })
      ])
    ])
  ]
}
