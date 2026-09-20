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
      // HONESTY NOTE: Zepp OS has no documented "audio focus"/ducking API
      // that lets a Mini Program lower other apps' volume - only
      // @zos/media's player.setVolume() for a player it created itself.
      // This toggle is left in place (per project decision not to remove
      // declared settings) but currently has no real backing behavior;
      // it's not wired to anything that would silently misrepresent it as
      // working.
      Row([
        Text('Audio Ducking (lower background audio when speaking)'),
        Toggle({ settingsKey: 'audioDucking' })
      ]),
      Row([
        Text('Read when screen off (Experimental / Developer setting)'),
        Toggle({ settingsKey: 'readScreenOff' })
      ]),
      Row([Text('Read time on screen wake-up'), Toggle({ settingsKey: 'readScreenOnTime' })]),
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
      Row([Text('Speech Output (Mute/Unmute)'), Toggle({ settingsKey: 'speechMuted' })]),
      Row([Text('Read Emojis'), Toggle({ settingsKey: 'readEmoji' })]),
      Row([
        Text('Read Punctuation & Symbols'),
        Select({
          settingsKey: 'readSymbols',
          options: [
            { label: 'All', value: 'full' },
            { label: 'Most', value: 'most' },
            { label: 'Some', value: 'some' },
            { label: 'None', value: 'none' }
          ]
        })
      ]),
      Row([
        Text('Capital Letters Reading'),
        Select({
          settingsKey: 'capitalStyle',
          options: [
            { label: 'Raise Pitch', value: 'pitch' },
            { label: 'Say "Cap"', value: 'announce' },
            { label: 'Off', value: 'off' }
          ]
        })
      ]),
      Row([
        Text('Progress Bar Feedback'),
        Select({
          settingsKey: 'progressFeedback',
          options: [
            { label: 'Speech & Beep', value: 'both' },
            { label: 'Speech Only', value: 'speech' },
            { label: 'Beep Only', value: 'beep' },
            { label: 'None', value: 'none' }
          ]
        })
      ]),
      Row([Text('Spell out mode'), Toggle({ settingsKey: 'spellOutMode' })]),
      Row([Text('Read Passwords'), Toggle({ settingsKey: 'readPasswords' })]),
      Row([
        Text('Typing Echo'),
        Select({
          settingsKey: 'echoBehavior',
          options: [
            { label: 'Characters', value: 'chars' },
            { label: 'None', value: 'none' }
          ]
        })
      ]),
      Row([Text('Read list position'), Toggle({ settingsKey: 'readListPosition' })]),
      Row([Text('Read status bar'), Toggle({ settingsKey: 'readStatusBar' })]),
      Row([Text('Read progress bars'), Toggle({ settingsKey: 'readProgressBars' })]),
      Row([Text('Read usage hints'), Toggle({ settingsKey: 'readUsageHints' })])
    ])
  ]
}
