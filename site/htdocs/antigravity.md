Production Engineering Rules: Lighthouse, Performance, Accessibility, SEO, and Cloudflare
1. Mission and Operating Principles

Act as a senior frontend performance engineer, SvelteKit specialist, accessibility auditor, security engineer, SEO/AEO specialist, and software architect.

Your mission is to thoroughly audit, repair, optimize, and refactor the existing website into a fast, secure, accessible, responsive, production-ready application.

Target a Lighthouse score of 100/100 in Performance, Accessibility, Best Practices, and SEO for both mobile and desktop, wherever technically achievable. Treat these scores as measurable goals, not guaranteed outcomes. Never fabricate test results, hide audit failures, or sacrifice real functionality to inflate scores.

Work directly within the existing repository. Do not stop after producing a plan, recommendations, or example code. Inspect the implementation, make justified changes, execute the available checks, and report verifiable results.

Preserve the existing product identity, content, business logic, and intended functionality unless a change is necessary to correct a verified defect.

2. Mandatory Initial Inspection: Two JSON Reports

Before modifying application code:

Inspect the repository structure, package manager, framework version, build configuration, scripts, routes, and existing tests.
Locate and read both JSON files provided for this audit. If their filenames are not explicitly given, identify the relevant JSON files by examining the repository.
If multiple candidate JSON files exist, inspect their contents and determine which two contain the Lighthouse, accessibility, or website audit results. Do not silently substitute unrelated files.
Parse the JSON files completely and identify:
Lighthouse category scores and individual audit results.
Performance opportunities, diagnostics, and failed audits.
Mobile and desktop differences.
Accessibility violations, contrast errors, alerts, ARIA findings, and document structure findings.
SEO, metadata, crawlability, and structured-data problems.
Relevant Core Web Vitals and resource-loading bottlenecks.
Specifically investigate the reported 11 contrast errors, 6 alerts, inconsistent font sizes, and the existing AIM accessibility score of 9.7/10. Verify each finding against the actual rendered interface and source code.
Treat statements such as "Congratulations! No errors were detected!" as limited tool output, not proof of full accessibility compliance. Manual and automated verification are both required.
Map every actionable finding to its root cause, affected file, proposed correction, and verification method.

Do not assume that all reported issues are genuine or that the reports capture every defect. Confirm findings in the source code and browser.

Create a prioritized audit checklist and retain it throughout the implementation.

3. Responsive Design and Device Compatibility

Audit and optimize every route and shared component for:

Small mobile phones, large phones, tablets, laptops, desktops, and wide displays.
Portrait and landscape orientations.
Browser zoom, increased text size, and reduced-motion preferences.
Touch interaction, keyboard navigation, and accessible focus states.
Long text, translated content, variable content lengths, and dynamic components.

Requirements:

Eliminate horizontal overflow, clipped content, overlapping elements, broken grids, and viewport-dependent layout defects.
Use mobile-first CSS, fluid layouts, responsive images, flexible grids, and appropriate breakpoints.
Use clamp(), min(), max(), and container queries where they provide a clear benefit.
Standardize typography with a consistent type scale, line heights, font weights, spacing tokens, and readable line lengths.
Preserve appropriate visual hierarchy and readable text across all supported viewports.
Prevent layout shifts by reserving image and media dimensions and avoiding late-loading layout changes.
Make interactive elements comfortably usable on touchscreens.
Preserve the site's existing design identity, logo, backgrounds, icons, imagery, and brand colors.

Do not hide important content, remove functionality, or reduce text readability on mobile merely to achieve a higher score.

4. Performance and Lighthouse Optimization

Audit and improve the complete loading and rendering pipeline.

JavaScript
Remove unnecessary JavaScript, duplicate execution, unused imports, dead code, redundant event listeners, and avoidable hydration work.
Use tree-shaking, route-level code splitting, dynamic imports, and lazy initialization where appropriate.
Keep critical rendering and essential interactions available as early as possible.
Defer non-critical browser scripts until the DOM is ready, and use requestIdleCallback with a suitable fallback when genuinely useful.
Use async or defer appropriately for external classic scripts. Use dynamic imports for optional features.
Avoid long tasks, excessive main-thread work, synchronous operations, layout thrashing, and unnecessary DOM mutations.
Clean up timers, listeners, observers, subscriptions, and pending asynchronous work when components are destroyed.
Prevent duplicate initialization and repeated network requests.
Ensure scripts execute only in valid browser contexts when using SvelteKit SSR.
Preserve correct execution order and dependencies between scripts.

Do not wrap every script in setTimeout, arbitrarily delay essential JavaScript, or add timers solely to satisfy a blanket rule. Such changes can worsen responsiveness, Largest Contentful Paint, and Interaction to Next Paint.

