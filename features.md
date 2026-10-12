# ZSR (Zepp OS Screen Reader) — Comprehensive Debugging, Compatibility, and Feature Enhancement Task

You are working on **ZSR (Zepp OS Screen Reader)**, an accessibility screen reader for Zepp OS smartwatches.

Your task is to **deeply audit, debug, redesign, and extend ZSR** so that it works reliably across as many Zepp OS versions, devices, system applications, and third-party applications as technically possible.

## IMPORTANT: READ THE ENTIRE PROJECT FIRST

Before modifying anything:

1. Read **every `.md` file in the project**, especially `features.md`.
2. Read and understand **every relevant `.js` source file**.
3. Inspect the current architecture, APIs, modules, event handling, UI logic, gesture handling, speech engine, accessibility logic, settings, installation mechanism, and version compatibility layer.
4. Do not implement features mechanically without understanding how the existing architecture works.
5. Identify existing features that are partially implemented, broken, duplicated, fragmented, or incompatible with newer Zepp OS versions.
6. Preserve working functionality unless there is a concrete reason to change it.
7. Avoid creating a separate codebase for every Zepp OS version. The goal is **one maintainable codebase with version-aware compatibility layers**.

The minimum supported Zepp OS API target is **API 2.0**, while newer Zepp OS versions should be supported whenever their APIs provide additional capabilities.

---

# PART 1 — FEATURES AND FUNCTIONAL REQUIREMENTS

## 1\. Cross-Version Zepp OS Compatibility

Design ZSR around a compatibility/abstraction layer.

Requirements:

- Support Zepp OS API 2.0 as the minimum baseline.
- Detect the actual Zepp OS/API version at runtime.
- Detect device capabilities rather than assuming that every device provides the same APIs.
- Use feature detection whenever possible.
- Newer APIs and TTS capabilities should automatically become available on newer Zepp OS versions.
- If a feature is unavailable because the current Zepp OS version does not provide the required API, report it as `Unavailable` instead of crashing.
- Do not use APIs that do not exist on the current device without proper guards.
- Avoid maintaining completely separate implementations for every Zepp OS release.
- Build reusable adapters/interfaces so different Zepp OS versions can communicate with the same ZSR core.
- Keep local/device-specific functionality separate from global/system-wide accessibility functionality.
- Newer Zepp OS versions should receive additional capabilities without breaking older supported versions.

If a feature cannot technically be implemented reliably on a particular Zepp OS version, document the limitation clearly.

## 2\. Developer/Experimental Features

If a feature:

- is unstable,
- cannot currently be implemented reliably,
- depends on undocumented behavior,
- is restricted by Zepp OS,
- has no technically reliable workaround,
- or behaves differently between OS versions,

do **not** silently expose it as a normal stable feature.

Instead:

- Put it under **Developer / Experimental Settings**.
- Clearly indicate why it is experimental.
- Make it possible for developers to test it.
- Keep the architecture ready for future improvements when Zepp OS limitations are removed.

This is especially important for features limited by the Zepp OS platform itself rather than by ZSR's implementation.

---

## 3\. Screen Reader Navigation Model

Implement a dedicated smartwatch-oriented navigation system inspired by:

- Android TalkBack
- iOS VoiceOver
- Jieshuo
- NVDA
- JAWS
- Prudence Screen Reader
- Voice Assistant

Do **not** simply copy their desktop/phone interaction models.

Adapt the interaction model specifically for:

- small smartwatch screens,
- touchscreens,
- one-handed operation,
- limited physical controls,
- circular or rectangular displays,
- short interactions,
- accessibility,
- low cognitive load.

Provide a dedicated **Reading/Navigation Control Menu**.

The menu should allow users to switch navigation/reading modes such as:

- item-by-item navigation,
- character navigation,
- word navigation,
- sentence navigation,
- line navigation,
- heading/navigation where applicable,
- reading continuously,
- screen scanning,
- control navigation.

Gestures must be optimized for a smartwatch rather than copied directly from TalkBack or VoiceOver.

---

## 4\. Cursor / Focus Indicator

Provide a visual focus cursor.

Requirements:

- Show a border around the currently focused element.
- The border should visually indicate the current accessibility focus.
- It should work similarly in concept to accessibility focus indicators used by TalkBack/Jieshuo.
- Allow the user to:
  - enable/disable the cursor,
  - change its color,
  - configure its appearance where technically possible.
- The cursor should not unnecessarily interfere with screen recordings or screenshots.
- Provide an option to completely hide it.
- Provide a visual indication when ZSR is active without forcing a distracting cursor.

The focus indicator must work across system and third-party applications whenever technically possible.

---

## 5\. Screen Regions

Create a logical screen-region model:

