# Contributing to the Zepp OS Screen Reader Website

Thanks for helping improve [zeppreader.com](https://www.zeppreader.com) — the public face of the ZSR project. This site is often the _first_ thing a blind or low-vision user, a potential contributor, or a journalist encounters, so clarity, accuracy, and accessibility here matter as much as anywhere in the project.

> Looking to contribute to the **watch app** itself instead? See the [CONTRIBUTING guide in the main app repo](https://github.com/NVCDevelopmentTeam/Zepp-OS-ScreenReader/blob/main/CONTRIBUTING.md).

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Ways to Contribute](#ways-to-contribute)
- [Development Environment Setup](#development-environment-setup)
- [Branching & Commit Conventions](#branching--commit-conventions)
- [Coding Standards](#coding-standards)
- [Accessibility Requirements (Non-Negotiable)](#accessibility-requirements-non-negotiable)
- [Content Changes](#content-changes)
- [Pull Request Process](#pull-request-process)
- [Reporting Bugs](#reporting-bugs)
- [Translations](#translations)
- [Getting Help](#getting-help)

## Code of Conduct

This project follows the [Code of Conduct](./CODE_OF_CONDUCT.md). By participating, you agree to uphold it.

## Ways to Contribute

| Contribution type      | Examples                                                               |
| ---------------------- | ---------------------------------------------------------------------- |
| 🐛 Bug reports         | Broken links, layout issues, console errors, mobile rendering bugs     |
| ♿ Accessibility fixes | Missing alt text, poor contrast, keyboard traps, unlabeled form fields |
| 📝 Content             | Fixing typos, clarifying install instructions, writing news posts      |
| 🎨 Design              | Visual polish that doesn't compromise accessibility                    |
| 🌍 Translations        | Localizing site copy into new languages                                |
| 🧑‍💻 Features            | New pages/sections, performance improvements, SEO metadata             |

## Development Environment Setup

```bash
# 1. Fork the repo, then clone your fork
git clone https://github.com/<your-username>/Zepp-OS-ScreenReader.git
cd Zepp-OS-ScreenReader/site/htdocs

# 2. Install dependencies
npm install

# 3. Add the upstream remote
git remote add upstream https://github.com/NVCDevelopmentTeam/Zepp-OS-ScreenReader.git

# 4. Start the dev server
npm run dev -- --open
```

## Branching & Commit Conventions

- Branch off `main` with a descriptive prefix:
  - `feature/<short-description>` — new pages/sections/functionality
  - `fix/<short-description>` — bug fixes
  - `content/<short-description>` — copy/content-only changes
  - `a11y/<short-description>` — accessibility-specific fixes
  - `docs/<short-description>` — documentation-only changes
- Write clear, focused commit messages. [Conventional Commits](https://www.conventionalcommits.org/) style is encouraged:
  ```
  fix(nav): restore visible focus outline on mobile menu toggle
  feat(news): add pagination to news listing page
  a11y(contact): associate form labels with their inputs
  ```
- Rebase on `upstream/main` before opening a PR.

## Coding Standards

- Follow the existing SvelteKit project conventions — file-based routing under `src/routes/`, shared components/utilities under `src/lib/`.
- Run before committing (adjust to whatever scripts exist in `package.json`):
  ```bash
  npm run check    # svelte-check / type checking
  npm run lint      # ESLint
  npm run format     # Prettier
  ```
- Prefer semantic HTML elements over `<div>`-heavy markup — see [Accessibility Requirements](#accessibility-requirements-non-negotiable) below.
- Keep components small and focused; avoid duplicating layout logic across pages when a shared component in `src/lib/` would do.
- Optimize images before committing them (compressed, appropriately sized, modern formats where practical).

## Accessibility Requirements (Non-Negotiable)

This is the website for a **screen reader project**. Accessibility bugs here are not cosmetic — they undermine the project's credibility. Every PR touching markup or styling must satisfy:

- [ ] **Semantic HTML** — native elements (`<button>`, `<nav>`, `<main>`, `<label>`, proper heading order) before ARIA
- [ ] **Keyboard operability** — every interactive element reachable and usable via `Tab` / `Enter` / `Space` / arrow keys, with no keyboard traps
- [ ] **Visible focus states** — never remove `:focus` styling without an equally visible replacement
- [ ] **Color contrast** — text and UI elements meet WCAG 2.1 AA contrast ratios
- [ ] **Alt text** — meaningful images have descriptive `alt`; decorative images use `alt=""`
- [ ] **Form labels** — every input has a properly associated `<label>`
- [ ] **Screen reader spot-check** — for anything interactive or navigational, test with at least one screen reader (VoiceOver, NVDA, or JAWS) before opening the PR

If you can't test with a screen reader yourself, say so explicitly in the PR description so a reviewer can verify.

## Content Changes

For copy-only changes (fixing typos, updating install steps, adding a news post):

- Keep language clear and jargon-free — remember a significant share of readers may be using assistive technology or may not be native English speakers.
- Match the existing tone: direct, warm, and respectful of the reader's time.
- If updating technical instructions (install steps, version requirements), cross-check against the [main app repo's README](https://github.com/NVCDevelopmentTeam/Zepp-OS-ScreenReader/blob/main/README.md) to keep both in sync.

## Pull Request Process

1. For anything beyond a small fix, open an issue first to discuss the approach.
2. Keep PRs focused — one page/feature/fix per PR.
3. Include in your PR description:
   - What changed and why
   - Screenshots for visual changes (desktop + mobile if layout is affected)
   - Screen-reader testing notes for interactive changes
   - Any known limitations
4. Ensure lint/format/type checks pass.
5. Be responsive to review feedback; if you can't continue a PR, let us know so someone else can pick it up.

## Reporting Bugs

Open a [new issue](../../issues/new) and include:

- URL of the affected page
- Browser and device (including screen reader + version, if the bug is accessibility-related)
- Steps to reproduce
- Expected vs. actual behavior
- Screenshot or screen recording if helpful

## Translations

To localize site content:

1. Check whether an i18n structure already exists in `src/lib/` (e.g. locale JSON files) before introducing a new pattern.
2. Keep terminology consistent with how ZSR itself is described in that language on the app side — see the [main repo's localization guide](https://github.com/NVCDevelopmentTeam/Zepp-OS-ScreenReader/blob/main/README.md#adding-a-new-language).
3. Have translated copy reviewed by another speaker where possible — tone matters as much as accuracy on a public-facing site.

## Getting Help

- Ask in [Discord](https://discord.gg/DAZU3E4mSP)
- Open an issue tagged `question`
- Email [contact@zeppreader.com](mailto:contact@zeppreader.com)

---

Thank you for helping make this site clear, fast, and genuinely accessible. 💜
