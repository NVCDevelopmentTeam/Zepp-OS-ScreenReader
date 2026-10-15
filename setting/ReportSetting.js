import { Row } from './ui.js'
import { ZSR_VERSION } from '../lib/utils/version.js'

/** Where problem reports are sent (the same address the watch Contact page shows). */
const SUPPORT_EMAIL = 'support@zeppreader.com'

/**
 * "Report a problem": the watch prepares a short, non-personal report (see
 * lib/utils/diagnosticReport.js); here it becomes a ready-made e-mail. The user
 * only has to open the link and press send in their mail app.
 * @param {any} props Settings App props
 */
export default function renderReport(props) {
  const report = props.settingsStorage.getItem('diagnosticReport') || ''
  const subject = `ZSR problem report (version ${ZSR_VERSION})`
  const mailto = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(report)}`

  const rows = [
    Row([
      Text(
        {},
        report
          ? 'A report from your watch is ready. Open the link below, check the text, then send the e-mail.'
          : 'No report yet. On the watch open About, then Contact, then Send report to phone. Or press Prepare report below while the watch is connected.'
      )
    ]),
    Row([
      Button({
        label: 'Prepare report',
        onClick: () => {
          props.settingsStorage.setItem('exportLogSignal', String(Date.now()))
        }
      })
    ]),
    Row([
      Link({ source: mailto }, [
        Text({}, report ? 'Email the report to the developers' : 'Email the developers')
      ])
    ])
  ]
  if (report) rows.push(Row([Text({}, report)]))
  rows.push(Row([Text({}, `Developer address: ${SUPPORT_EMAIL}`)]))
  return [Section({ title: 'Report a problem' }, rows)]
}
