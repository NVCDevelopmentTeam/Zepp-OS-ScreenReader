import { Section, Row, Text, Toggle, Slider } from '@zeppos/zml'

// Configuration for the accessibility service's built-in error recovery
// (see lib/utils/errorMonitor.js), surfaced so advanced users can tune how
// aggressively ZSR retries after an internal error instead of just failing
// silently.
export default function renderAccessibilityDiagnostics(_props) {
  return [
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
