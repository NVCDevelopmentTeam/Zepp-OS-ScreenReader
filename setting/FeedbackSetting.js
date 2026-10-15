import { Row, SelectField } from './ui.js'

export default function renderFeedback(_props) {
  return [
    Section({ title: 'Feedback' }, [
      Row([Text({}, 'Haptic Feedback'), Toggle({ settingsKey: 'hapticFeedbackEnabled' })]),
      Row([Text({}, 'Sound Feedback'), Toggle({ settingsKey: 'soundFeedbackEnabled' })]),
      Row([
        Text({}, 'Feedback Intensity'),
        SelectField({
          settingsKey: 'feedbackIntensity',
          options: [
            { label: 'Low', value: 'low' },
            { label: 'Medium', value: 'medium' },
            { label: 'High', value: 'high' }
          ]
        })
      ])
    ])
  ]
}