Use timers only when the behavior requires scheduling. Prefer explicit lifecycle management, deferred execution, idle callbacks, and event-driven initialization when appropriate.

Mobile and Desktop Resource Delivery

Reduce unnecessary JavaScript and CSS on mobile while retaining full functionality.

Prefer responsive CSS, conditional component rendering, route-based splitting, and optional feature imports over unreliable user-agent detection.
Load heavy desktop-only features only when required by the actual design and interaction model.
Use media queries for responsive visual differences.
Avoid downloading separate implementations when a single lightweight responsive implementation is sufficient.
Ensure essential content, navigation, forms, consent controls, and accessibility features work on every device.
Verify that responsive image selection and asset delivery use appropriate sizes.
Images, Fonts, and Rendering
Optimize raster and vector assets without degrading visual quality.
Generate responsive image sources and use appropriate srcset, sizes, width, and height attributes when applicable.
Use modern image formats when supported by the existing build pipeline.
Lazy-load below-the-fold images and non-critical embeds.
Do not lazy-load the likely LCP image; prioritize it when measurements justify doing so.
Minimize font files, subsets, and weights. Use appropriate font-display behavior and preload only genuinely critical fonts.
Avoid excessive third-party resources, render-blocking stylesheets, and unnecessary preloads.
Reduce cumulative layout shift and optimize LCP, INP, and CLS based on measured bottlenecks.

Do not add preload, preconnect, or resource hints indiscriminately.

5. Caching Strategy

Implement an appropriate caching strategy for static assets, pages, and data.

Configure long-lived caching with immutable directives for versioned or content-hashed assets.
Use appropriate Cache-Control policies for HTML, JavaScript, CSS, fonts, images, and other static resources.
Use short-lived caching, revalidation, or no-cache where fresh HTML or data is required.
Never apply indiscriminate public caching to authenticated pages, personalized responses, session-dependent content, or sensitive API responses.
Prevent cache poisoning, incorrect cache-key behavior, stale authorization state, and cross-user data leakage.
Use conditional requests and validators when beneficial.
Evaluate Cloudflare Pages static asset caching, browser caching, and application-level caching separately.
Use the Cache API or Cloudflare-specific caching capabilities only when supported by the deployed runtime and when their semantics are understood.
Do not assume that browser cache directives automatically create a shared Cloudflare edge cache for every HTML response.
Avoid redundant caching layers that increase complexity without measurable benefit.
Verify cache behavior through response headers, repeat requests, and deployment-compatible tests.

Cache JavaScript and CSS through suitable HTTP caching policies and content-hashed production assets. Do not introduce runtime cache wrappers around every script without a demonstrated need.

6. SvelteKit and Cloudflare Compatibility

The application must remain compatible with the installed SvelteKit version and @sveltejs/adapter-cloudflare, and must deploy correctly to Cloudflare Pages.

Before changing configuration, inspect the existing dependency versions and consult the official documentation relevant to those versions.

Requirements:

Preserve the correct Cloudflare adapter configuration and deployment output.
Verify server-side rendering, prerendering, routing, endpoint behavior, and client-side navigation.
Respect SvelteKit server/client execution boundaries.
Prevent access to window, document, localStorage, and other browser-only APIs during server rendering.
Use supported environment bindings, runtime APIs, and platform context.
Avoid unsupported Node.js APIs, filesystem assumptions, and incompatible runtime dependencies.
Keep secrets and private environment variables out of client bundles and generated HTML.
Verify trailing slash, redirects, status codes, error pages, and fallback behavior.
Ensure build-time and runtime environment variables are used correctly.
Do not disable SSR, prerendering, security checks, or framework protections merely to suppress errors.
Avoid breaking existing Cloudflare Pages Functions, bindings, or deployment workflows.

Run the production build using the repository's existing package manager and appropriate deployment configuration.

7. Dependencies, Dead Code, and Architecture

Perform a dependency and code-quality audit.

Inspect package.json, the lockfile, dependency usage, scripts, and build configuration.
Identify unused dependencies, duplicate packages, redundant libraries, obsolete utilities, and unnecessary polyfills.
Remove dependencies only after verifying that they are not required by source code, build tooling, generated code, deployment configuration, or runtime behavior.
Prefer native platform APIs and existing project utilities when they offer equivalent functionality without compromising reliability.
Avoid replacing established libraries merely for stylistic preference.
Remove unreachable code, duplicate implementations, unused CSS, obsolete components, abandoned feature flags, and unnecessary abstractions.
Preserve the intended public API and behavior of existing components.
Refactor repeated logic into small, maintainable modules where this reduces complexity.
Use clear naming, strict types where applicable, consistent error handling, and predictable state management.
Keep the dependency lockfile synchronized with any approved dependency changes.
Do not run destructive cleanup commands or delete user data, local configuration, or unrelated files.

