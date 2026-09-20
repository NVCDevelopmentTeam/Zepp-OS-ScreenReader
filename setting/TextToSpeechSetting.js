// Voice gender/character is chosen once, in setting/VoiceSetting.js's
// "Voice Preset" (settingsKey 'voicePreset') - it's wired to espeak-ng's
// voice-variant suffixes in lib/TTSSystem/EspeakTTSEngine.js. This screen
// intentionally doesn't duplicate that control.
//
// HONESTY NOTE: "Voice Quality" is persisted but not yet wired to real
// behavior. The espeak-ng synthesis path used here (lib/TTSSystem/
// EspeakTTSEngine.js -> side-service SPEAK request) doesn't expose a
// quality/sample-rate parameter, so this control has no real backing
// implementation yet rather than something we could safely fake.
export default function renderTextToSpeech(_props) {
  return [
    Section({ title: 'Text-to-Speech Engine' }, [
      Row([
        Text('Voice Quality'),
        Select({
          settingsKey: 'ttsQuality',
          options: [
            { label: 'Standard', value: 'standard' },
            { label: 'High', value: 'high' }
          ]
        })
      ])
    ])
  ]
}