- Status bar
- Navigation area
- Main/content area
- Notification area
- Other system-specific areas

ZSR should be able to identify and navigate between these regions.

The user should be able to understand where the currently focused element is located.

---

## 6\. Gesture Configuration

Allow users to customize gesture direction.

For example:

- vertical gestures can be mapped to horizontal navigation,
- horizontal gestures can be mapped to vertical navigation.

Study Jieshuo's configurable gesture approach, but redesign it specifically for smartwatch usability.

Gestures must be:

- customizable,
- conflict-aware,
- responsive,
- immediately applied,
- resistant to accidental activation.

---

## 7\. Two-Finger Scrolling

Implement two-finger scrolling similar in concept to TalkBack.

Requirements:

- Scroll pages using two fingers.
- Scroll lists using two fingers.
- Detect vertical and horizontal scrolling where supported.
- Avoid conflicts with normal application gestures.
- Provide a fallback for devices/applications that do not expose normal scrolling APIs.

---

## 8\. Screen Wake / Time Announcement

When the display becomes active:

- ZSR should optionally announce the current time.
- The behavior should be configurable.
- It should work similarly in concept to accessible screen-reader wake announcements.

---

## 9\. Content Reading

ZSR should attempt to read:

- visible text,
- buttons,
- labels,
- menus,
- status information,
- notifications,
- messages,
- input fields,
- sliders,
- progress indicators,
- list items,
- system controls,
- application controls,
- image descriptions where available,
- icons,
- emoji,
- unlabeled controls.

If an element has no accessible label:

1. Try its content description.
2. Try its ID/resource identifier when useful.
3. Try its visible text.
4. Try its role/type.
5. Try other available metadata.
6. Provide a useful fallback description.

Do not blindly read technical IDs if doing so would make normal navigation confusing. Provide a developer/accessibility diagnostic mode for detailed element information.

---

## 10\. List Position

When navigating lists, ZSR should announce the position when available.

Example concept:

> "Weather, 3 of 8"

Do not invent a position when the application does not expose reliable list information.

---

## 11\. Text Input

Improve text-input accessibility.

ZSR should:

- read the contents of input fields,
- announce changes where appropriate,
- support character/word/sentence navigation,
- provide configurable typing feedback,
- remain responsive while typing.

Typing feedback should have at least:

- Read
- Do not read

### Password Input

Provide a password-reading setting:

- Enabled: read the actual password characters.
- Disabled: announce masked characters, such as "star".

The default should prioritize privacy and safety.

---

## 12\. Virtual Keyboard

The virtual keyboard must be designed specifically for smartwatch accessibility.

Touch exploration behavior:

- While touching and moving over the keyboard, ZSR reads the currently touched character.
- When the user lifts their finger, the focused character is entered.

The implementation must be compatible with the system keyboard whenever possible rather than creating an isolated keyboard that breaks normal Zepp OS input behavior.

---

## 13\. Braille Keyboard

Implement a smartwatch-compatible braille input mechanism inspired by TalkBack's braille keyboard.

The interaction should allow the user to touch the screen with multiple fingers.

Concept:

- 1 finger = dot 1
- 2 fingers = two braille dots
- ...
- 6 fingers = six braille dots

However, do not blindly reproduce the phone implementation. Adapt it to the physical size, touch area, multitouch limitations, and capabilities of Zepp OS watches.

If a device/OS version cannot reliably support the required multitouch behavior, expose the feature as unavailable or experimental.

---

## 14\. Continuous Reading

When ZSR is reading a long text:

- Single tap should optionally pause/resume speech.
- Provide controls for stopping, pausing, resuming, and changing reading mode.
- Allow navigation while speech is active.
- Prevent speech from becoming impossible to control.

---

## 15\. Speech Mode

ZSR must remain enabled even when speech feedback is temporarily disabled.

Provide a gesture or other quick-access method to:

- turn speech feedback ON,
- turn speech feedback OFF,

without disabling ZSR itself.

This is important when a blind user is working together with sighted people or wants accessibility focus/navigation without constant speech.

---

## 16\. Speech Ducking

Implement an option similar in concept to TalkBack audio ducking.

When enabled:

- other audio becomes quieter while ZSR speaks,
- ZSR remains clearly audible,
- restore the original audio level afterward when technically possible.

The behavior must be configurable.

---

## 17\. Separate ZSR Volume

ZSR speech volume should be independently configurable from normal device volume whenever Zepp OS permits it.

Do not assume that system volume and accessibility speech volume are the same channel.

If the OS does not provide independent audio channels, clearly document the limitation.

---

## 18\. TTS Configuration

Default ZSR interface language:

- Follow the system language by default.

Default TTS language:

- Follow the system language by default.

However, allow manual override.

