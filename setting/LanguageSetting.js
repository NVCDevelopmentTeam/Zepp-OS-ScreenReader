// GeneralSetting.js already has the primary UI/speech "Language" picker.
// This screen covers the finer-grained fallback/detection behavior that
// sits on top of that primary choice.
export default function renderLanguage(_props) {
  return [
    Section({ title: 'Language & Region' }, [
      Row([
        Text('Fallback Language'),
        Select({
          settingsKey: 'fallbackLanguage',
          options: [
            { label: 'English', value: 'en-US' },
            { label: 'Vietnamese', value: 'vi-VN' },
            { label: 'Chinese', value: 'zh-CN' }
          ]
        })
      ]),
      Row([Text('Automatic Language Detection'), Toggle({ settingsKey: 'languageDetectionAuto' })])
    ])
  ]
}
