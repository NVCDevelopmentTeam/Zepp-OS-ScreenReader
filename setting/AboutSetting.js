import { Section, Row, Text } from '@zeppos/zml'

// Settings App (phone webview) cannot navigate to device-side pages via
// @zos/router - that API only exists in the Device App runtime. The
// device-side About pages (page/about/*) are reached from the watch UI
// itself. Here we surface the same information as static, readable text so
// screen-reader users get it without a broken "navigate" action.
export default function renderAbout(_props) {
  return [
    Section({ title: 'About' }, [
      Row([Text('ZSR is an open-source screen reader for Zepp OS 2.0 watches.')]),
      Row([
        Text(
          'Privacy Policy: ZSR does not transmit health or usage data off the device except for optional cloud TTS you explicitly enable.'
        )
      ]),
      Row([
        Text('License: MIT License. Contributions welcome - see CONTRIBUTING.md in the repository.')
      ]),
      Row([
        Text('For the full changelog, contact info, and credits, see the watch app About menu.')
      ])
    ])
  ]
}
