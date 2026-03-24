import { Section, Row, Text, Toggle } from '@zeppos/zml'

export default function renderVision(_props) {
  return [
    Section({ title: 'Vision' }, [
      Row([Text('Screen Curtain'), Toggle({ settingsKey: 'screenCurtain' })]),
      Row([Text('Explore Mode'), Toggle({ settingsKey: 'exploreMode' })]),
      Row([Text('Magnification'), Toggle({ settingsKey: 'magnification' })])
    ])
  ]
}
