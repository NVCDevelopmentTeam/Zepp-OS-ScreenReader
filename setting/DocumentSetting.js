// HONESTY NOTE: there is no document/rich-text reading module anywhere
// in lib/ yet (no parser for headings/lists/formatting, no "browse mode"
// concept like NVDA's for long documents) - these three settings are
// persisted safely but have no underlying feature to control yet. Building
// real document browsing is a new feature, not a bug fix, and is
// intentionally left for a dedicated follow-up rather than faked here.
export default function renderDocument(_props) {
  return [
    Section({ title: 'Document Settings' }, [
      Row([
        Text('Navigation mode (feature not yet built)'),
        Select({
          settingsKey: 'docNavMode',
          options: [
            { label: 'Standard', value: 'standard' },
            { label: 'Strict', value: 'strict' }
          ]
        })
      ]),
      Row([
        Text('Announce formatting (feature not yet built)'),
        Toggle({ settingsKey: 'announceFormatting' })
      ]),
      Row([
        Text('Browse mode behavior (feature not yet built)'),
        Select({
          settingsKey: 'browseBehavior',
          options: [
            { label: 'Automatic', value: 'auto' },
            { label: 'Manual', value: 'manual' }
          ]
        })
      ])
    ])
  ]
}
