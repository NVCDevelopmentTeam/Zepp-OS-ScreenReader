import { Row } from './ui.js'

export default function renderVision(_props) {
  return [
    Section({ title: 'Vision' }, [
      Row([Text({}, 'Screen Curtain'), Toggle({ settingsKey: 'screenCurtain' })]),
      Row([Text({}, 'Touch Exploration'), Toggle({ settingsKey: 'exploreMode' })]),
      Row([Text({}, 'Magnification'), Toggle({ settingsKey: 'magnification' })])
    ])
  ]
}
