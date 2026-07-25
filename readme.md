# Zepp OS Screen Reader (ZSR)

<p align="center">
  <img src="https://img.shields.io/badge/platform-Zepp%20OS%202.0%2B-blue" alt="Platform">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
  <img src="https://img.shields.io/github/stars/NVCDevelopmentTeam/Zepp-OS-ScreenReader?style=flat" alt="Stars">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen" alt="PRs Welcome">
  <img src="https://img.shields.io/badge/status-active%20development-orange" alt="Status">
</p>

<p align="center">
  <strong>An open-source, full-featured screen reader for Zepp OS smartwatches — built to make wearables accessible for blind and low-vision users.</strong>
</p>

<p align="center">
  <a href="https://github.com/NVCDevelopmentTeam/Zepp-OS-ScreenReader/issues">Report a Bug</a>
  ·
  <a href="https://github.com/NVCDevelopmentTeam/Zepp-OS-ScreenReader/issues/new">Request a Feature</a>
  ·
  <a href="https://zeppreader.com">Project Website</a>
  ·
  <a href="./CONTRIBUTING.md">Contributing Guide</a>
  ·
  <a href="./CODE_OF_CONDUCT.md">Code of Conduct</a>
</p>

---

## Why This Project Matters

Wearables are becoming central to health tracking, communication, and daily convenience — but almost none of them are usable without sight. **ZSR exists to close that gap**, bringing verbal and tactile feedback to the Zepp OS ecosystem so blind and low-vision users can navigate, respond to notifications, and monitor their health independently, without needing to see the screen.

This project is maintained largely by a **blind developer with limited access to physical test hardware** — which means community testing on real devices, code contributions, and even simple bug reports have an outsized impact. If you have a Zepp OS device sitting in a drawer, running this app on it for ten minutes and filing an issue is genuinely one of the highest-leverage ways to help.

## Table of Contents

