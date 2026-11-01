# Debug report

What was changed in this pass and how far it was verified. Verified = run in this environment. The Zepp
toolchain (`zeus build`) could not run here (its device list is downloaded from a blocked host) and no real watch
or official simulator was available, so nothing below was seen on a device.

## Fixed (found by static checks, the typings and a simulated Zepp OS)

- **Did not start on Zepp OS 2.x:** `requestPermission` (`app.js`) and the `Screen` sensor (`accessibility.js`) were
  imported by name although they need API 3.0; a missing name stops the whole module from loading. Now resolved at
  run time. `npm run check:api` fails the build if this happens again.
- **Start-up stopped when the phone was not connected:** the phone handshake threw inside `onCreate`, before the
  reader started. It is now a background step with limited retries.
- **Errors drawn on the watch screen** (unreadable for the user) replaced by vibration, speech and a report.
- **One failing callback could stop the app:** every button, key, gesture, timer, event and sensor callback is
  guarded (`lib/utils/safeCall.js`); each start-up part is isolated.
- **Crash recovery:** an unexpected close is detected at the next start, announced, reported, and after two in a
  row ZSR starts in safe mode (`lib/utils/crashGuard.js`).
- **Phone settings app:** used a component that does not exist (`Row`, 155 uses), passed text as props
  (`Text('x')`, 154 uses), used `onPress` instead of `onClick`, and treated stored text as booleans/numbers.
- `navigationManager`: widget types `SLIDER`, `PROGRESS`, `PICKER` do not exist, so three roles shared the key
  `"undefined"`. `FILL_RECT` was created without the required `radius` and `angle`.
- Interceptors polled 50 times with two warnings each and an error at every start; BLE packets were written to
  the log in hex (`DEBUG = true`); BLE Braille scan used functions that do not exist (`mstStartScan` is the API).
- `app.json`: `compatible` was greater than `target`.
- Node backend: routes called methods that did not exist (every request failed) and nothing started the server.
- `vibrationController` called a vibrator API that does not exist; `OCR` used `performance` (not on Zepp OS).

## Added (from the requirement documents)

- Problem report: watch, _Contact_, _Send report to phone_ (also automatic after a problem or unexpected close);
  phone, Zepp app, ZSR settings, _Report a problem_ (ready-made e-mail; no personal data).
- Previously unused modules are imported and reachable (see `features.md`, _Extensions reachable from the
  interface_): custom labels, QR descriptions, CAPTCHA reading, scene description, gamer mode, brightness,
  speech mode, plugin API.
- Tools: `npm run check` (now really type-checks), `check:api`, `simulate`, `server`.

## Not verified

- Behaviour on real watches and on the official simulator; the `zeus build` step.
- That the Zepp app opens `mailto:` links, the `Link` prop name (`source`) and the `Select` option format.
- Which JavaScript level the watches' engine accepts: the original code already uses async/await, `?.` and `??`;
  new code avoids object spread. The build chain's own transpiling could not be inspected.
- Device keys / names in `app.json` against the official device list (not downloadable here).

## Second pass: ZSR naming, activation, touch exploration, peripherals

- **Names:** `globalThis.NVDA` is gone. The programming interface is `globalThis.ZSR` (General, Activation,
  Speech, Audio, Touch, Keys, Peripherals, Braille, Vision, ...) plus `core`, `components`, `extensions`.
- **Opening and activating ZSR:** no Zepp OS version lists ZSR in its Accessibility menu (Zepp OS 5 offers zoom
  and text size only), so opening is manual and the README/guide now say so. Once open, three ways turn the reader
  on or off, all on by default and switchable: crown pressed three times, the accessibility button in the bottom
  corner, and swipe up-down-up. **Bug fixed:** the old crown shortcut could never reach three presses, because the
  first press was passed to the system and closed ZSR; presses are now held while counting.
- **Touch exploration** is a real switch (`TouchExploration.js`): off lets touches reach the app, as with TalkBack.
- **OCR:** the watch and the phone used different field names, so text recognition could never work; fixed.
  Reading a picture's text works for images in this app's assets. QR: scan help raises brightness and keeps the
  screen lit. A watch has no camera and Zepp OS has no screenshot API, so ZSR cannot scan a code or read another
  app's pixels, and the first pairing happens before any Mini Program can run.
- **JavaScript level:** the build tool lowers syntax to ES2015; library functions it does not add
  (`globalThis`, `Array.includes`, `Object.entries/values/fromEntries`, `Promise.finally`) are provided by
  `lib/utils/polyfills.js`, the first import of every entry point (tested with `npm run test:polyfills`).
- **Devices:** `npm run check:targets` verifies app.json against the device folders in `assets/` (icon, designWidth,
  files of every page and widget, identical page lists).
- **Translations:** `npm run check:i18n` verifies every `gettext` key in en-US, vi-VN and zh-CN (30 were missing).
- `npm run verify` runs everything.

Not verified: all of the above on real watches. The crown, button and gesture behaviour follows the documented
`onKey` / `onGesture` semantics but was exercised only in the simulation; whether Zepp OS lets a Mini Program
consume the Home key is not confirmed.

## Third pass

- **Settings switches:** every toggle on the watch settings pages received the widget instead of the boolean (the platform calls
  `checked_change_func(slideSwitch, checked)`), so none could be turned off. Fixed in one place (`zsrWidgets.js`) and in the
  double-tap activation, and tested.
- **Layout:** 431 fixed pixel values now go through `px()` (PRD directive); geometry is rounded. Checked on all 8 screen sizes in
  `assets/` (round and rectangular): no widget sticks out sideways.
- **Logs:** expected situations (no phone, no audio on API 2.0, a sensor the watch lacks, low battery) are information, not
  errors. A normal start writes no warning or error in any scenario (checked by `npm run simulate`).
- **OCR:** watch and phone used different field names; fixed (see second pass). **Permissions:** `npm run check:permissions`.
- Added: verbosity levels, battery saver, backup/restore, text editor, GPS / altitude / compass / battery readings.
- Note: the working environment was reset once during this pass; everything after the previous zip was re-applied from the
  recorded changes and re-verified.

Not verified: all of this on real watches.
