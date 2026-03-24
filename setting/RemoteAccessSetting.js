import { Section, Row, Text, Toggle, TextInput } from '@zeppos/zml'

export default function renderRemoteAccess(_props) {
  return [
    Section({ title: 'Remote Access' }, [
      Row([Text('Enable Remote Assistance'), Toggle({ settingsKey: 'remoteAccessEnabled' })]),
      Row([
        Text('Helper ID'),
        TextInput({
          settingsKey: 'remoteHelperId',
          placeholder: 'Enter ID'
        })
      ])
    ])
  ]
}
