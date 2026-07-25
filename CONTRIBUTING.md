# Contributing to Zepp OS Screen Reader (ZSR)

First off — thank you. This project exists because blind and low-vision users deserve full access to their wearables, and every issue report, translation, code review, or line of code moves that forward. This guide covers everything you need to make a contribution land smoothly.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Ways to Contribute](#ways-to-contribute)
- [Development Environment Setup](#development-environment-setup)
- [Branching & Commit Conventions](#branching--commit-conventions)
- [Coding Standards](#coding-standards)
- [Accessibility Testing Expectations](#accessibility-testing-expectations)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Proposing Features](#proposing-features)
- [Translations](#translations)
- [Getting Help](#getting-help)

## Code of Conduct

Be respectful, be patient, and assume good faith. This project is maintained in significant part by a blind developer working with limited hardware access — extra patience and clear, detailed communication (especially in bug reports) go a long way. Harassment, discrimination, or dismissiveness toward accessibility concerns will not be tolerated.

## Ways to Contribute

You don't need to write code to make a meaningful contribution:

| Contribution type | Why it matters |
|---|---|
| 🐛 Bug reports | Every reproducible bug report saves the maintainer hours of guessing |
| 📱 Device testing | Confirms real-world behavior on hardware the maintainer may not own |
| 🧑‍💻 Code / PRs | New features, fixes, performance and battery-life improvements |
| 🌍 Translations | Makes ZSR usable for non-English speakers |
| 📝 Documentation | Clearer docs mean more successful first-time contributors |
| ♿ Usability feedback | Feedback from actual screen-reader users is irreplaceable |

## Development Environment Setup

```bash
# 1. Fork the repo on GitHub, then clone your fork
git clone https://github.com/<your-username>/Zepp-OS-ScreenReader.git
cd Zepp-OS-ScreenReader

# 2. Install dependencies
npm install

# 3. Add the upstream remote so you can stay in sync
git remote add upstream https://github.com/NVCDevelopmentTeam/Zepp-OS-ScreenReader.git

# 4. Run the app in the simulator
zeus dev
```

See the [README](./README.md#getting-started) for the full breakdown of `zeus dev`, `zeus preview`, `zeus build`, and `zeus bridge`.

## Branching & Commit Conventions

- Branch off `main` using a descriptive prefix:
  - `feature/<short-description>` — new functionality
  - `fix/<short-description>` — bug fixes
  - `docs/<short-description>` — documentation-only changes
  - `refactor/<short-description>` — internal changes with no behavior change
- Keep commits focused and write clear messages. [Conventional Commits](https://www.conventionalcommits.org/) style is encouraged but not strictly enforced:
  ```
  fix(tts): prevent double-speech when queue is flushed mid-utterance
  feat(gestures): add three-finger swipe for quick settings
  docs(readme): clarify zeus preview network requirements
  ```
- Rebase on `upstream/main` before opening a PR to avoid merge conflicts.

## Coding Standards

- **ESLint** and **Prettier** are already configured in the repo — run them before committing:
  ```bash
  npx eslint .
  npx prettier --write .
  ```
- Match the existing module structure — see [Project Structure](./README.md#project-structure) in the README:
  - Watch-side UI logic → `page/`, `app-widget/`, `secondary-widget/`
  - Shared logic (TTS, gestures, braille) → `lib/`
  - Code shared across app-side and device-side → `shared/`
  - Companion/phone-side logic → `app-side/`
  - Settings screen → `setting/`
- Prefer small, composable functions over large monolithic handlers — TTS and gesture code in particular tends to get reused across modules.
- Add or update comments for anything non-obvious about **timing, event ordering, or hardware quirks** — these are the hardest bugs to reproduce later without context.
- If you touch `app.json` (permissions, target devices, pages), explain *why* in your PR description — manifest changes affect installability across the whole device matrix.

## Accessibility Testing Expectations

This is a screen reader — accessibility bugs are P0 by definition. Before opening a PR that touches user-facing behavior:

1. **Test with TTS actually enabled**, not just visually in the simulator.
2. **Test gesture/touch changes on a real device if possible** (see [`zeus preview`](./README.md#real-device-preview-zeus-preview)) — simulator touch timing doesn't always match hardware.
3. **Check both TTS engines** where relevant: native TTS (Zepp OS 3.5+) and eSpeak-NG fallback (2.0–3.4), since behavior can diverge.
4. **Verify announcements don't overlap or get cut off** when triggered in quick succession (e.g. rapid notifications).
5. If you can't test on hardware, say so explicitly in the PR — a maintainer or another contributor can help verify.

## Pull Request Process

1. Open an issue first for anything non-trivial (new features, architectural changes) so the approach can be discussed before you invest time.
2. Keep PRs focused — one feature or fix per PR is easier to review and safer to merge.
3. Fill out the PR description with:
   - What changed and why
   - How you tested it (simulator / real device / device model)
   - Screenshots, screen recordings, or audio clips for UI/UX or TTS changes
   - Any known limitations or follow-up work
4. Ensure `eslint` and `prettier` pass with no errors.
5. Be responsive to review feedback — if you're unable to continue a PR, let us know so it can be picked up by someone else rather than going stale.
6. A maintainer will merge once the PR is approved and CI (if configured) passes.

## Reporting Bugs

Open a [new issue](https://github.com/NVCDevelopmentTeam/Zepp-OS-ScreenReader/issues/new) with:

- **Device model** and **Zepp OS version** (see [README](./README.md#checking-your-zepp-os-version))
- **Steps to reproduce**, as specific as possible
- **Expected vs. actual behavior**
- **Logs** captured via `zeus bridge` if the bug involves a crash or unexpected runtime behavior
- Screenshots, screen recordings, or audio clips if they help illustrate the issue

## Proposing Features

Open an issue describing:

- The accessibility need or use case it addresses
- Any relevant precedent (e.g. how mobile screen readers like TalkBack/VoiceOver handle it)
- Rough scope — is this a small addition or a larger architectural change?

This helps avoid duplicate work and keeps the [Roadmap](./README.md#roadmap) grounded in real needs.

## Translations

To add or improve a language:

1. Check existing locale files (see `shared/` or `setting/` for current i18n structure)
2. Keep terminology consistent with how screen readers are typically described in that language
3. Test spoken output where possible — translated strings can behave differently in TTS than in visual UI

## Getting Help

- Open an issue and tag it `question`
- Check the [Zepp OS official documentation](https://docs.zepp.com) for platform-level API questions
- For anything hardware-access-related, remember the maintainer may not have your exact device — clear logs and descriptions are the best substitute

---

Thank you again for contributing — every improvement here makes wearable technology a little more accessible for someone who needs it. 💜
