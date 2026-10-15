import { Row, SelectField } from './ui.js'

export default function renderGeneral(_props) {
  return [
    Section({ title: 'General' }, [
      Row([Text({}, 'Enable ZSR'), Toggle({ settingsKey: 'screenReaderEnabled' })]),
      Row([
        Text({}, 'Accessibility Shortcut'),
        SelectField({
          settingsKey: 'accessibilityShortcut',
          options: [
            { label: 'Off', value: 'off' },
            { label: 'Long Press Home', value: 'long_press_home' },
            { label: 'Double Click Home', value: 'double_click_home' },
            { label: 'Triple Click Home', value: 'triple_click_home' }
          ]
        })
      ]),
      Row([
        Text({}, 'Accessibility button (bottom corner)'),
        Toggle({ settingsKey: 'accessibilityButton' })
      ]),
      Row([
        Text({}, 'Activation gesture'),
        SelectField({
          settingsKey: 'activationGesture',
          options: [
            { label: 'Off', value: 'off' },
            { label: 'Swipe up, down, up', value: 'zigzag' }
          ]
        })
      ]),
      Row([Text({}, 'Confirm before disable'), Toggle({ settingsKey: 'confirmBeforeDisable' })]),
      Row([Text({}, 'Auto-start on boot'), Toggle({ settingsKey: 'autoStart' })]),
      Row([
        Text({}, 'Language'),
        SelectField({
          settingsKey: 'language',
          options: [
            { label: 'English', value: 'en-US' },
            { label: 'Vietnamese', value: 'vi-VN' },
            { label: 'Chinese', value: 'zh-CN' }
          ]
        })
      ]),
      Row([Link({ source: 'https://zeppreader.com' }, [Text({}, 'Check for updates')])])
    ])
  ]
}
