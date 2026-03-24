import { Section, Row, Text, Toggle } from '@zeppos/zml'

export default function renderObjectPresentation(_props) {
  return [
    Section({ title: 'Object Presentation' }, [
      Row([Text('Read Emoji Names'), Toggle({ settingsKey: 'readEmoji' })]),
      Row([Text('Read Symbols'), Toggle({ settingsKey: 'readSymbols' })]),
      Row([Text('Read Passwords'), Toggle({ settingsKey: 'readPasswords' })]),
      Row([Text('Custom Labels'), Toggle({ settingsKey: 'customLabels' })]),
      Row([Text('Announce Day of Week'), Toggle({ settingsKey: 'announceDayOfWeek' })])
    ])
  ]
}
