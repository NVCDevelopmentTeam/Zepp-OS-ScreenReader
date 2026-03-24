import { Section, Row, Text, Toggle, Select, Slider } from '@zeppos/zml'

export default function renderSpeech(_props) {
  return [
    Section({ title: 'Speech' }, [
      Row([
        Text('Primary TTS Engine'),
        Select({
          settingsKey: 'primaryTTSEngine',
          options: [
            { label: 'eSpeak-NG', value: 'espeak' },
            { label: 'Native TTS', value: 'native' },
            { label: 'OpenAI (Cloud)', value: 'openai' }
          ]
        })
      ]),
      Row([
        Text('Secondary TTS Engine'),
        Select({
          settingsKey: 'secondaryTTSEngine',
          options: [
            { label: 'None', value: 'none' },
            { label: 'eSpeak-NG', value: 'espeak' },
            { label: 'Native TTS', value: 'native' }
          ]
        })
      ]),
      Row([
        Text('Speech Rate'),
        Slider({
          settingsKey: 'speechRate',
          min: 0.1,
          max: 3.0,
          step: 0.1
        })
      ]),
      Row([
        Text('Pitch'),
        Slider({
          settingsKey: 'speechPitch',
          min: 0.1,
          max: 2.0,
          step: 0.1
        })
      ]),
      Row([
        Text('Volume'),
        Slider({
          settingsKey: 'speechVolume',
          min: 0,
          max: 1.0,
          step: 0.1
        })
      ]),
      Row([Text('Audio Ducking'), Toggle({ settingsKey: 'audioDucking' })]),
      Row([Text('Read when screen off'), Toggle({ settingsKey: 'readScreenOff' })]),
      Row([
        Text('Granularity'),
        Select({
          settingsKey: 'defaultGranularity',
          options: [
            { label: 'Character', value: 'character' },
            { label: 'Word', value: 'word' },
            { label: 'Sentence', value: 'sentence' },
            { label: 'Paragraph', value: 'paragraph' }
          ]
        })
      ]),
      Row([Text('Spell out mode'), Toggle({ settingsKey: 'spellOutMode' })]),
      Row([Text('Read list position'), Toggle({ settingsKey: 'readListPosition' })]),
      Row([Text('Read status bar'), Toggle({ settingsKey: 'readStatusBar' })]),
      Row([Text('Read progress bars'), Toggle({ settingsKey: 'readProgressBars' })]),
      Row([Text('Read usage hints'), Toggle({ settingsKey: 'readUsageHints' })])
    ])
  ]
}
