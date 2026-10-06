export default function renderAudioOutput(_props) {
  return [
    Section({ title: 'Audio Output' }, [
      Row([
        Text('Sound Split Mode (experimental, not active yet)'),
        Select({
          settingsKey: 'audioSoundSplitMode',
          options: [
            { label: 'Disabled', value: 'disabled' },
            { label: 'Both Channels', value: 'bothChannels' },
            { label: 'Left/Right Split', value: 'leftRight' }
          ]
        })
      ]),
      Row([
        Text('Follow Voice Volume (experimental, not active yet)'),
        Toggle({ settingsKey: 'audioFollowsVoiceVolume' })
      ]),
      Row([
        Text('Keep Awake Time (seconds) (experimental, not active yet)'),
        Slider({
          settingsKey: 'audioKeepAwakeSeconds',
          min: 10,
          max: 120,
          step: 10
        })
      ])
    ])
  ]
}
