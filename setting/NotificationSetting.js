import { Section, Row, Text, Toggle } from '@zeppos/zml'

export default function renderNotification(_props) {
  return [
    Section({ title: 'Notifications' }, [
      Row([Text('Real-time push'), Toggle({ settingsKey: 'notifyPush' })]),
      Row([Text('SMS Content'), Toggle({ settingsKey: 'notifySMS' })]),
      Row([Text('Calls'), Toggle({ settingsKey: 'notifyCalls' })]),
      Row([Text('Missed Calls'), Toggle({ settingsKey: 'notifyMissedCalls' })]),
      Row([Text('Priority Notifications'), Toggle({ settingsKey: 'notifyPriority' })])
    ])
  ]
}
