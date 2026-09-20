// This is the one real, wired voice-character control: lib/TTSSystem/
// EspeakTTSEngine.js maps this preset onto an espeak-ng voice-variant
// suffix (e.g. "en-US+f3" for Female) whenever the primary engine is
// espeak. TextToSpeechSetting.js's "Voice Quality" is a separate,
// independent control - not yet wired to real behavior.
export default function renderVoice(_props) {
  return [
    Section({ title: 'Voice Preset' }, [
      Row([
        Text('Voice Variant'),
        Select({
          settingsKey: 'voicePreset',
          options: [
            { label: 'English US (Male 2 - Default)', value: 'male2' },
            { label: 'Male 1', value: 'male1' },
            { label: 'Male 3', value: 'male3' },
            { label: 'Female 1', value: 'female1' },
            { label: 'Female 2', value: 'female2' },
            { label: 'Female 3', value: 'female3' },
            { label: 'Child (Approximation)', value: 'child' }
          ]
        })
      ])
    ])
  ]
}