For eSpeak TTS:

- Default voice: English US
- Default variant: `male2`

Allow users to customize:

- voice,
- language,
- variant,
- pitch,
- speed,
- volume,
- intonation where supported.

These should be ZSR defaults, not hardcoded restrictions.

---

## 19\. Multilingual Content

ZSR should attempt to read any visible content.

When multilingual text is detected:

- automatically detect the language when technically possible,
- select an appropriate TTS voice/language,
- continue reading naturally.

Provide a manual language override for users who prefer fixed-language speech.

---

## 20\. Punctuation and Symbols

Provide four punctuation modes:

1. Read everything
2. Read most punctuation
3. Read some punctuation
4. Do not read punctuation

The setting should affect:

- punctuation,
- symbols,
- special characters.

---

## 21\. Capital Letters

Provide two capital-letter announcement modes:

- Change pitch when a capital letter is encountered.
- Explicitly announce that the character is uppercase.

Example:

> "A, uppercase"

The behavior should be configurable.

---

## 22\. Progress Announcements

For downloads, copying operations, synchronization, and similar progress operations, provide:

- Beep
- Speech
- Beep + speech
- No percentage announcement

Avoid excessive announcements for rapidly changing progress values.

Use sensible thresholds/debouncing.

---

## 23\. Notifications and Messages

ZSR should read:

- notifications,
- incoming messages,
- notification content,
- sender names,
- caller names,
- caller numbers where appropriate.

Provide configurable privacy behavior.

---

## 24\. Incoming Calls

Make incoming-call interaction accessible.

ZSR should:

- announce caller name,
- announce number when available,
- provide clear controls,
- make answering easier,
- make ending/rejecting calls easier.

Adapt the interaction to smartwatch hardware buttons and touch controls.

---

## 25\. Health and Fitness Information

Where Zepp OS exposes the necessary data, ZSR should read:

- workouts,
- exercise information,
- fitness sessions,
- heart rate,
- sleep information,
- SpO2,
- other supported health/fitness metrics.

Do not invent information that the API does not provide.

If health data APIs vary by Zepp OS version/device, use capability detection.

---

## 26\. Image and Icon Descriptions

Where metadata is available, ZSR should read:

- image descriptions,
- content descriptions,
- icon descriptions,
- accessibility labels.

If an image has no description, provide a useful fallback only when reliable metadata exists.

Do not hallucinate image content.

---

## 27\. Font and Formatting Information

Inspired by NVDA, provide accessibility information about:

- font information where available,
- formatting,
- emphasis,
- relevant text properties.

Only expose information that Zepp OS actually provides.

---

## 28\. System-Wide Accessibility

When ZSR is enabled, accessibility behavior should apply consistently across the system.

This includes:

- system applications,
- settings,
- notifications,
- navigation,
- unlocking,
- input,
- third-party applications,
- supported widgets,
- system dialogs.

The unlock process itself must be accessible.

Where a screen-reader-specific swipe-to-unlock interaction is technically possible, provide an interaction inspired by TalkBack while respecting Zepp OS constraints.

---

## 29\. Accessibility Activation

ZSR should be activatable through:

- Zepp OS Accessibility settings,
- smartwatch settings,
- Zepp smartphone companion application,
- hardware buttons where supported,
- configurable gestures,
- a large accessibility activation control,
- an accessibility shortcut.

Study activation approaches from:

- TalkBack
- VoiceOver
- NVDA
- JAWS
- Jieshuo
- Voice Assistant
- Prudence Screen Reader

Combine useful concepts while adapting them specifically to Zepp OS.

---

## 30\. Accessibility Settings Description

The Zepp OS accessibility settings must clearly explain what ZSR does.

A sighted user should understand:

- that ZSR is a screen reader,
- that it changes interaction behavior,
- that it provides spoken accessibility feedback,
- how to disable it,
- how to avoid accidentally enabling it.

This is important to prevent accidental activation.

---

## 31\. Installation and Discoverability

Investigate and fix situations where:

- ZSR installs on newer Zepp OS devices but does not appear correctly,
- ZSR cannot be activated,
- ZSR cannot be found in accessibility settings,
- the application icon does not appear,
- blind users cannot locate ZSR,
- system accessibility registration fails.

Ensure ZSR is discoverable and activatable through the correct Zepp OS mechanisms.

---

## 32\. Automatic Updates

Provide an automatic update mechanism where Zepp OS permits it.

Requirements:

- safely detect newer ZSR versions,
- avoid breaking compatibility,
- preserve user settings,
- handle update failures,
- clearly notify the user.

---

## 33\. Tutorials and Gesture Practice

Add a complete ZSR tutorial.

Include:

- introduction,
- how ZSR works,
- gesture training,
- practice mode,
- navigation practice,
- reading modes,
- speech controls,
- cursor controls,
- typing practice,
- emergency/disable instructions.

The tutorial must allow users to practice gestures without accidentally performing destructive actions.

---

## 34\. Screen Search

Provide screen-content search where technically possible.

Allow users to search for:

- visible text,
- controls,
- applications,
- labels.

---

## 35\. Reading Granularity

Support:

- character,
- word,
- sentence,
- line,
- paragraph/content block,
- screen,
- continuous reading.

---

## 36\. Visual Indicator

When ZSR is active, provide a configurable visual indicator.

Allow users to:

- enable/disable it,
- change its color,
- hide it when recording/screensharing,
- use a minimal indicator.

---

## 37\. User Personalization

Do not build ZSR as a rigid one-size-fits-all screen reader.

Users should be able to personalize:

- gestures,
- speech,
- TTS,
- cursor,
- reading verbosity,
- punctuation,
- capital announcements,
- progress announcements,
- speech mode,
- audio ducking,
- typing feedback,
- language,
- navigation behavior.

---

## 38\. Device-Specific Features

Some features should only be enabled when the device supports them.

Implement capability detection for:

- hardware buttons,
- crown/rotary controls,
- multitouch,
- TTS engines,
- audio channels,
- accessibility APIs,
- notification APIs,
- health APIs,
- system navigation APIs,
- input APIs.

ZSR should adapt itself to the actual device instead of assuming identical hardware.

---

## 39\. Feedback to Developers

Add a mechanism for users to send feedback/report problems to the developers.

Include enough diagnostic information to help developers debug:

- ZSR version,
- Zepp OS/API version,
- device model,
- enabled capabilities,
- relevant feature state.

Do not expose private user information unnecessarily.

---

# PART 2 — BUGS, DEBUGGING, ARCHITECTURE, AND RELIABILITY

## 40\. Full Code Audit

Before implementing new features, audit the entire project.

Inspect:

- every `.js` file,
- every `.md` file,
- configuration files,
- manifests,
- package metadata,
- accessibility declarations,
- API usage,
- event listeners,
- lifecycle handling,
- UI components,
- gesture handlers,
- speech engine,
- TTS integration,
- settings,
- persistence,
- installation logic.

Do not assume that `features.md` contains the complete current implementation.

---

## 41\. Existing Feature Verification

For every feature documented in `features.md`:

1. Determine whether it exists.
2. Determine whether it actually works.
3. Determine which Zepp OS versions support it.
4. Determine which devices support it.
5. Determine whether it is partially implemented.
6. Determine whether it conflicts with another feature.
7. Determine whether it is implemented in the correct architectural layer.

Mark each feature internally as:

- Implemented
- Partially implemented
- Broken
- Unsupported by current Zepp OS
- Experimental
- Needs redesign
- Not implemented

Do not claim a feature is implemented merely because documentation says it exists.

---

## 42\. Immediate UI and Input Response

Fix any delay between:

- user gesture,
- UI state change,
- accessibility focus,
- speech feedback.

Interaction logic must respond immediately whenever technically possible.

Avoid:

- unnecessary asynchronous delays,
- race conditions,
- duplicate event handlers,
- blocking operations,
- excessive TTS calls,
- event storms.

---

## 43\. Module Synchronization

ZSR modules must operate as a coordinated system.

Avoid fragmented behavior where:

- gesture handling does not know the current focus,
- speech does not know the navigation state,
- settings are not synchronized,
- cursor state differs from accessibility focus,
- different modules maintain conflicting state.

Create a central accessibility state where appropriate.

Possible shared state concepts include:

- current focus,
- current screen,
- navigation mode,
- speech state,
- cursor state,
- gesture mode,
- OS capabilities,
- current application,
- reading position.

Do not duplicate state unnecessarily.

---

## 44\. Local vs Global Features

Clearly distinguish:

### Local features

Features belonging to a particular application/screen/component.

### Global features

Features affecting the entire ZSR/system.

Examples of global behavior:

- speech mode,
- gesture mapping,
- cursor settings,
- TTS configuration,
- audio ducking,
- accessibility activation,
- navigation mode.

Examples of local behavior:

- current application focus,
- list position,
- current input field,
- current screen region.

Make sure changing a local setting does not accidentally change global behavior.

---

## 45\. API Compatibility

Every API that may vary by Zepp OS version must be protected.

Use:

- version checks,
- feature detection,
- capability abstraction,
- graceful fallbacks.

Never allow an unavailable API to crash ZSR.

If a feature cannot be implemented on an older version:

```
Feature: unavailable
Reason: required Zepp OS API is not available
```

rather than:

```
Application crash
```

---

## 46\. Newer Zepp OS Compatibility