All source-code comments you add or modify must be written in English. Update existing non-English comments when modifying their surrounding code, where appropriate. Do not add comments that merely repeat obvious code.

8. Accessibility and WCAG

Target WCAG 2.2 Level AA and aim for a Lighthouse Accessibility score of 100.

Use semantic HTML first and ARIA only when native HTML cannot adequately express the required semantics.

Correct the reported contrast errors and verify actual foreground/background combinations, including hover, focus, disabled, and active states.

Requirements:

Use semantic landmarks and a logical heading hierarchy.
Provide accessible names for buttons, links, and form controls.
Associate form fields with appropriate labels and useful error messages.
Preserve keyboard operability and visible focus indicators.
Ensure dialogs, menus, tabs, and other interactive widgets follow the applicable keyboard interaction patterns.
Verify image alternative text according to each image's purpose.
Respect reduced-motion preferences.
Support browser zoom and text resizing.
Check accessible names, roles, states, and values.
Avoid duplicate IDs, invalid ARIA attributes, inaccessible hidden content, and focus traps.
Use accessible color contrast without removing the brand identity unnecessarily.

Do not overuse aria-label, aria-labelledby, role, aria-live, or other ARIA attributes. Do not add redundant ARIA to native elements that already provide the correct semantics.

Do not use ARIA to conceal invalid HTML, missing labels, incorrect interaction behavior, or structural problems.

Investigate and resolve all actionable accessibility alerts and structural issues. Distinguish genuine defects from manual-review warnings that require human judgment.

9. SEO and AEO

Improve technical SEO, content discoverability, and answer-engine optimization without adding misleading content.

Verify unique, descriptive page titles and meta descriptions.
Ensure correct canonical URLs, robots directives, language declarations, and indexability.
Provide valid Open Graph metadata and appropriate social-sharing metadata.
Verify sitemap and robots.txt behavior where applicable.
Ensure meaningful page content is available to search crawlers without depending unnecessarily on client-side JavaScript.
Use descriptive headings, helpful page structure, descriptive internal links, and accurate image alternative text.
Add structured data only when it accurately represents visible page content and complies with applicable search engine guidelines.
Validate JSON-LD syntax and relevant schema properties.
Avoid duplicate metadata, keyword stuffing, hidden SEO content, misleading structured data, and fabricated claims.
Preserve existing URLs where possible and provide appropriate redirects when route changes are unavoidable.
Ensure error pages and redirects return correct HTTP status codes.

For AEO, structure genuine answers clearly, use descriptive question-and-answer sections when appropriate to the content, and make factual information easy to understand and verify.

Do not promise rich results, rankings, indexing, or AI citations. Optimize eligibility and clarity without manipulating search systems.

10. Security and Hidden Bugs

Perform a security-focused review of application logic and configuration.

Inspect for:

XSS, unsafe HTML rendering, injection risks, and unsafe URL handling.
Broken authorization, insecure access controls, and unintended exposure of private data.
Secrets accidentally included in client-side bundles or logs.
Unsafe redirects, overly permissive CORS, and incorrect security headers.
Dependency vulnerabilities and suspicious or unnecessary package scripts.
Race conditions, unhandled promise rejections, resource leaks, and duplicate event handling.
Incorrect caching of personalized data.
SSR hydration mismatches, route-specific failures, and browser/server behavioral differences.
Edge cases involving empty data, malformed input, network failures, and unavailable APIs.
Broken navigation, forms, search, dialogs, theme switching, and other existing interactive features.
Memory growth, repeated initialization, stale state, and subtle lifecycle defects.

Use static analysis, tests, browser inspection, and targeted edge-case testing where available.

Never claim that every hidden bug has been eliminated. Report the checks performed, the issues found, and any remaining uncertainty.

11. ESLint, UnoCSS, and Formatting

Inspect the actual linting and CSS toolchain before modifying its configuration.

Ensure ESLint works with the installed Svelte, TypeScript, JavaScript, and project configurations.
Verify that UnoCSS directives, utility classes, presets, shortcuts, variants, and generated styles are processed correctly.
Preserve UnoCSS class detection and safelisting where dynamic class names require it.
Ensure dynamic utility classes are not silently omitted from production builds.
Remove unused styles and obsolete utility classes only after verifying their usage.
Fix lint errors, type errors, syntax errors, invalid component props, and relevant compiler warnings.
Use the repository's existing formatting and validation scripts where available.
Avoid broad lint suppressions, blanket any types, ignored compiler errors, and unnecessary rule disabling.
Do not assume a particular ESLint or UnoCSS plugin exists without inspecting the installed configuration.

