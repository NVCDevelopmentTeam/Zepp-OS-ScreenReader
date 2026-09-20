export default function renderAudioBraille(_props) {
  return [
    Section({ title: 'Audio & Braille' }, [
      Row([Text('Braille Output'), Toggle({ settingsKey: 'brailleEnabled' })]),
      Row([
        Text('Braille Table'),
        Select({
          settingsKey: 'brailleTable',
          options: [
            { label: 'English (US)', value: 'en-US' },
            { label: 'Vietnamese', value: 'vi' }
          ]
        })
      ]),
      Row([
        // HONESTY NOTE: no documented Zepp OS API for choosing TTS audio
        // output routing (speaker vs Bluetooth) was found - the system
        // handles audio routing automatically based on what's connected.
        // Left as a persisted, non-crashing choice rather than removed.
        Text('Audio Routing (not yet supported by Zepp OS)'),
        Select({
          settingsKey: 'audioRouting',
          options: [
            { label: 'System Default', value: 'default' },
            { label: 'Bluetooth Only', value: 'bluetooth' }
          ]
        })
      ])
    ])
  ]
}
