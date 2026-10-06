// Note: watch screen brightness/contrast are OS-level settings, not
// something a Mini Program is permitted to change - so this focuses on
// what ZSR itself actually renders (widget text scale / contrast for
// low-vision users), not the device's hardware display driver.
export default function renderDisplay(_props) {
  return [
    Section({ title: 'Display' }, [
      Row([
        Text('ZSR Text Scale (experimental, not active yet)'),
        Slider({
          settingsKey: 'fontScale',
          min: 0.8,
          max: 2.0,
          step: 0.1
        })
      ]),
      Row([
        Text('High Contrast Mode (experimental, not active yet)'),
        Toggle({ settingsKey: 'highContrastMode' })
      ])
    ]),
    Section({ title: 'Focus Cursor' }, [
      Row([
        Text('Cursor Style'),
        Select({
          settingsKey: 'cursorStyle',
          options: [
            { label: 'Border', value: 'border' },
            { label: 'Highlight', value: 'highlight' },
            { label: 'Off / Hidden', value: 'none' }
          ]
        })
      ]),
      Row([
        Text('Cursor Color'),
        Select({
          settingsKey: 'cursorColor',
          options: [
            { label: 'Green', value: '00ff00' },
            { label: 'Blue', value: '0088ff' },
            { label: 'Yellow', value: 'ffff00' },
            { label: 'Cyan', value: '00ffff' },
            { label: 'Orange', value: 'ff8800' },
            { label: 'Red', value: 'ff0055' },
            { label: 'White', value: 'ffffff' }
          ]
        })
      ]),
      Row([Text('Review Cursor'), Toggle({ settingsKey: 'reviewCursor' })])
    ]),
    // Tells a sighted person that ZSR is on (so it is not left on by accident)
    // without forcing the focus cursor.
    Section({ title: 'Active Indicator' }, [
      Row([
        Text('ZSR active indicator'),
        Select({
          settingsKey: 'activeIndicator',
          options: [
            { label: 'Minimal dot', value: 'minimal' },
            { label: 'Hidden', value: 'off' }
          ]
        })
      ]),
      Row([
        Text('Indicator Color'),
        Select({
          settingsKey: 'indicatorColor',
          options: [
            { label: 'Orange', value: 'ffaa00' },
            { label: 'Green', value: '00ff00' },
            { label: 'Blue', value: '0088ff' },
            { label: 'White', value: 'ffffff' }
          ]
        })
      ])
    ])
  ]
}
