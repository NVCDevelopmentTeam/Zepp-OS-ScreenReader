import { Section, Row, Text, Toggle, Slider } from '@zeppos/zml'

// Note: watch screen brightness/contrast are OS-level settings, not
// something a Mini Program is permitted to change - so this focuses on
// what ZSR itself actually renders (widget text scale / contrast for
// low-vision users), not the device's hardware display driver.
export default function renderDisplay(_props) {
  return [
    Section({ title: 'Display' }, [
      Row([
        Text('ZSR Text Scale'),
        Slider({
          settingsKey: 'fontScale',
          min: 0.8,
          max: 2.0,
          step: 0.1
        })
      ]),
      Row([Text('High Contrast Mode'), Toggle({ settingsKey: 'highContrastMode' })])
    ])
  ]
}