Pay particular attention to newer Zepp OS releases.

Investigate why some newer devices:

- cannot install ZSR,
- install it but cannot activate it,
- do not show it in accessibility settings,
- do not show its icon,
- fail to expose accessibility functionality.

Do not assume that compatibility with an older Zepp OS automatically means compatibility with newer releases.

---

## 47\. Unsupported Feature Handling

Create a consistent mechanism for feature availability.

Every optional capability should have a state such as:

- Supported
- Supported with limitations
- Experimental
- Unavailable on this OS
- Unavailable on this device
- Temporarily disabled

The UI should not expose non-functional controls as if they were working.

---

## 48\. Error Handling

ZSR must fail gracefully.

A single unsupported feature must not crash:

- the screen reader,
- speech,
- navigation,
- the current application,
- the smartwatch UI.

Use isolated error handling around risky APIs.

---

## 49\. Performance

Optimize for smartwatch hardware.

Avoid:

- unnecessary polling,
- memory leaks,
- excessive object creation,
- excessive event listeners,
- continuous expensive screen scanning,
- repeated TTS initialization.

Prefer event-driven behavior.

---

## 50\. Speech Queue Management

The speech engine should have a proper queue/state manager.

It must prevent:

- duplicate announcements,
- stale announcements,
- announcements from a previous screen,
- speech continuing after navigation,
- excessive repetition.

When focus changes rapidly, obsolete speech should be cancellable.

---

## 51\. Accessibility Focus

Create a reliable accessibility-focus model.

Focus should:

- survive appropriate UI updates,
- move predictably,
- not jump randomly,
- correspond to the cursor,
- correspond to spoken content.

When an element disappears, intelligently move focus to a nearby valid element.

---

## 52\. Gesture Conflicts

Audit all gestures for conflicts between:

- ZSR gestures,
- application gestures,
- Zepp OS system gestures,
- scrolling,
- navigation,
- multitouch,
- hardware controls.

ZSR should not make the watch unusable.

---

## 53\. Unlocking

When ZSR is enabled, investigate whether the normal unlock flow becomes inaccessible.

Provide an accessibility-compatible unlock interaction where Zepp OS permits it.

Do not bypass security mechanisms.

---

## 54\. Testing Matrix

Create a compatibility matrix covering:

- Zepp OS API 2.0
- intermediate supported API versions
- latest available Zepp OS versions
- different display sizes
- different screen shapes
- different input hardware
- different TTS capabilities
- system applications
- third-party applications

For each feature record:

- supported,
- partially supported,
- unavailable,
- experimental,
- known limitation.

---

## 55\. Documentation

Update `features.md` after implementation.

Documentation must distinguish between:

- fully supported features,
- partially supported features,
- experimental features,
- OS limitations,
- device limitations.

Do not document hypothetical functionality as completed.

Also document why certain features cannot currently be implemented.

---

## 56\. Final Implementation Principles

The most important objective is:

> ZSR must enable blind users to independently operate and control their smartwatch instead of depending on sighted assistance.

However, do not achieve this by blindly copying existing screen readers.

Use TalkBack, VoiceOver, Jieshuo, NVDA, JAWS, Prudence Screen Reader, and Voice Assistant as **design references**.

Then create a solution specifically optimized for:

- Zepp OS,
- smartwatches,
- small screens,
- wearable interaction,
- hardware controls,
- limited resources,
- Zepp OS API differences,
- system applications,
- third-party applications.

The architecture must be extensible.

Do not hard-code assumptions that will become invalid on future Zepp OS versions.

---

# REQUIRED WORKFLOW

Follow this order:

### Phase 1 — Understand

Read all `.md` and relevant `.js` files.

### Phase 2 — Audit

Create an internal map of:

- current architecture,
- existing features,
- broken features,
- missing features,
- API dependencies,
- OS-version dependencies,
- device dependencies.

### Phase 3 — Compatibility Layer

Design/fix the Zepp OS capability and version abstraction layer.

### Phase 4 — Core Accessibility

Fix:

- accessibility focus,
- navigation,
- gestures,
- speech,
- TTS,
- screen reading,
- system integration.

### Phase 5 — Input

Fix:

- virtual keyboard,
- braille input,
- text fields,
- password handling,
- typing feedback.

### Phase 6 — System Integration

Fix:

- notifications,
- messages,
- calls,
- unlocking,
- system UI,
- accessibility settings,
- third-party applications.

### Phase 7 — Advanced Features

Implement:

- tutorials,
- practice mode,
- screen search,
- configurable cursor,
- multilingual TTS,
- speech mode,
- audio ducking,
- health/fitness reading,
- voice commands,
- automatic updates,
- developer/experimental features.

### Phase 8 — Testing