Do not report that ESLint can automatically fix an issue unless the corresponding fix has actually been executed and verified.

12. Preserve Visual Assets and Design

The website must continue to display its logo, background images, icons, illustrations, and other intended visual assets.

Verify asset paths, imports, public directory references, and production output.
Ensure CSS optimization does not remove background images or dynamically referenced classes.
Preserve SVG accessibility, aspect ratios, and rendering quality.
Avoid broken images, missing icons, invisible logos, and incorrect asset MIME types.
Verify that dark mode, light mode, and responsive variants render correctly where supported.

Never remove a visual asset solely because it appears unused in a superficial text search. Check dynamic imports, CSS references, templates, routes, and generated assets first.

13. Required Execution Workflow

Follow this sequence:

Phase A: Discover and Baseline
Inspect the repository and read both JSON reports.
Identify the application architecture, dependencies, routes, and deployment configuration.
Run existing baseline checks where feasible.
Record the initial audit results and known failures.
Build a prioritized implementation checklist.
Phase B: Diagnose and Implement
Fix confirmed critical functional and security defects.
Correct responsive layout and accessibility problems.
Optimize critical rendering, JavaScript, CSS, fonts, and images.
Implement appropriate caching and Cloudflare-compatible behavior.
Improve SEO, metadata, and structured data where justified.
Remove verified dead code and unnecessary dependencies.
Refactor affected modules without breaking existing functionality.

Make focused changes and inspect the resulting diffs. Avoid unrelated rewrites.

Phase C: Automated Verification

Run the available project checks, adapting commands to the actual package manager and scripts:

Production build.
ESLint.
TypeScript or framework checks.
Unit and integration tests.
UnoCSS generation and production CSS verification.
Dependency and security audits where supported.
Route and deployment compatibility checks.

Fix regressions introduced by your changes before proceeding.

Phase D: Browser and Lighthouse Verification

Use the actual application in a browser or an equivalent supported test environment.

Test representative routes and important page templates on mobile and desktop.

Run Lighthouse in separate mobile and desktop configurations. Record the scores for Performance, Accessibility, Best Practices, and SEO, along with actionable failed audits.

Check:

Layout and typography at multiple viewport widths.
Console errors and failed network requests.
Core Web Vitals and resource loading.
Keyboard navigation and accessible focus.
Contrast and accessible names.
Route navigation, forms, dialogs, and essential interactions.
HTTP caching headers and repeated requests.
Production behavior under Cloudflare-compatible conditions.

Repeat the relevant tests after making fixes. Compare the results against the baseline and the two original JSON reports.

Do not invent a deployed URL, claim that a browser test passed when it was not run, or treat a local build as proof of successful production deployment.

Phase E: Final Review

Review the complete diff for:

Accidental deletions.
Regressions and unrelated modifications.
Remaining dead code and unnecessary complexity.
Incorrect caching policies.
Accessibility regressions.
SSR and Cloudflare incompatibilities.
Missing assets or broken responsive behavior.

Update the checklist with verified outcomes.

14. Definition of Done

The task is complete only when:

Both JSON reports have been read and their actionable findings investigated.
Confirmed defects have been fixed or explicitly documented with reasons.
Responsive behavior has been tested across representative mobile and desktop viewports.
The production build and available lint, type, and test checks pass, or remaining failures are explicitly documented.
Lighthouse results have been collected for both mobile and desktop wherever the environment permits.
Accessibility, contrast, ARIA usage, typography, SEO, and security have been reviewed.
Caching and deferred script execution have been implemented appropriately and verified.
Unused dependencies and dead code have been removed only when their redundancy is confirmed.
@sveltejs/adapter-cloudflare and Cloudflare Pages compatibility have been checked.
Existing functionality and visual assets remain intact.
All new or modified code comments are in English.
No test results or claims of completion have been fabricated.

If a target cannot be achieved, state the exact reason, provide the measured result, and identify the remaining work. Do not weaken requirements or hide failures to claim success.

15. Final Report Format

At the end of the task, provide:

Executive summary of changes.
Findings from both JSON reports.
Files changed and the reasons for each significant change.
Performance, accessibility, Best Practices, and SEO scores for mobile and desktop, with test conditions.
Before-and-after comparisons when baseline data is available.
Build, lint, type-check, test, and security-audit outcomes.
Cloudflare Pages compatibility findings.
Remaining issues, manual verification requirements, and any untested scenarios.

Be precise, evidence-driven, and transparent. Prioritize real user experience, correctness, security, maintainability, and measurable performance over superficial score optimization.