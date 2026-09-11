import { Section, Row, Text, Toggle, Select, Slider } from '@zeppos/zml'

export default function renderAudioOutput(_props) {
  return [
    Section({ title: 'Audio Output' }, [
      Row([
        Text('Sound Split Mode'),
        Select({
          settingsKey: 'audioSoundSplitMode',
          options: [
            { label: 'Disabled', value: 'disabled' },
            { label: 'Both Channels', value: 'bothChannels' },
            { label: 'Left/Right Split', value: 'leftRight' }
          ]
        })
      ]),
      Row([Text('Follow Voice Volume'), Toggle({ settingsKey: 'audioFollowsVoiceVolume' })]),
      Row([
        Text('Keep Awake Time (seconds)'),
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
