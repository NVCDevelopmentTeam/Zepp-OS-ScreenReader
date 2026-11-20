# ZSR (Zepp OS Screen Reader): handover document

For whoever takes this project over. It says what the project is, what has really been checked, what has **not**, what is missing, and what to do first. Read section 1 before anything else.

Project: `ZSR` (package `zsr` 1.0.1, Zepp app id `29069`, 36 watch targets, minimum Zepp OS API level 2.0).
Related documents: `README.md` (users and developers), `DEBUG_REPORT.md` (what was fixed and why), `features.md`, `Zepp_OS_Screen_Reader_PRD.md`, `antigravity.md`, `antigravity2.md` (requirement documents written for AI assistants, see section 9).

## 1. The honest summary

- **Nothing has been tested on a real watch or on the official Zepp simulator.** All checking was done by static tools and by a simulated Zepp OS written for this project (`npm run simulate`). The simulator is an approximation; it proves the code does not crash against the documented API, not that the watch behaves the same.
- **`zeus build` has never been run on this code.** It needs a download of the device list from Zepp's servers, which was blocked in the working environment. Run it first (section 3).
- The code is large (about 25,000 lines of JavaScript) and was developed mostly with AI assistance in many passes. It passes all automated checks, but expect surprises on a device.
- A blind person cannot read errors drawn on a watch screen, so the code was hardened so that errors are recorded and felt (vibration) instead of drawn. If an error still shows on a screen, a sighted helper's photo of the message is the most valuable bug report.
- **Licensing needs a lawyer before any sale or release** (section 8).

## 2. What the product is

A screen reader for Amazfit / Zepp OS watches, so that blind users can use the watch. It is a **Mini Program** (an app), not part of the operating system:

