// Configuration for the accessibility service's built-in error recovery
// (see lib/utils/errorMonitor.js), surfaced so advanced users can tune how
// aggressively ZSR retries after an internal error instead of just failing
// silently. Also provides clear explanation and accidental-activation
// guidance for sighted users and caregivers.
export default function renderAccessibilityDiagnostics(_props) {
  return [
    Section({ title: 'Sighted User Notice & Overview' }, [
      Row([
        Text(
          'What is ZSR? Zepp OS Screen Reader provides voice and tactile feedback for blind and low-vision users. When enabled, touch interactions change: Tap once to focus/hear items, Double-tap to activate, and swipe with two fingers to scroll.'
        )
      ]),
      Row([
        Text(
          'Accidental Activation Notice: If you enabled ZSR unintentionally, you can turn it off quickly by triple-clicking the physical button, or toggling "Enable ZSR" off in General Settings.'
        )
      ])
    ]),
    Section({ title: 'Reliability & Diagnostics' }, [
      Row([Text('Auto-recover from errors'), Toggle({ settingsKey: 'autoRecoveryEnabled' })]),
      Row([
        Text('Max Recovery Attempts'),
        Slider({
          settingsKey: 'maxRecoveryAttempts',
          min: 1,
          max: 10,
          step: 1
        })
      ])
    ])
  ]
}