Test all supported compatibility paths and graceful fallbacks.

### Phase 9 — Documentation

Update `features.md` and other relevant documentation.

---

# IMPORTANT IMPLEMENTATION RULES

- Do not rewrite the entire project unnecessarily.
- Reuse existing working architecture where possible.
- Do not create duplicated implementations for every Zepp OS version.
- Prefer abstraction layers and capability detection.
- Do not assume an API exists just because it exists on a newer Zepp OS version.
- Do not crash when an API is unavailable.
- Do not claim unsupported features are working.
- Do not silently disable functionality without explaining why.
- Experimental functionality belongs in Developer Settings.
- Preserve user settings during upgrades.
- Avoid hardcoded device assumptions.
- Avoid unnecessary performance overhead.
- Keep modules synchronized.
- Keep global and local accessibility states separate.
- Make UI and interaction changes take effect immediately.
- Treat accessibility as a system-wide concern.
- Prioritize reliability over the number of features.
- If Zepp OS itself imposes a limitation, document it instead of attempting an unsafe workaround.
- When a feature is impossible on the current OS/device, expose a clear `Unavailable` state.
- Make the implementation future-proof for newer Zepp OS versions.

Finally, after completing the audit and implementation, verify that `features.md` accurately reflects the **real state of the code**, not merely the intended design.

---

# IMPLEMENTATION STATUS (verified against the code)

This section records the **real state of the code**, as required by item 55. The text above is the original
specification and is unchanged.

**How to read the states** (the same five states the app shows on its _Device Support_ page, item 47):
`Supported` · `Supported with limitations` · `Experimental` · `Unavailable on this OS` · `Unavailable on this watch`.

**What "verified" means here.** Everything below was checked by reading the code, loading every module against the
official `@zos/*` type list, unit tests for the logic that can run in Node (speech pipeline, voice grammar, offline
voice, navigation, feature states, screen search), and bundling every entry the way Zeus does (one output file per
entry). **Nothing has been verified on a physical watch or by using the simulator's screen.** Items marked
_not verifiable here_ need a real device.

## Part 1 — Features

