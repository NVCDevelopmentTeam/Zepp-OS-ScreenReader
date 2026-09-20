// The 'ocrEnabled' settingsKey here matches the flag AccessibilityService
// exposes internally (lib/core/accessibility.js) so this toggle is
// end-to-end wired rather than a value nobody reads.
export default function renderOCR(_props) {
  return [
    Section({ title: 'OCR & Image Recognition' }, [
      Row([Text('Enable OCR'), Toggle({ settingsKey: 'ocrEnabled' })]),
      Row([
        Text('OCR Mode'),
        Select({
          settingsKey: 'ocrMode',
          options: [
            { label: 'Automatic', value: 'auto' },
            { label: 'Manual', value: 'manual' }
          ]
        })
      ]),
      Row([
        Text('OCR Language'),
        Select({
          settingsKey: 'ocrLanguage',
          options: [
            { label: 'English', value: 'en-US' },
            { label: 'Vietnamese', value: 'vi-VN' }
          ]
        })
      ]),
      Row([
        Text('OCR Region'),
        Select({
          settingsKey: 'ocrRegion',
          options: [
            { label: 'Full Screen', value: 'full' },
            { label: 'Selection', value: 'selection' }
          ]
        })
      ])
    ])
  ]
}
