// Master on/off for these sounds lives in Feedback > "Sound Feedback"
// (settingsKey 'soundFeedbackEnabled'), since that toggle already gates
// the confirmation/error/click sounds this player produces. This screen
// only picks which asset pack ("Sound Scheme", Jieshuo's term) is used.
export default function renderSound(_props) {
  return [
    Section({ title: 'Sound Effects' }, [
      Row([
        Text('Sound Theme'),
        Select({
          settingsKey: 'soundTheme',
          options: [
            { label: 'Default', value: 'default' },
            { label: 'Classic', value: 'classic' },
            { label: 'Minimal', value: 'minimal' }
          ]
        })
      ])
    ])
  ]
}
