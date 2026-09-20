// A master output level, separate from Speech's "Volume" (which is the
// TTS voice's own gain); this is the overall output level ZSR mixes
// everything else against.
export default function renderVolume(_props) {
  return [
    Section({ title: 'Master Volume' }, [
      Row([
        Text('Master Volume'),
        Slider({
          settingsKey: 'masterVolume',
          min: 0,
          max: 100,
          step: 5
        })
      ])
    ])
  ]
}