- [Why This Project Matters](#why-this-project-matters)
- [Key Features](#key-features)
- [Supported Devices](#supported-devices)
- [Zepp OS Version Requirements](#zepp-os-version-requirements)
- [Checking Your Zepp OS Version](#checking-your-zepp-os-version)
- [Project Structure](#project-structure)
- [Localization & Multi-Device Optimization](#localization--multi-device-optimization)
  - [Adding a New Language](#adding-a-new-language)
  - [Supporting a New Device](#supporting-a-new-device)
- [Four Ways to Run ZSR](#four-ways-to-run-zsr)
  - [1. Install from the Zepp App Store (End Users)](#1-install-from-the-zepp-app-store-end-users)
  - [2. Enable the Screen Reader](#2-enable-the-screen-reader)
  - [3. Run in the Simulator (Developers)](#3-run-in-the-simulator-developers)
  - [4. Run on a Real Device from Source (Developers)](#4-run-on-a-real-device-from-source-developers)
- [Production Build](#production-build)
- [Live Debugging with Zeus Bridge](#live-debugging-with-zeus-bridge)
- [Interaction Shortcuts (Simulator)](#interaction-shortcuts-simulator)
- [Code Style & Quality](#code-style--quality)
- [Contributing](#contributing)
- [Roadmap](#roadmap)
- [Reporting Issues](#reporting-issues)
- [Security](#security)
- [License](#license)
- [Acknowledgements](#acknowledgements)

---

## Key Features

| Feature | Description |
|---|---|
| 🔊 **Dual TTS Engine** | Native Zepp OS TTS + offline eSpeak-NG fallback for wide device coverage |
| 👆 **Screen Explore Mode** | Touch-to-read interaction, similar to mobile "explore by touch" |
| ⠿ **Braille Support** | Vibration Braille output and BLE Braille display compatibility |
| 🎙️ **Voice Control** | Hands-free command recognition for core navigation |
| ✋ **Gesture Engine** | Fully customizable single- and multi-finger gestures |
| 🔔 **Notification Reading** | Real-time announcements for SMS, calls, and app notifications |
| ❤️ **Health Sensor Accessibility** | Verbal readouts for heart rate, SpO2, sleep, steps, and stress |
| 🔘 **Hardware Button Remapping** | Assign physical buttons to precise navigation actions |

## Supported Devices

ZSR targets **all Zepp OS 2.0+ devices**, with particular focus on:

- Amazfit Bip 6 (new)
- Amazfit T-Rex 2 & Ultra
- Amazfit GTR 4 & GTR Mini
- Amazfit GTS 4
- Amazfit Balance & Cheetah Pro
- Amazfit Falcon

> **Note:** Device support is expanding continuously and depends heavily on community testing. Check the [official Amazfit website](https://www.zepp.com) for hardware specs, and see our [Issues](https://github.com/NVCDevelopmentTeam/Zepp-OS-ScreenReader/issues) page for community-reported device compatibility status.

## Zepp OS Version Requirements

| Zepp OS Version | TTS Engine | Experience |
|---|---|---|
| **3.5+ (recommended)** | OpenAI GPT-4o via Zepp Flow™ | High-quality, natural voice output |
| **2.0 – 3.4** | eSpeak-NG (offline) | Functional, lower voice fidelity |

Learn more about Zepp Flow™ and GPT-4o integration in [Zepp Health's official announcement](https://www.zepp.com/press-release/zepp-health-introduces-zepp-os-4-redefining-wearable-intelligence-by-integrating-openais-gpt-4o-into-its-amazfit-smartwatches).

## Checking Your Zepp OS Version

**On the watch:**
1. Open the app menu → **Settings**
2. Scroll to **System → About / Device Information**
3. Check **Software Version** / **Zepp OS Version**

**Via the Zepp app:**
1. Open the Zepp app → **Profile** → select your device
2. Go to **System Update** to view the current Zepp OS version

> Before buying a device specifically to test this project, confirm its Zepp OS version on the [official Amazfit site](https://www.zepp.com) or with your retailer.

## Project Structure

```
Zepp-OS-ScreenReader/
├── app-side/          # Companion / side-service logic (runs on the phone side)
├── app-widget/         # Main watch-side app widget UI
├── secondary-widget/    # Secondary widget entry points
├── setting/             # In-app settings screen
├── page/                 # Watch UI pages
├── lib/                   # Shared libraries: TTS engines, gesture recognizer, braille modules
├── shared/                 # Code shared across app-side / device-side / settings
├── assets/                  # Icons, sounds, and vibration patterns
├── server/                   # Backend / auxiliary services
├── site/htdocs/                # zeppreader.com project website (Svelte)
├── .vscode/                     # Editor settings for consistent DX
├── .github/                      # Issue/PR templates, community health files
├── app.js                         # App entry point
├── app.json                        # Zepp OS app manifest (permissions, targets, pages)
├── eslint.config.mjs                # ESLint configuration
├── .prettierrc / .prettierignore     # Prettier formatting rules
├── global.d.ts                        # Global TypeScript type declarations
├── jsconfig.json                       # JS language service configuration
└── package.json                         # Dependencies & npm scripts
```

## Localization & Multi-Device Optimization

A screen reader is only as inclusive as the languages it speaks and the hardware it actually runs well on. **Feature contributions alone aren't enough** — localization and per-device tuning are first-class, ongoing needs for this project, not an afterthought.

### Adding a New Language

Zepp OS Mini Programs localize text through `.po` translation files and a small runtime API:

1. Create (or extend) a `page/i18n/` directory, with one file per locale: `en-US.po`, `vi-VN.po`, `zh-CN.po`, etc. — see [Multilingual Mapping](https://docs.zepp.com/docs/reference/related-resources/language-list/) for the correct locale codes.
2. In app code, pull the localized string at runtime instead of hardcoding it:
   ```js
   import { getText } from '@zos/i18n'
   console.log(getText('notification_read_aloud'))
   ```
3. The **app name and store listing** also need localization — this is configured separately in `app.json` under the `i18n` key:
   ```json
   {
     "i18n": {
       "en-US": { "appName": "Zepp OS Screen Reader" },
       "vi-VN": { "appName": "Trình đọc màn hình Zepp OS" }
     },
     "defaultLanguage": "en-US"
   }
   ```
4. **Test spoken output, not just visual text** — a translated string that reads correctly on screen can still sound wrong or ambiguous through TTS. Where possible, listen to it on-device or in the simulator with TTS enabled before submitting.
5. If a target locale is **right-to-left (RTL)**, flag this explicitly in your PR — RTL handling needs additional verification per the [Zepp OS i18n guide](https://docs.zepp.com/docs/guides/best-practice/i18n/).
6. For larger translation efforts, the community-built [Polyglot toolkit](https://github.com/silver-zepp/polyglot) can help manage translation spreadsheets and auto-generate the per-locale JSON/`.po` assets — useful if you're translating into many languages at once rather than a single locale.

> Priority languages are typically driven by where the most screen-reader users are asking for support — check open [translation-tagged issues](https://github.com/NVCDevelopmentTeam/Zepp-OS-ScreenReader/issues) before starting a new one, to avoid duplicate work.

### Supporting a New Device

Zepp OS spans a wide range of screen sizes, chipsets, and sensor capabilities, so a feature that works well on a GTR 4 may need adjustment on a Bip 6. Device targeting lives in `app.json`:

```json
{
  "targets": {
    "gtr-4": {
      "module": { "page": { "file": "page/index" } }
    }
  },
  "designWidth": 480
}
```

When adding or improving support for a device model:

- Declare the device explicitly under `targets` in `app.json`, rather than relying on it silently falling back to a generic layout.
- Use `designWidth` and Zepp OS's screen-adaptation `px()` helper rather than hardcoded pixel values, so layouts scale correctly across round/square displays of different resolutions.
- **Verify touch target sizes and gesture zones on the actual screen size** — a gesture zone tuned for a large GTR 4 face can be unusably small on a compact Bip.
- Check sensor availability before relying on it (e.g. SpO2 isn't present on every model) and fail gracefully with a clear spoken message rather than silently doing nothing.
- Note battery/performance impact for anything continuous (voice control listening, sensor polling) — screen reader users depend on their watch lasting the day.
- Report your findings either way: "works great," "works with caveats," or "not supported" are all useful data points for the [Supported Devices](#supported-devices) table and the community compatibility matrix in [Issues](https://github.com/NVCDevelopmentTeam/Zepp-OS-ScreenReader/issues).

## Four Ways to Run ZSR

Whether you're an end user who just wants the app working on your wrist, or a contributor who needs to test a code change, pick the path below that matches your goal.

### 1. Install from the Zepp App Store (End Users)

The simplest path — no code, no developer mode required.

1. Connect your watch to your phone and open the **Zepp app**
2. Go to **Profile → [Your Device Name] → App Store**
3. Search for **Zepp OS Screen Reader**
4. Tap **Install**

### 2. Enable the Screen Reader

After installing (from the App Store or by sideloading), turn it on:

1. On your watch, go to **Settings → Accessibility → Zepp OS Screen Reader**
2. Toggle it **On**

### 3. Run in the Simulator (Developers)

The fastest loop for day-to-day feature work — no physical device needed.

**Prerequisites:**
- **Node.js** ≥ 14 (LTS recommended)
- **Zeus CLI**, installed globally:
  ```bash
  npm install -g @zeppos/zeus-cli
  ```

**Steps:**
```bash
git clone https://github.com/NVCDevelopmentTeam/Zepp-OS-ScreenReader.git
cd Zepp-OS-ScreenReader
npm install
zeus dev
```

This launches the local Zepp OS simulator with hot-reload enabled.

### 4. Run on a Real Device from Source (Developers)

Essential for validating actual hardware behavior — touch latency, TTS timing, and accessibility APIs don't always match the simulator. This is a **sideload**, so it requires unlocking Developer Mode once.

**Step 1 — Unlock Developer Mode on your phone (one-time setup):**
1. Open the **Zepp App** → `Profile` → `Settings` → `About`
2. Tap the **Zepp logo 7 times** — a toast notification confirms **Developer Mode** is unlocked
3. Make sure your **PC and phone are on the same Wi-Fi network** (required for the local sideload connection)

**Step 2 — Compile and generate the QR code on your PC:**
```bash
zeus preview
```
This compiles the project, verifies target-device compatibility from `app.json`, hosts a temporary local server, and prints a **QR code** in your terminal.

**Step 3 — Scan and install on your watch:**
1. In the Zepp app, open your paired device → scroll down to the **Developer Mode** panel
2. Tap the **Scan** icon (camera/plus) in the upper-right corner
3. Scan the QR code shown in your terminal
4. Confirm the connection and tap **Install** on your phone

The phone acts as a bridge: it pulls the compiled mini-program package from your PC over Wi-Fi, then streams it to the watch over **Bluetooth Low Energy (BLE)** or Wi-Fi.

## Production Build

```bash
zeus build
```

Generates a `.zab` installation package in the `dist/` folder, ready for distribution or App Store submission.

> **Maintainers:** publishing a new `.zab` to the official Zepp App Store requires submitting it through the [Zepp OS developer console](https://docs.zepp.com/docs/distribute/) — filling in app metadata, supported devices, and a privacy statement. Review typically takes a few business days.

## Live Debugging with Zeus Bridge

A watch face has no visible console, so **Developer Bridge** streams `console.log()` output, error stacks, and runtime events from a connected physical device back to your terminal in real time — essential when debugging TTS event queues or UI lifecycle issues.

1. In the phone's **Developer Mode** panel, toggle **Bridge Mode** ON
2. Note the phone's local IP address
3. In a separate terminal:
   ```bash
   zeus bridge
   ```
4. Enter the phone's IP address when prompted

Once connected, hardware interrupts, error stacks, and log output from the physical watch stream back to your terminal instantaneously.

## Interaction Shortcuts (Simulator)

| Key | Action |
|---|---|
| `Space` | Read the current item |
| `Tab` | Move to next item |
| `Shift + Tab` | Move to previous item |
| `Enter` | Select current item |

## Code Style & Quality

This project ships with **ESLint** and **Prettier** already configured — please run them before opening a PR:

```bash
npx eslint .
npx prettier --check .
```

Keeping formatting automated means code review can stay focused on logic and accessibility behavior rather than style nits.

## Contributing

**Contributors of every kind are what keep this project alive** — code is only part of it. Here's how to help:

- 🐛 **Report bugs** or unsupported devices via [Issues](https://github.com/NVCDevelopmentTeam/Zepp-OS-ScreenReader/issues)
- 📱 **Test on real hardware** — even a single device model report is valuable, especially since maintainer access to physical watches is limited
- 💡 **Suggest features** grounded in real accessibility needs
- 🧑‍💻 **Submit pull requests** — see [`CONTRIBUTING.md`](./CONTRIBUTING.md) for the full workflow, coding conventions, and PR checklist
- 🌍 **Translate** the app and documentation into new languages — see [Adding a New Language](#adding-a-new-language)
- 📐 **Tune the app for a specific device model** — see [Supporting a New Device](#supporting-a-new-device)
- ♿ **Test with real assistive-technology users** and share feedback from actual usage, not just code review

Read the full **[Contributing Guide](./CONTRIBUTING.md)** and our **[Code of Conduct](./CODE_OF_CONDUCT.md)** before submitting significant changes.

## Roadmap

- [ ] Expanded device compatibility testing matrix (community-sourced)
- [ ] Additional language support for TTS and UI — tracked per-locale in [Issues](https://github.com/NVCDevelopmentTeam/Zepp-OS-ScreenReader/issues)
- [ ] Per-device layout and gesture-zone tuning for smaller screen sizes (e.g. Bip line)
- [ ] Improved BLE Braille display protocol support
- [ ] Community voice-command customization presets
- [ ] Automated CI checks for lint/format on every PR

> Have ideas? Open a [discussion or issue](https://github.com/NVCDevelopmentTeam/Zepp-OS-ScreenReader/issues) — the roadmap is shaped by community input, not decided in isolation.

## Reporting Issues

Found a bug or have a feature request? Please open an issue using one of our templates:

- [🐛 Bug report](https://github.com/NVCDevelopmentTeam/Zepp-OS-ScreenReader/issues/new?template=bug_report.md)
- [💡 Feature request](https://github.com/NVCDevelopmentTeam/Zepp-OS-ScreenReader/issues/new?template=feature_request.md)

Include device model, Zepp OS version, steps to reproduce, and `zeus bridge` logs where relevant — see [`CONTRIBUTING.md`](./CONTRIBUTING.md#reporting-bugs) for the full checklist.

## Security

Please **do not open a public issue** for security vulnerabilities. See [`SECURITY.md`](./SECURITY.md) for how to report them responsibly.

## License

This project is licensed under the **MIT License** — see [`LICENSE`](./LICENSE) for details.

> Note: the app is provided free of charge to end users. Organizations or individuals wishing to integrate this project into a commercial service should seek the author's written consent first.

## Acknowledgements

- The Zepp OS developer community and [official documentation](https://docs.zepp.com)
- [eSpeak-NG](https://github.com/espeak-ng/espeak-ng) for offline TTS support
- Everyone testing devices and advocating for accessibility on wearables

---

<p align="center">Made with ❤️ for a more accessible wearable ecosystem — by the <a href="https://github.com/NVCDevelopmentTeam">NVC Development Team</a>.</p>
