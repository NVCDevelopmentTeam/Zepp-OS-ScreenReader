import { Section, Row, Text, Toggle, Slider, Button } from '@zeppos/zml'

export default function renderSpeechHistory(props) {
  return [
    Section({ title: 'Speech History' }, [
      Row([Text('Enable History'), Toggle({ settingsKey: 'speechHistoryEnabled' })]),
      Row([
        Text('History Limit'),
        Slider({
          settingsKey: 'speechHistoryLimit',
          min: 10,
          max: 100,
          step: 10
        })
      ]),
      Row([
        Button({
          label: 'Clear History',
          onPress: () => {
            // Logic to clear history
            props.settingsStorage.setItem('clearHistorySignal', Date.now())
          }
        })
      ])
    ])
  ]
}
