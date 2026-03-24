import { Section, Row, Text, Toggle, Link, Select } from '@zeppos/zml'

export default function renderGeneral(_props) {
  return [
    Section({ title: 'General' }, [
      Row([Text('Enable ZSR'), Toggle({ settingsKey: 'screenReaderEnabled' })]),
      Row([
        Text('Accessibility Shortcut'),
        Select({
          settingsKey: 'accessibilityShortcut',
          options: [
            { label: 'Long Press Home', value: 'long_press_home' },
            { label: 'Double Click Home', value: 'double_click_home' },
            { label: 'Triple Click Home', value: 'triple_click_home' }
          ]
        })
      ]),
      Row([Text('Confirm before disable'), Toggle({ settingsKey: 'confirmBeforeDisable' })]),
      Row([Text('Auto-start on boot'), Toggle({ settingsKey: 'autoStart' })]),
      Row([
        Text('Language'),
        Select({
          settingsKey: 'language',
          options: [
            { label: 'English', value: 'en-US' },
            { label: 'Vietnamese', value: 'vi-VN' },
            { label: 'Chinese', value: 'zh-CN' }
          ]
        })
      ]),
      Row([
        Link({
          label: 'Check for updates',
          url: 'https://zeppreader.com'
        })
      ])
    ])
  ]
}