| #   | Feature                            | State                      | Notes                                                                                                                                                                                                                                                                                                                        |
| --- | ---------------------------------- | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Cross-version compatibility        | Supported                  | One code base. Capability layer: `lib/utils/apiCapability.js` (API level), `lib/equipment/mediaSupport.js` (audio, loaded with a guarded dynamic import because `@zos/media` starts at API level 3.0), `lib/utils/featureSupport.js` (states). Developer option _Simulate older Zepp OS_ lowers the level to test fallbacks. |
| 2   | Developer / experimental features  | Supported                  | Developer Settings has an _Experimental / Unsupported by current Zepp OS_ section. Settings that currently do nothing are labelled "(experimental, not active yet)" instead of looking functional.                                                                                                                           |
| 3   | Navigation model                   | Supported                  | Element navigation with character/word/sentence/line/heading/link/screen modes.                                                                                                                                                                                                                                              |
| 4   | Cursor / focus indicator           | Supported                  | Border, highlight or hidden; colour configurable.                                                                                                                                                                                                                                                                            |
| 5   | Screen regions                     | Supported                  | Status bar / main content / navigation area, announced when focus crosses regions (setting _Announce screen regions_). ZSR's own screens only.                                                                                                                                                                               |
| 6   | Gesture configuration              | Supported                  | Every gesture is remappable; vertical/horizontal swipes can be inverted. Multi-finger entries are inert (see 7).                                                                                                                                                                                                             |
| 7   | Two-finger scrolling               | Unavailable on this watch  | Zepp OS touch events report one pointer, so multi-finger gestures cannot be detected.                                                                                                                                                                                                                                        |
| 8   | Wake / time announcement           | Supported with limitations | Uses the screen sensor's change event; works while ZSR is running.                                                                                                                                                                                                                                                           |
| 9   | Content reading                    | Supported                  | Label → text → role/type → fallback description, for ZSR's own screens.                                                                                                                                                                                                                                                      |
| 10  | List position                      | Supported                  | "Item N of M" for lists (fixed: list rows now carry their index and total).                                                                                                                                                                                                                                                  |
| 11  | Text input / passwords             | Supported with limitations | Password reading setting works (`readPasswords`); ZSR can only describe fields on its own screens.                                                                                                                                                                                                                           |
| 12  | Virtual keyboard                   | Experimental               | Not verifiable here.                                                                                                                                                                                                                                                                                                         |
| 13  | Braille keyboard                   | Experimental               | Needs several simultaneous fingers (see 7).                                                                                                                                                                                                                                                                                  |
| 14  | Continuous reading                 | Supported                  | Read-all plus pause/resume (gesture action or shortcut).                                                                                                                                                                                                                                                                     |
| 15  | Speech mode                        | Supported                  | Speech on/off, now persisted across restarts.                                                                                                                                                                                                                                                                                |
| 16  | Speech ducking                     | Unavailable on this OS     | Zepp OS has no audio-focus API. The previous code only lowered ZSR's own player; it is now a documented no-op.                                                                                                                                                                                                               |
| 17  | Separate ZSR volume                | Supported with limitations | Sets the ZSR player volume; Zepp OS may share it with the system volume.                                                                                                                                                                                                                                                     |
| 18  | TTS configuration                  | Supported                  | eSpeak NG is the default engine; the native-TTS slot is kept for future Zepp OS versions.                                                                                                                                                                                                                                    |
| 19  | Multilingual content               | Supported                  | Vietnamese and Chinese text is detected and spoken with the matching voice.                                                                                                                                                                                                                                                  |
| 20  | Punctuation and symbols            | Supported                  | Four levels (all / most / some / none). Default changed to "some" so ordinary sentences are readable.                                                                                                                                                                                                                        |
| 21  | Capital letters                    | Supported                  | Configurable capital-letter announcement.                                                                                                                                                                                                                                                                                    |
| 22  | Progress announcements             | Supported                  | Progress-bar feedback modes.                                                                                                                                                                                                                                                                                                 |
| 23  | Notifications and messages         | Unavailable on this OS     | No public API to receive phone notifications. The receive path (`call` and `request` events) works for data sent by a companion.                                                                                                                                                                                             |
| 24  | Incoming calls                     | Unavailable on this OS     | Same limit as 23.                                                                                                                                                                                                                                                                                                            |
| 25  | Health and fitness                 | Supported                  | Steps, heart rate, calories, distance, sleep, blood oxygen, stress, read on request. Uses only the documented permission codes.                                                                                                                                                                                              |
| 26  | Image and icon descriptions        | Experimental               | Labels/metadata where present. Online description, OCR and CAPTCHA reading need internet and a user-configured provider, and an image must be supplied (no camera or screenshot API).                                                                                                                                        |
| 27  | Font and formatting info           | Supported with limitations | Object details report size and colour; Zepp OS exposes no other formatting.                                                                                                                                                                                                                                                  |
| 28  | System-wide accessibility          | Unavailable on this OS     | Mini Programs are sandboxed and read only their own screens.                                                                                                                                                                                                                                                                 |
| 29  | Accessibility activation           | Supported with limitations | Gesture, double/triple/long Home key, long UP key, and the shortcut card. Listing in the system accessibility settings is not possible (no public API).                                                                                                                                                                      |
| 30  | Accessibility settings description | Unavailable on this OS     | Depends on 29.                                                                                                                                                                                                                                                                                                               |
| 31  | Installation / discoverability     | Supported with limitations | Name in three languages, icons for every target, API level 2.0 minimum. Not verifiable here on newer Zepp OS releases.                                                                                                                                                                                                       |
| 32  | Automatic updates                  | Supported with limitations | Checks for a new version; Zepp OS installs updates only through the Zepp app.                                                                                                                                                                                                                                                |
| 33  | Tutorials and gesture practice     | Supported                  | User guide plus Gesture Practice Mode.                                                                                                                                                                                                                                                                                       |
| 34  | Screen search                      | Supported with limitations | Voice command ("find …"); typing a query is not possible without a keyboard.                                                                                                                                                                                                                                                 |
| 35  | Reading granularity                | Supported                  | See 3.                                                                                                                                                                                                                                                                                                                       |
| 36  | Visual indicator                   | Supported                  | Small configurable dot while ZSR is active (setting _Active Indicator_).                                                                                                                                                                                                                                                     |
| 37  | User personalization               | Supported                  | Phone settings; saved settings are preserved across updates (new keys get defaults).                                                                                                                                                                                                                                         |
| 38  | Device-specific features           | Supported with limitations | API level, audio and recording support, screen size and button count are detected; no per-model hard-coding.                                                                                                                                                                                                                 |
| 39  | Feedback to developers             | Supported                  | Contact page includes _Read diagnostics_ (ZSR version, API level, device, feature states; no personal data).                                                                                                                                                                                                                 |

## Part 2 — Reliability

