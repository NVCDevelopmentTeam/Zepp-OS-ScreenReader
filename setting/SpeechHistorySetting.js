import { Row } from './ui.js'

export default function renderSpeechHistory(props) {
  return [
    Section({ title: 'Speech History' }, [
      Row([Text({}, 'Enable History'), Toggle({ settingsKey: 'speechHistoryEnabled' })]),
      Row([
        Text({}, 'History Limit'),
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
          onClick: () => {
            // Logic to clear history
            props.settingsStorage.setItem('clearHistorySignal', String(Date.now()))
          }
        })
      ])
    ])
  ]
}
