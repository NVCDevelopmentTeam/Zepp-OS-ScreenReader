import { Section, Row, Text, Select } from '@zeppos/zml'

// This is the one real, wired voice-character control: lib/TTSSystem/
// EspeakTTSEngine.js maps this preset onto an espeak-ng voice-variant
// suffix (e.g. "en-US+f3" for Female) whenever the primary engine is
// espeak. TextToSpeechSetting.js's "Voice Quality" is a separate,
// independent control - not yet wired to real behavior.
export default function renderVoice(_props) {
  return [
    Section({ title: 'Voice Preset' }, [
      Row([
        Text('Voice'),
        Select({
          settingsKey: 'voicePreset',
          options: [
            { label: 'Male', value: 'male' },
            { label: 'Female', value: 'female' },
            { label: 'Child', value: 'child' }
          ]
        })
      ])
    ])
  ]
}