| #   | Item                          | State                      | Notes                                                                                                                                                    |
| --- | ----------------------------- | -------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 40  | Full code audit               | Done                       | Import names checked against the official type list; option/property names checked; every settings key checked for a consumer.                           |
| 41  | Existing feature verification | Done                       | See the tables above. 28 settings had no code behind them and are labelled.                                                                              |
| 42  | Immediate UI response         | Done                       | Touch sound and haptic now fire before speech instead of after it.                                                                                       |
| 43  | Module synchronization        | Done                       | Core objects (reader, navigation, touch layer, gestures, shortcuts) are shared singletons reused by every page bundle; pages no longer overwrite them.   |
| 44  | Local vs global               | Done                       | Region and list position are per page; speech mode, gestures, cursor and TTS are global.                                                                 |
| 45  | API compatibility             | Done                       | `@zos/media` is never imported statically; feature probes guard optional APIs.                                                                           |
| 46  | Newer Zepp OS compatibility   | Supported with limitations | Install configuration corrected (API levels, names, icons, permissions). Whether a given newer firmware lists or activates ZSR is _not verifiable here_. |
| 47  | Unsupported feature handling  | Done                       | Five-state registry (`lib/utils/featureSupport.js`), shown on the _Device Support_ page.                                                                 |
| 48  | Error handling                | Done                       | Page build, touch layer, speech and optional APIs are wrapped; speech failure falls back to haptics with a distinct warning.                             |
| 49  | Performance                   | Done                       | No polling added; page bundles are about 15–25 KB each; the offline voice downloads in the background.                                                   |
| 50  | Speech queue                  | Done                       | Duplicate announcements collapse, priority interrupts, and speech is cancelled when a new page opens.                                                    |
| 51  | Accessibility focus           | Supported                  | Focus resets to the first element on a new page; elements are re-registered on rebuild.                                                                  |
| 52  | Gesture conflicts             | Done                       | System swipes are consumed only while ZSR is active, and the same swipe is never handled twice.                                                          |
| 53  | Unlocking                     | Unavailable on this OS     | No API to read or operate the lock screen.                                                                                                               |
| 54  | Testing matrix                | Partial                    | Covered by automated checks plus the developer option _Simulate older Zepp OS_. Real devices were not available.                                         |
| 55  | Documentation                 | Done                       | This section.                                                                                                                                            |
| 56  | Final principles              | Followed                   | Unsupported features are reported as unavailable instead of being claimed.                                                                               |

## Permissions

`app.json` declares only codes published in the official typings or documentation: `data:os.device.info`,
`device:os.local_storage` and the seven `data:user.hd.*` health codes. `@zos/media`, `@zos/ble` and the vibrator
document no permission code, and ZSR uses no camera API, so none is declared for them.

## How ZSR is installed and started (what is and is not possible)

Checked against the Zepp OS documentation (module list of the Mini Program API, App Service, API level notes):

- **ZSR is a Mini Program.** It runs while its own app is open (and, from API level 3.0, an optional no-UI App
  Service). The Zepp OS documentation lists the Mini Program API modules (UI, sensor, app, page, router, interaction,
  settings, display, device, user, file system, storage, i18n, utils, BLE) and **none of them registers an app as an
  accessibility service**. The only system-settings extension point found for apps is the custom _keyboard_ (Zepp OS
  4.2+). This has not been confirmed against every Zepp OS release.
- **Reported on a device:** on an Amazfit Bip 6 (Zepp OS 4.2) ZSR does not appear under Settings → Accessibility,
  and was not found in the Zepp App Store. The activation path described in `README.md` ("Install from the App
  Store", "Settings → Accessibility → Zepp OS Screen Reader → On") therefore could not be reproduced. **The
  maintainers need to confirm what that path is meant to be**; until then ZSR is started by opening it from the
  watch's app list or its shortcut card, and the Home/UP key shortcuts work once it is running.
- **Installation today:** by sideloading (Zeus preview QR / developer mode), unless ZSR has been published.
- **Blank screen when opening ZSR (user report):** two defects of the code at that time were found and fixed:
  every spoken/visible string called `gettext`, which does not exist on the device (the API is `getText`), and
  `GrantPermission/message.js` imported `Buffer` from a nonexistent `@zos/buffer` module, which throws when the app
  loads. Both stop the app before anything is drawn. A simulated start (`app.js` → `onCreate` → first page) now
  checks that the first page draws text. _Not verified on a physical watch._
- **If it still fails on a watch, the cause is now visible.** A page that cannot be built draws the error on
  screen (red panel with the failing step, ZSR version, API level, audio support and screen size), and the first
  page shows a one-line build summary at the bottom, so a sighted helper can photograph it for a bug report.
  Module-level code no longer calls platform APIs unguarded (checked with a "hostile platform" test in which every
  `@zos` function throws; the app, `onCreate` and all pages must still load).
- **Shortcut cards:** the app widget now reads the real enabled state (it used a Zepp OS 1.0 storage global that
  does not exist, so it always showed DISABLED), the quick-actions Mute button writes the key the reader actually
  uses, the Settings button opens settings, and both cards are translated (en-US, vi-VN, zh-CN).
