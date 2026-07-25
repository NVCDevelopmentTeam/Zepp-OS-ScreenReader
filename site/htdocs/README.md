# Zepp OS Screen Reader — Official Website

<p align="center">
  <img src="https://img.shields.io/badge/built%20with-SvelteKit-FF3E00?logo=svelte&logoColor=white" alt="SvelteKit">
  <img src="https://img.shields.io/badge/license-MIT-green" alt="License">
  <img src="https://img.shields.io/badge/accessibility-WCAG%202.1%20AA%20target-blueviolet" alt="Accessibility">
  <img src="https://img.shields.io/badge/PRs-welcome-brightgreen" alt="PRs Welcome">
</p>

<p align="center">
  <strong>The official marketing, documentation, and community hub for <a href="https://www.zeppreader.com">Zepp OS Screen Reader (ZSR)</a> — built with SvelteKit.</strong>
</p>

<p align="center">
  <a href="https://www.zeppreader.com">Live Site</a>
  ·
  <a href="https://github.com/NVCDevelopmentTeam/Zepp-OS-ScreenReader">Main ZSR App Repo</a>
  ·
  <a href="https://discord.gg/DAZU3E4mSP">Discord</a>
  ·
  <a href="./CONTRIBUTING.md">Contributing Guide</a>
</p>

---

## About

This repository powers **[zeppreader.com](https://www.zeppreader.com)**, the public-facing website for the Zepp OS Screen Reader project. It hosts the marketing homepage, news/updates, project information, and support/accessibility resources for **ZSR** — an open-source screen reader that brings text-to-speech, gesture navigation, and braille support to Zepp OS smartwatches for blind and low-vision users.

> Looking for the **watch app source code** instead of the website? That lives in the main [Zepp-OS-ScreenReader](https://github.com/NVCDevelopmentTeam/Zepp-OS-ScreenReader) repository.

### A Note on Why This Site Holds Itself to a Higher Bar

Because this project exists to serve blind and low-vision users, **the website itself is expected to be a genuinely accessible experience** — not just a page about accessibility. Semantic HTML, keyboard navigability, sufficient color contrast, and screen-reader-friendly markup aren't a "nice to have" here; they're the baseline. See [Accessibility Standards](#accessibility-standards) below before contributing UI changes.

## Site Map

| Page                       | Purpose                                                |
| -------------------------- | ------------------------------------------------------ |
| `/`                        | Homepage — feature overview, quick-start install steps |
| `/news`                    | Project announcements and updates                      |
| `/about`                   | Project background and mission                         |
| `/contact`                 | Contact information                                    |
| `/support`                 | Help and troubleshooting resources                     |
| `/accessibility-statement` | The site's own accessibility commitments               |
| `/privacy-policy`          | Privacy policy                                         |

## Tech Stack

- **[SvelteKit](https://kit.svelte.dev/)** — application framework
- **Svelte** — component model
- Static/SSR rendering via SvelteKit's adapter (see `svelte.config.js`)

## Getting Started

### Prerequisites

- **Node.js** ≥ 18 (LTS recommended)
- **npm**, **pnpm**, or **yarn** (examples below use `npm`)

### Setup

```bash
git clone https://github.com/NVCDevelopmentTeam/Zepp-OS-ScreenReader.git
cd Zepp-OS-ScreenReader/site/htdocs   # or the root of this repo, if cloned standalone
npm install
```

### Development Server

Start a local dev server with hot-reload:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

### Production Build

Create an optimized production build:

```bash
npm run build
```

Preview the production build locally before deploying:

```bash
npm run preview
```

### Type Checking & Linting

If configured in `package.json`, run these before opening a PR:

```bash
npm run check      # svelte-check / type checking
npm run lint        # ESLint
npm run format       # Prettier
```

## Project Structure

```
site/htdocs/
├── src/
│   ├── routes/          # SvelteKit file-based routing (/, /news, /about, /contact, ...)
│   ├── lib/              # Shared components, utilities, stores
│   └── app.html            # HTML shell
├── static/                  # Static assets (favicon, images, robots.txt)
├── svelte.config.js           # SvelteKit configuration (adapter, preprocessors)
├── vite.config.js               # Vite build configuration
└── package.json                  # Dependencies & npm scripts
```

> If your local layout differs, please open a PR updating this section — accurate docs matter as much as accurate code.

## Accessibility Standards

Before submitting UI changes, please verify:

- **Semantic HTML first** — use native elements (`<button>`, `<nav>`, `<label>`, headings in order) before reaching for ARIA roles.
- **Keyboard navigability** — every interactive element must be reachable and operable via keyboard alone (`Tab`, `Enter`, `Space`, arrow keys where appropriate).
- **Color contrast** — text and interactive elements should meet WCAG 2.1 AA contrast ratios.
- **Screen reader testing** — test critical flows (navigation, forms, the install walkthrough) with at least one screen reader (VoiceOver, NVDA, or JAWS) before opening a PR for anything user-facing.
- **Alt text & labels** — every meaningful image needs descriptive `alt` text; decorative images should be marked `alt=""`.
- **Focus management** — visible focus indicators must never be removed without an equally visible replacement.

If you're unsure whether a change meets these standards, say so in your PR — a reviewer or another contributor can help verify.

## Contributing

Contributions of all kinds are welcome — content updates, accessibility fixes, new pages, translations, and design improvements. Please:

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-change` or `fix/your-fix`
3. Make your changes, following the [Accessibility Standards](#accessibility-standards) above
4. Run type checks / lint / format before committing
5. Open a Pull Request describing what changed and why — screenshots are appreciated for visual changes, and screen-reader testing notes are appreciated for anything interactive

For the full contribution workflow and coding conventions, see [`CONTRIBUTING.md`](./CONTRIBUTING.md).

## Deployment

This site deploys from the `main` branch. If you're setting up your own deployment (e.g. for a fork or preview environment), configure the appropriate [SvelteKit adapter](https://kit.svelte.dev/docs/adapters) in `svelte.config.js` for your target platform (Vercel, Netlify, Node, static, etc.).

## Community

- 💬 **Discord:** [discord.gg/DAZU3E4mSP](https://discord.gg/DAZU3E4mSP) — for questions, discussion, and support
- 🐛 **Issues:** Use this repo's [Issues](../../issues) for site bugs (broken links, rendering issues, accessibility gaps); use the [main app repo's issues](https://github.com/NVCDevelopmentTeam/Zepp-OS-ScreenReader/issues) for watch-app bugs
- 📧 **Contact:** [contact@zeppreader.com](mailto:contact@zeppreader.com)

## License

This project is licensed under the **MIT License** — see [`LICENSE`](./LICENSE) for details.

## Acknowledgements

- Built with [SvelteKit](https://kit.svelte.dev/) by the Svelte team
- Maintained by the [NVC Development Team](https://github.com/NVCDevelopmentTeam)
- Everyone contributing feedback, translations, and accessibility testing to make this site — and ZSR itself — better

---

<p align="center">Made with ❤️ for a more accessible wearable ecosystem.</p>