- It runs only while it is open (in the foreground). It cannot read other apps, intercept keys or touches in other apps, or run as a system accessibility service, because the Zepp OS API offers no way to do that.
- Zepp OS 4.2 and later have a Settings, Accessibility menu, which is where a screen reader is meant to be switched on. **ZSR cannot be activated there**: the API gives apps no accessibility service and no permission for it. When Zepp adds that, it should be integrated (see `lib/interaction/activation.js`).
- Speech comes from the phone (the eSpeak NG engine running in the Zepp app's side service, or an online voice) and is played on the watch; on API 2.0 watches (no audio player) ZSR answers with vibration only.

Three parts run in three different places, with different rules:

| Part          | Folder                                  | Runs on       | Notes                                                                                |
| ------------- | --------------------------------------- | ------------- | ------------------------------------------------------------------------------------ |
| Watch app     | `app.js`, `page/`, `lib/`, widgets      | The watch     | May only use `@zos/*` APIs. Syntax is lowered to ES2015 by the build; see section 7. |
| Side service  | `app-side/`                             | The phone     | Speech engine, online services, problem report storage. No `@zos/*`.                 |
| Settings app  | `setting/`                              | Zepp app      | Uses only the official Settings App components.                                      |
| Node backend  | `server/`, `lib/accessibility/`         | A PC          | A small stub API (`npm run server`); it has no link to a watch. Not part of the app. |
| Messaging lib | `GrantPermission/` (formerly `shared/`) | Watch + phone | The Zepp messaging library (ZML); do not restyle it. `@ts-nocheck` on purpose.       |

Key files: `lib/core/navigationManager.js` (the heart: what is focused and what is said; very important), `lib/core/screenReader.js`, `lib/components/screenReaderUI.js` (touch layer, accessibility button), `lib/interaction/shortcut.js` and `gesture.js` (keys and gestures), `lib/core/zsrPage.js` and `zsrWidgets.js` (every page goes through these), `lib/utils/safeCall.js` (error guards).

## 3. Set up and check

```
npm ci
npm run verify
```

`verify` runs, in order: Prettier and ESLint, the TypeScript check (`npm run check`, watch code only), `check:api`, `check:i18n`, `check:targets`, `check:permissions`, `check:promises`, `test:polyfills` and the simulator. All must pass. What each one guards:

| Command                     | Guards against                                                                                                |
| --------------------------- | ------------------------------------------------------------------------------------------------------------- |
| `npm run check:api`         | A static import of a `@zos` name newer than API 2.0 (it stopped ZSR loading on Zepp OS 2.x).                  |
| `npm run check:i18n`        | A `gettext('...')` text missing in en-US, vi-VN or zh-CN.                                                     |
| `npm run check:targets`     | `app.json` and the device folders in `assets/` disagreeing; a missing page file; a favorite pointing nowhere. |
| `npm run check:permissions` | A sensor used without its permission in `app.json` and in the request list in `app.js`.                       |
| `npm run check:promises`    | An async call whose result is dropped (an unhandled rejection can show as an error on the watch).             |
| `npm run simulate`          | Loads the app and every page on a simulated Zepp OS and runs about 140 behaviour checks.                      |

The simulator can be varied with environment variables: `ZSR_API=2.0|3.0|4.2`, `ZSR_WIDTH`, `ZSR_HEIGHT`, `ZSR_SHAPE=0|1` (0 = not round), `ZSR_NO_PHONE=1`, `ZSR_BATTERY=10`, `ZSR_PREV_CRASH=2` (the previous run ended unexpectedly), `SHOW_INFO=1`. It is in `.scripts/simulate/`; the stand-in `@zos` modules are generated from the official typings (`@zeppos/device-types`).

**Do first, on a machine with internet and a Zepp developer account:** `npm run build` (this is `zeus build`), then install on at least one watch of each Zepp OS generation you can get (2.x, 3.x, 4.x, 5.x). Everything in section 5 is waiting for that.

## 4. What was built and where

Features exist in code and are covered by the simulator, but see section 5 for what is unverified:

- Reading and navigation: `navigationManager`, touch exploration (switchable), swipe gestures, keys, review cursor, reading modes, verbosity levels (minimal, standard, detailed, custom).
- Activation once ZSR is open: crown pressed three times, an accessibility button in the bottom corner, a swipe up-down-up gesture (each switchable). Opening ZSR itself is manual and depends on the Zepp OS version (guide in `lib/interaction/activation.js`).
- Output: speech (phone engine or online), vibration patterns, interface sounds, Braille vibration output and a Bluetooth Braille display (API 3.0+).
- Text editor with Braille keyboard (tap dots, then write) and dictation; search by typing; custom labels; favorites; translation (manual, automatic, offline phrasebook); reading text in pictures and QR descriptions; scene description; GPS, altitude, compass and battery readings.
- Reliability: every lifecycle method and callback is guarded; crash detection with safe mode; battery saver; problem report that goes to the phone and is offered as a ready-made e-mail; settings backup and restore with schema versions and migration.
- Programming interface: `globalThis.ZSR` (see `lib/core/plugin.js`).

## 5. Not verified: test these on real watches

Each line is something the code does **in theory** and the simulator confirms against the documented API, but that nobody has seen work on hardware. Suggested order: A, B, C, E, then the rest.

### A. Build and install

1. `npm run build` succeeds for all 36 targets, and the package installs on each Zepp OS generation. Check that the `runtime.apiVersion` values (`compatible`, `target`, `minVersion` all `2.0.0`) are accepted, and that the 36 device keys and `deviceSource` values in `app.json` match Zepp's official device list (it could not be downloaded here).
2. No error text appears on the watch or the simulator at start, on API 2.x, 3.x and 4.x.
3. The permissions in `app.json` are accepted by the installer, including the newly added `device:os.geolocation`, `device:os.barometer`, `device:os.compass`, and the runtime request in `app.js` works on API 2.0 (where `requestPermission` does not exist and is looked up at run time).

### B. Keys, gestures, activation

4. **Crown, three presses.** The code consumes the Home key while counting (`return true` in `onKey`) and calls `home()` after 600 ms if fewer than three presses came. It is **not confirmed** that Zepp OS lets a Mini Program consume the Home key. If it does not, the first press leaves ZSR and the shortcut cannot work; then remove or replace it (`lib/interaction/shortcut.js`).
5. `onKey` allows one registration only (a second one cancels the first). ZSR registers once (`ShortcutHandler`); confirm nothing else in a real page registers another.
6. Devices with 1, 2 and 4 keys: which keys exist and what they do.
7. **Accessibility button** (`ScreenReaderUI.createAccessibilityButton`): position and size on round and square screens; one tap with ZSR off; double tap after it is read with ZSR on; press and hold opens the menu; it must not hide other controls.
8. **Swipe up, down, up** toggles ZSR: confirm the system delivers these swipes to the app and does not act on them itself.
9. Touch exploration on and off; multi-finger gestures are coded but it is unknown whether any watch reports a second finger (`touch_id`).
10. The opening instructions per Zepp OS version are generic on purpose (menu names differ). Someone with the devices should write the exact steps for each model and version.

### C. Speech and audio

11. Speech through the phone: the eSpeak engine is downloaded by the phone at run time (a WebAssembly file of about 18 MB from jsdelivr or unpkg, pinned by SHA-256 in `app-side/tts/espeakSynth.js`). Check first-use delay, behaviour offline, memory on low-end phones, and that the pinned hash still matches.
12. Playback on the watch: the audio files in `assets/raw/` (Opus) and the MP3 clips from the phone; whether every watch plays them; `@zos/media` is loaded with a guarded dynamic import because it starts at API 3.0. **Also verify that the Zepp toolchain and the watch engine support dynamic `import()` at all** (used in `app.js` for `@zos/media`, `@zos/settings`, `@zos/sensor`, `@zos/app`).
13. API 2.0 watches: confirm "vibration only" is usable.
14. The PRD asks for speech latency under 100 ms. Not measured.
15. Offline voice download (resumable) and the interface-label cache.

### D. Navigation and widgets

16. `lib/core/navigationManager.js` against real widget trees: focus order, lists (`SCROLL_LIST`, `CYCLE_LIST`), switches, checkboxes, progress, pickers, dialogs, QR codes. Widget type names were corrected (`SLIDER`, `PROGRESS`, `PICKER` do not exist), but only against the typings.
17. Interceptors (`widgetInterceptor`, `pageInterceptor`) try to patch a global `createWidget` and `Page`. On Zepp OS 2.0+ those are probably not globals, so the interceptors idle and ZSR relies on its own pages registering through `zsrWidgets.js`. **ZSR therefore reads its own pages; whether it can read other apps is unproven and probably not possible.**
18. Callbacks: pages receive `(checked, widget)` from switches (the platform calls `(slideSwitch, checked)`); confirm on a device, and check the other widget callbacks.
19. `deleteWidget` is imported from `@zos/ui` although the typings do not export it (the docs show `hmUI.deleteWidget`).
20. Layout: pixel values were wrapped in `px()` and checked on all 8 screen sizes in `assets/` only for "nothing sticks out sideways" in the simulator. Look at every page on a round and a rectangular watch: clipping, overlap, text size, scrolling.

### E. Phone side: Zepp app settings

21. **The settings screens use components in the way the documentation suggests but were never rendered.** Check: `Row` (built here from `View`), `Text({}, 'text')`, `Section`, `Toggle` (stores the strings `'true'`/`'false'`), `Select` (option format `{name, value}`, and what string is stored), `Slider`, `TextInput`, `Button` with `onClick`, and `Link` with `source`.
22. The problem report and the settings backup text show in the settings app; whether the Zepp app opens a `mailto:` link with a prefilled body.
23. **Known limitation: settings travel from the phone to the watch only when one changes** (`onSettingsChange`). There is no full sync when the watch connects, so changes made while the watch is away are lost until changed again. Fix: send all settings on connect (side service `onInit` and on the first request).
24. Messages about 20 KB (settings backup) over Bluetooth: size limits and timeouts.

### F. Online services (voice commands, reading pictures, describing pictures, translation)

25. Nothing was tried against a real provider. The client is OpenAI-compatible (`app-side/online/aiClient.js`): chat completions for pictures and translation, audio transcriptions for speech. Check base-address formats, model names, error codes, timeouts, cost, and privacy wording. The settings screen for the address, key and models was added late (phone settings, Advanced, Online services).
26. Reading text in a picture works only for pictures in ZSR's own assets (`OCR.readImageText`); there is no screenshot API.

### G. Sensors, battery, background

27. GPS (`Geolocation`): permission prompt, time to a fix, stopping the receiver; barometer and compass calibration (`'INVALID'` handling); health sensors on each model.
28. Battery saver: the 15% threshold; the timer for the phone link now runs only while remote access is on; the Battery API on each model.
29. **Crash detection** (`lib/utils/crashGuard.js`) assumes `App.onDestroy` runs on a normal close. If a watch skips it, every start looks like a crash (it only counts when the previous run was shorter than 30 seconds, so false alarms should be rare). Confirm.

### H. Newer features

30. Text editor, favorites, translation, search by typing, backup and restore, verbosity: all exercised in the simulator, none on a watch. Check the long editor page scrolls on small screens.

### I. JavaScript level

31. Zepp documents device apps as ES6. The build (`zpm`: rollup, babel, esbuild with `target: "es2015"`) lowers syntax (async/await, `?.`, `??`, spread). It does not add library functions; `lib/utils/polyfills.js` provides `globalThis`, `Array.includes`, `Object.entries/values/fromEntries` and `Promise.finally`, and is the first import of every entry point. Check on a real engine that nothing else newer than ES6 is used at run time (for example regular-expression features), and that the polyfills load before any use of `globalThis`.

## 6. Not implemented, or not possible

Not implemented (could be built):

- Importing user-made interface languages (interface texts are compiled into the app; a new language is added by a `.po` file and a rebuild).
- A full phone-to-watch settings sync on connect (see item 23).
- Favorites for anything except ZSR's own pages; per-application or per-context profiles (a Mini Program cannot tell which app is on screen).
- Two functions in `lib/core/plugin.js` do nothing yet: `Phone.sendState` and `Updater.check`. `lib/extensions/shortcut.js` and `keyboard.js` act only if a firmware delivers external keyboard key codes; no such firmware is known. `lib/extensions/OCR.js` has older helper methods that are unused. The Node backend in `server/` is a stub with no link to a watch.
- Type checking of the phone side (`setting/`, `app-side/`): needs its own TypeScript configuration with phone globals.
- Six places use `@ts-expect-error` because `@zeppos/device-types` 4.0.0 does not declare the widget options `alpha` and `z_index`; `GrantPermission/` is `@ts-nocheck`.

Not possible with the current Zepp OS API (do not spend time unless Zepp changes the API):

- Switching ZSR on from Settings, Accessibility (no accessibility service or permission for apps).
- Reading other apps' screens, intercepting keys or touches outside ZSR, running as a background screen reader.
- Scanning a QR code or taking a screenshot (no camera API, no screenshot API) and the first pairing of the watch with the Zepp app (done by the system before any app can run).
- A "charging" flag (the API gives the battery level only); typing into other apps.

## 7. Technical points a new maintainer must know

- Watch code must stay free of `console.*`; use `log` from `@zos/utils`. Expected situations (no phone, no audio on API 2.0, a missing sensor, low battery) are `info`, not `warn` or `error`; the simulator fails if a normal start writes a warning or error.
- Never import a `@zos` name that needs an API level above 2.0 by name; use a namespace import or a guarded dynamic import (`npm run check:api` enforces this).
- Every callback registered with the platform goes through `guard` (`lib/utils/safeCall.js`); every async call whose result is dropped goes through `fireAndForget`; every page through `ZSRPage`; every page widget through `createWidget` / `createChild` in `zsrWidgets.js` (this registers it for navigation).
- All visible and spoken texts use `gettext`; add the text to all three `.po` files (`page/i18n`, and the widget folders have their own).
- Layout numbers go through `px()`. A page is added to **every** target in `app.json` (`check:targets` enforces equal page lists).
- Settings from the phone are strings; convert with `lib/utils/settingValue.js`. Only keys in `ServerConfig` (`lib/core/config.js`) are stored on the watch. Provider keys stay on the phone (`PHONE_ONLY_KEYS` in `app-side/index.js`).
- Settings backups carry a schema number (`lib/core/settingsBackup.js`); when settings change shape, raise it and add a migration step.
- Comments are in English. Do not restyle `GrantPermission/`.
- The simulator is the safety net; when a real device shows a bug, first reproduce it there (add a check in `.scripts/simulate/run.mjs`), then fix.

## 8. Legal, ownership and business points (get professional advice)

- **License conflict.** The repository states MIT (`LICENSE`, README). But `app-side/tts/vendor/espeak-ng.glue.js` is part of **eSpeak NG, licensed GPL-3.0-or-later** (its header says so), and the app downloads the matching WebAssembly file at run time. Distributing GPL code together with MIT code generally requires the combined work to be offered under the GPL, with source. Either comply with the GPL for the app, replace eSpeak NG (an online voice, or an engine with a permissive license), or get legal advice. **Do not sell or publish as "MIT" without resolving this.**
- `app-side/tts/vendor/lamejs.js` (MP3 encoder) comes with `LICENSE-LAME.txt` (LGPL family): keep the notice and check the conditions.
- `GrantPermission/` is the Zepp messaging sample code (ZML): check its original license before redistributing.
- Audio files in `assets/raw/` and `assets/audio/`: confirm who made them and under what terms (a note in `lib/feedback/soundPaths.js` mentions a generator script that is not in the repository).
- **Accounts and names to transfer**: the Zepp developer account and the registration of app id `29069` (an app is tied to its developer account); the website `zeppreader.com` and the address `support@zeppreader.com`, both written into the code (the problem-report e-mail and the Settings link); the GitHub repository `NVCDevelopmentTeam/Zepp-OS-ScreenReader` if it is used. The product name, "Zepp" and "Amazfit" belong to others; check how the name may be used.
- The `site/` folder (the website workspace) is referenced by the scripts but is **not** in this package.
- No secrets are in the repository. Online-service keys are typed by each user and stay on the user's phone.

## 9. Privacy and security notes

- Data leaves the phone only when the user has set up a provider and uses a feature that needs it: audio (voice commands), pictures (reading, describing), text (translation). The text of a problem report (version, device model, recent internal error messages) is e-mailed only if the user sends it; it has no health data, notifications or spoken text.
- Provider keys stay in the phone's settings storage: they are not sent to the watch and not written to the log. Check that the Zepp app's settings storage is protected well enough for your needs.
- The Node backend in `server/` has no authentication; it listens on `127.0.0.1` only. Do not expose it.
- `SECURITY.md` names the contact for vulnerability reports; update it for the new owner.

## 10. Files to delete when the work is complete

`features.md`, `Zepp_OS_Screen_Reader_PRD.md`, `antigravity.md`, `antigravity2.md` are requirement documents written to steer AI assistants, and the previous owner asked that they be removed when everything is complete. Until then they are the fullest list of intended behaviour. `DEBUG_REPORT.md` and this file can go when they are no longer useful.

## 11. Suggested next steps

1. Run `npm ci`, `npm run verify`, then `npm run build`. Fix whatever the real toolchain reports.
2. Resolve the license conflict (section 8) before anything else that is public.
3. Install on one watch per Zepp OS generation. Go through section 5, A to E, and write down every difference. Add each real bug as a check in the simulator first.
4. Settle the crown shortcut (item 4), the accessibility button (item 7) and the swipe gesture (item 8) on hardware; keep what works.
5. Add the full phone-to-watch settings sync (item 23).
6. Test the online services against the provider you intend to support, and write a short setup guide for users.
7. Recruit blind testers early: the project's value is in how it sounds and feels, which no tool here could judge.
8. When Zepp adds an accessibility service API, integrate it in `lib/interaction/activation.js` and `README.md`.
