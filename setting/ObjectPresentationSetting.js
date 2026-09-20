export default function renderObjectPresentation(_props) {
  return [
    Section({ title: 'Object Presentation' }, [
      Row([Text('Read Emoji Names'), Toggle({ settingsKey: 'readEmoji' })]),
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
        Text('Uppercase Reading Style'),
        Select({
          settingsKey: 'capitalStyle',
          options: [
            { label: 'Announce ("Cap Word")', value: 'announce' },
            { label: 'Off', value: 'off' }
          ]
        })
      ]),
      Row([Text('Read Passwords'), Toggle({ settingsKey: 'readPasswords' })]),
      Row([Text('Custom Labels'), Toggle({ settingsKey: 'customLabels' })]),
      Row([Text('Announce Day of Week'), Toggle({ settingsKey: 'announceDayOfWeek' })])
    ])
  ]
}
