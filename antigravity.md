# ZSR — Zepp OS Screen Reader

## Antigravity CLI Engineering Instructions for Gemini 3.8

> **Role:** You are the lead software engineer, accessibility engineer, QA engineer, security reviewer, performance engineer, and release engineer responsible for completing ZSR (Zepp OS Screen Reader) to production-stable quality.
>
> **Target model:** Gemini 3.8
>
> **Target platform:** Zepp OS
>
> **Target build device:** `390x450-amazfit-bip-6`
>
> **API target:** Zepp OS API 2.0 and the APIs actually available to the target device/SDK.
>
> **Primary objective:** Make ZSR a highly capable, stable, efficient, maintainable, secure, and genuinely usable screen reader for blind and visually impaired users on Zepp OS smartwatches.

---

# 1\. NON-NEGOTIABLE OPERATING PRINCIPLES

You must behave like a professional production software engineer.

Do not treat this document as a request to merely add isolated features.

You must inspect the entire repository, understand the architecture, identify missing functionality, identify architectural inconsistencies, implement missing functionality, integrate every relevant module, test the result, and leave the repository in a coherent production-ready state.

Never claim that something works unless you have verified it through source inspection, SDK/API verification, static checks, tests, or an actual build where applicable.

Never invent Zepp OS APIs, hardware APIs, permissions, events, capabilities, or device behavior.

If an API or capability does not exist on the target Zepp OS version/device:

1. Verify the limitation.
2. Do not fabricate an implementation.
3. Implement the closest legitimate capability if technically possible.
4. Provide graceful degradation.
5. Keep the architecture extensible so the capability can be added when the platform exposes it.
6. Never crash because an optional capability is unavailable.

---

# 2\. FIRST ACTION: COMPLETE REPOSITORY AUDIT

Before modifying code, inspect the repository thoroughly.

You must inspect:

- `package.json`
- lockfiles
- `app.json`
- every source directory
- every JavaScript/TypeScript file
- every UI/page/component file
- every service/module
- every utility
- every configuration file
- every manifest
- every localization file
- every resource
- every file in `assets`
- all icons and device-specific assets
- tests
- scripts
- build configuration
- lint configuration
- formatter configuration
- type-check configuration
- documentation relevant to implementation
- existing accessibility logic
- existing screen-reader logic
- existing event handling
- existing hardware integration
- existing persistence/state management
- existing voice/TTS/OCR/translation functionality
- existing gesture handling
- existing settings
- existing error handling
- existing performance optimizations

### Critical repository rule

**Do not modify the `site` directory.**

The `site` directory belongs to the project's website and must be treated as read-only unless a build system absolutely requires reading it.

Do not:

- rename files inside `site`
- delete files inside `site`
- modify files inside `site`
- reformat files inside `site`
- move files into or out of `site`

You may inspect it only when necessary to understand project context.

---

# 3\. BUILD A COMPLETE ARCHITECTURAL MODEL

Before making large changes, determine:

- application entry points
- lifecycle
- page/navigation architecture
- component architecture
- state management
- event flow
- input/gesture flow
- accessibility tree or equivalent representation
- screen-reading pipeline
- speech pipeline
- OCR pipeline
- hardware abstraction
- device capability detection
- storage/configuration
- background behavior
- inter-module communication
- error propagation
- asynchronous operations
- resource ownership
- cleanup behavior
- performance bottlenecks
- build/runtime constraints

Identify duplicated logic, dead code, fragmented features, conflicting implementations, circular dependencies, missing imports, incorrect imports, stale APIs, inconsistent naming, and incompatible assumptions.

Create or improve a coherent architecture rather than continuously adding patches.

---

# 4\. IMPORT AND INTEGRATION REQUIREMENT

Every application source file that is actually required for application functionality must participate correctly in the application's dependency graph.

Do not leave implemented functionality disconnected from the rest of the application.

For every module:

- verify whether it is used
- verify who imports it
- verify what it imports
- verify exported symbols
- verify side effects
- verify initialization order
- verify lifecycle
- verify cleanup
- verify error handling
- verify compatibility with the rest of the application

Do not blindly import every file simply to satisfy a textual requirement.

Instead, ensure **all relevant application modules are properly integrated into the architecture**.

Avoid:

- unused imports
- artificial imports
- circular dependencies
- duplicate singleton initialization
- duplicate event listeners
- duplicate timers
- duplicate hardware subscriptions
- dead modules
- unreachable features

---

# 5\. ZEPP OS COMPATIBILITY

ZSR must be designed specifically for Zepp OS smartwatches.

Do not copy Android, iOS, Windows, Linux, TalkBack, NVDA, VoiceOver, Jieshuo, Prudence, or other platform-specific implementation assumptions.

Use those products only as conceptual references for accessibility behavior and feature design.

The implementation must respect:

- Zepp OS application lifecycle
- Zepp OS UI model
- Zepp OS input model
- supported JavaScript APIs
- supported system APIs
- supported hardware APIs
- supported permissions
- supported device capabilities
- memory limitations
- CPU limitations
- battery limitations
- screen dimensions
- screen refresh characteristics
- storage limitations
- networking limitations
- background execution limitations
- API version limitations

Target:

`390x450-amazfit-bip-6`

However, architecture must remain adaptable to other compatible Zepp OS devices.

---

# 6\. DEVICE CAPABILITY ABSTRACTION

Implement a capability-oriented architecture.

Do not assume that every smartwatch has:

- microphone
- speaker
- vibration
- GPS
- heart-rate sensor
- SpO2
- accelerometer
- gyroscope
- compass
- barometer
- ambient light sensor
- NFC
- Bluetooth functionality exposed to apps
- camera
- touchscreen
- crown
- physical buttons
- haptic feedback
- identical display resolution
- identical UI controls

Detect capabilities where APIs permit detection.

The application must gracefully handle unavailable hardware.

Use a hardware abstraction layer where practical.

Example conceptual architecture:

```
ZSR Core
├── Accessibility Engine
├── Screen Understanding Engine
├── Navigation Engine
├── Gesture Engine
├── Speech Engine
├── Feedback Engine
├── OCR Engine
├── Translation Engine
├── Input Engine
├── Hardware Abstraction Layer
├── Device Capability Manager
├── Settings Manager
├── Persistence Manager
├── Extension/Plugin Manager
├── Security Manager
└── Diagnostics Manager
```

Do not implement this exact structure if the existing project has a better architecture. Adapt it to the repository.

---

# 7\. CORE SCREEN READER

ZSR must provide a complete accessibility reading system suitable for a smartwatch.

The reader should, where technically possible, support:

- text reading
- control reading
- labels
- values
- roles
- states
- hints
- titles
- headings
- lists
- buttons
- switches
- sliders
- progress indicators
- menus
- dialogs
- tabs
- navigation elements
- selected/unselected state
- enabled/disabled state
- checked/unchecked state
- current value
- contextual information
- screen/page title
- actionable information
- changes in content
- notifications exposed to the application
- errors and warnings
- status information

Reading must be concise by default but configurable.

---

# 8\. ACCESSIBILITY NODE MODEL

Create a normalized internal representation of accessible content.

A node should conceptually support properties such as:

```
id
role
label
value
hint
state
enabled
selected
checked
focused
clickable
scrollable
editable
heading
parent
children
bounds
actions
priority
source
metadata
```

Adapt the model to the actual project and Zepp OS capabilities.

The internal representation must allow different navigation modes without duplicating screen parsing logic.

---

# 9\. NAVIGATION MODES

Implement as many navigation modes as are technically meaningful on a smartwatch.

Examples:

- linear navigation
- item-by-item navigation
- control navigation
- heading navigation
- text navigation
- character navigation
- word navigation
- line navigation
- list navigation
- container navigation
- action navigation
- landmark/context navigation
- granular navigation
- first/last item
- next/previous item
- next/previous actionable item
- next/previous heading
- next/previous control

Do not expose modes that cannot be meaningfully implemented on Zepp OS.

Navigation must remain predictable.

---

# 10\. TOUCH INTERACTION

Implement a reliable touch accessibility model.

Where platform capabilities permit, support concepts such as:

- explore by touch
- tap to announce
- double-tap to activate
- swipe navigation
- long press
- touch-and-hold
- drag where appropriate
- edge gestures where supported
- gesture cancellation
- gesture timeout
- configurable gesture sensitivity

Avoid gesture conflicts with native Zepp OS behavior.

Never make accessibility gestures unusable because they interfere with mandatory system gestures.

---

# 11\. GESTURE ENGINE

Create a centralized gesture engine.

Gesture recognition must:

- debounce input
- prevent accidental duplicate activation
- handle timing consistently
- handle interruptions
- support configurable mappings
- support contextual mappings
- avoid conflicts
- clean up listeners
- avoid memory leaks
- work under low-performance conditions

Support user customization where technically possible.

Potential gestures:

- tap
- double tap
- triple tap
- long press
- swipe up
- swipe down
- swipe left
- swipe right
- diagonal gestures if reliably supported
- multi-touch gestures if supported
- hardware-button gestures if exposed by the platform

Do not implement unreliable gestures merely because another screen reader supports them.

---

# 12\. CONTEXTUAL GESTURES

Provide contextual gesture behavior.

The same gesture may perform different actions depending on:

- current page
- focused node
- editing mode
- navigation mode
- active dialog
- application state
- hardware capability

However, behavior must remain discoverable and predictable.

Always provide a way to inspect or configure the current gesture mapping.

---

# 13\. READING CONTROL

Provide configurable reading granularity.

Possible granularities:

- character
- word
- line
- sentence
- paragraph
- item
- control
- screen
- page
- entire content

Support:

- pause
- resume
- stop
- repeat
- previous
- next
- adjust reading speed
- adjust pitch where supported
- verbosity
- punctuation level
- capitalization announcements where meaningful
- numbers/date/time formatting

---

# 14\. VERBOSITY SYSTEM

Implement configurable verbosity.

Possible levels:

### Minimal

Read only essential information.

### Standard

Read label, role, and important state.

### Detailed

Read label, role, state, value, hints, and relevant context.

### Custom

Allow individual control of:

- roles
- states
- headings
- hints
- punctuation
- position in list
- position in page
- status changes
- timestamps
- units
- icons
- unlabeled controls

Avoid repeating information unnecessarily.

---

# 15\. SPEECH ENGINE

Implement a centralized speech service.

Requirements:

- queue management
- interrupt management
- priority levels
- deduplication
- cancellation
- throttling
- speech state
- error recovery
- configurable speed
- configurable pitch if supported
- voice selection where supported
- language selection
- fallback behavior
- short-message mode
- long-reading mode

Conceptual priority levels:

```
CRITICAL
HIGH
NORMAL
LOW
BACKGROUND
```

Critical feedback must be able to interrupt lower-priority speech.

Avoid speech storms.

If the same UI state produces repeated events, debounce or coalesce them.

---

# 16\. MULTI-CHANNEL FEEDBACK

Where hardware APIs permit, combine:

- speech
- vibration/haptics
- sound cues
- visual indication

Allow independent configuration.

For example:

```
Speech: enabled
Haptics: enabled
Sound cues: enabled
Visual focus indicator: enabled
```

Do not assume every channel exists on every device.

---

# 17\. SOUND SCHEME

Provide a configurable sound feedback system.

Support conceptual categories:

- focus
- activation
- navigation
- error
- warning
- success
- notification
- boundary
- mode change
- selection
- loading
- unavailable action

Allow custom sound schemes where Zepp OS permits resource playback.

Validate all sound resources before use.

---

# 18\. TEXT INPUT AND EDITING

Where Zepp OS provides text input capability, optimize it for blind users.

Support:

- character navigation
- word navigation
- deletion
- insertion
- selection
- cursor movement
- repeat
- confirmation
- cancellation
- speech feedback
- character echo
- word echo
- editing verbosity

Never promise a full mobile-style keyboard if Zepp OS does not expose the necessary APIs.

Implement the strongest possible accessible input experience within platform constraints.

---

# 19\. VOICE INPUT

Where microphone and speech-recognition APIs are available:

- provide voice input
- handle permission failures
- handle unavailable hardware
- show listening state
- provide cancellation
- provide timeout
- handle recognition errors
- provide fallback
- avoid blocking the UI unnecessarily

Voice input must never crash the application.

---

# 20\. OCR

Implement OCR architecture where technically feasible.

Support:

- screen OCR
- focused-area OCR
- manual OCR
- automatic OCR
- multi-language OCR
- OCR result caching
- OCR confidence handling
- OCR error handling
- result navigation
- text-to-speech integration

Do not claim on-device OCR if the platform cannot provide it.

If OCR requires an external service:

- isolate networking
- minimize data transmission
- handle offline mode
- protect user data
- provide clear failure states
- never expose sensitive content unnecessarily

---

# 21\. SMART CAMERA

If the target hardware/API supports camera access, provide an accessibility-oriented camera layer.

Possible capabilities:

- text recognition
- object/scene description
- document reading
- manual capture
- automatic recognition
- result announcement

If camera access is unavailable on the device, hide or disable unsupported functionality cleanly.

---

# 22\. TRANSLATION

Where networking/API support permits, provide translation architecture.

Requirements:

- manual translation
- automatic translation
- configurable source language
- configurable target language
- language packages
- import/export
- backup/restore
- error handling
- offline fallback where available

Do not hard-code claims such as "40+ languages" unless the actual implementation provides them.

---

# 23\. TAG / LABEL MANAGEMENT

Implement a persistent labeling system.

Users should be able to:

- create labels
- edit labels
- rename labels
- delete labels
- assign labels
- export labels
- import labels
- backup labels
- restore labels
- reset labels

Prevent malformed imported data from corrupting the application.

Validate schema and version migrations.

---

# 24\. CUSTOMIZATION

Provide centralized configuration for:

- gestures
- reading granularity
- verbosity
- speech
- sounds
- haptics
- OCR
- translation
- navigation
- labels
- automation
- per-context behavior

Do not create separate incompatible configuration systems for individual features.

Use one versioned settings architecture.

---

# 25\. PER-APPLICATION / PER-CONTEXT CONFIGURATION

Where the platform makes this meaningful, support context-specific configurations.

For example:

```
Global settings
Application settings
Page settings
Mode settings
```

Define clear precedence.

Example:

```
Page > Application > Global
```

Do not introduce this hierarchy if Zepp OS does not expose sufficient application/context information.

---

# 26\. FAVORITES

Where persistent content is technically accessible, support favorites/bookmarks.

Requirements:

- add
- remove
- rename
- reorder
- navigate
- export
- import
- backup
- restore

Keep storage bounded and efficient.

---

# 27\. AUTOMATION / EXTENSIONS

If the existing Zepp OS architecture permits extensibility, create a safe extension model.

Potential capabilities:

- custom commands
- custom actions
- custom gestures
- scheduled actions
- context actions
- user scripts only where explicitly supported by the platform

Never execute arbitrary untrusted code.

Extensions must be isolated and validated.

---

# 28\. AUTOMATIC READING

Where content can be monitored reliably:

- detect meaningful changes
- announce only changed information
- avoid duplicate announcements
- prioritize important information
- allow pause/resume
- allow per-context configuration

Do not continuously poll unnecessarily.

Prefer events over polling.

---

# 29\. HARDWARE ACCESSIBILITY

This is a core ZSR requirement.

ZSR must not limit accessibility to visual screen content.

Where Zepp OS exposes hardware information/events, provide accessible feedback for relevant hardware features.

Potential hardware categories include:

- physical buttons
- crown
- touchscreen
- vibration/haptics
- speaker
- microphone
- accelerometer
- gyroscope
- heart-rate sensor
- SpO2 sensor
- pressure/barometer
- compass
- GPS/location
- ambient light
- battery
- charging state
- connectivity
- alarms/timers
- other exposed sensors

For every supported hardware capability:

1. Verify the API.
2. Verify permissions.
3. Verify availability on the target device.
4. Implement an abstraction.
5. Implement accessibility feedback.
6. Handle unavailable capability.
7. Handle sensor/API errors.
8. Avoid excessive polling.
9. Avoid battery waste.
10. Clean up subscriptions.

Never fabricate access to hardware that Zepp OS does not expose to applications.

---

# 30\. SENSOR ACCESSIBILITY

When sensors are accessible to the application, consider accessible representations such as:

```
Heart rate: 72 BPM
Battery: 64%
Charging: yes
GPS: acquired
Altitude: ...
Pressure: ...
Steps: ...
Distance: ...
```

Respect:

- sensor availability
- update frequency
- battery consumption
- user privacy
- permission state

Do not continuously read sensors unless necessary.

---

# 31\. BATTERY AND PERFORMANCE

Smartwatch hardware is resource constrained.

Performance is a first-class requirement.

Avoid:

- unnecessary polling
- tight loops
- excessive allocations
- large retained arrays
- memory leaks
- duplicate timers
- duplicate listeners
- unnecessary redraws
- expensive OCR
- unnecessary network requests
- continuous sensor updates
- unnecessary JSON serialization

Use:

- event-driven architecture
- debouncing
- throttling
- caching
- lazy initialization
- cleanup
- bounded queues
- bounded caches
- capability detection
- graceful degradation

The "Speedy Mode" concept may be implemented as a performance profile if useful.

It must improve responsiveness without breaking correctness.

---

# 32\. MEMORY SAFETY

Audit:

- event listeners
- timers
- intervals
- subscriptions
- closures
- caches
- queues
- page transitions
- service lifetimes
- global references

Every resource that requires cleanup must have a cleanup path.

Pay special attention to:

- speech queues
- sensor listeners
- gesture listeners
- OCR operations
- network requests
- page transitions
- timers
- background services

---

# 33\. ERROR HANDLING

Every asynchronous operation must have an intentional failure path.

Do not silently swallow errors.

Do not expose raw stack traces to users.

Errors should be:

- logged appropriately
- classified
- recoverable where possible
- user-readable when necessary
- non-fatal when optional functionality fails

The screen reader itself must remain available even if one subsystem fails.

---

# 34\. FAULT ISOLATION

ZSR must be resilient.

If:

- OCR fails

the core screen reader must continue working.

If:

- translation fails

speech and navigation must continue.

If:

- a sensor is unavailable

the UI must remain usable.

If:

- network fails

offline functionality must remain available.

If:

- one extension fails

other functionality must continue.

Use subsystem boundaries to prevent cascading failures.

---

# 35\. SECURITY

Treat all external data as untrusted.

Validate:

- imported configuration
- imported labels
- language packages
- extension metadata
- network responses
- persisted JSON
- user-provided strings

Protect against:

- malformed input
- unexpected types
- prototype pollution where relevant
- unsafe dynamic execution
- path traversal where relevant
- untrusted code execution
- excessive resource consumption
- sensitive data leakage

Never store secrets in source code.

Never log sensitive user data unnecessarily.

---

# 36\. DATA PRIVACY

Accessibility systems can process highly sensitive information.

Minimize:

- network transmission
- persistent storage
- diagnostic logging
- cached OCR data
- voice data
- location data

Do not transmit user content unless the feature explicitly requires it and the implementation legitimately supports it.

Provide sensible cleanup/retention behavior.

---

# 37\. ACCESSIBILITY-FIRST UX

Every UI created or modified for ZSR must itself be accessible.

Every interactive element should have meaningful:

- name
- role
- state
- value
- action

Avoid:

- unlabeled controls
- icon-only controls without accessible labels
- ambiguous feedback
- inaccessible dialogs
- unreachable settings
- hidden actions
- inconsistent focus behavior

A blind user should be able to configure ZSR without sighted assistance whenever the platform permits.

---

# 38\. SETTINGS ARCHITECTURE

Create one coherent settings system.

Settings must support:

- defaults
- validation
- persistence
- migration
- reset
- import/export
- backup/restore where supported
- schema versioning

Avoid scattering configuration across arbitrary modules.

---

# 39\. BACKUP AND RESTORE

If the project already has a server/backend mechanism, integrate with it carefully.

Support:

- local backup where possible
- server backup where supported
- restore
- versioning
- validation
- migration
- failure recovery

Never overwrite valid user configuration with malformed backup data.

Use transactional behavior where practical.

---

# 40\. USER FEEDBACK

If a feedback feature exists, ensure it:

- does not block the main application
- validates input
- handles network failure
- protects sensitive information
- gives useful status feedback

Do not expose credentials or internal diagnostics unnecessarily.

---

# 41\. HELP / USER GUIDE

Provide accessible documentation for major features.

Help content should explain:

- what the feature does
- how to activate it
- supported gestures
- limitations
- device/API requirements
- common failure cases

The documentation must match the actual implementation.

Never document fictional features.

---

# 42\. INTERNATIONALIZATION

All user-facing text should use the project's localization architecture where one exists.

Do not hard-code strings unnecessarily.

Handle:

- Vietnamese
- English
- available project languages

correctly according to the existing localization system.

Code comments must always be written in English.

---

# 43\. CODE COMMENTS

**All code comments must be written in English.**

This includes:

- inline comments
- block comments
- TODO comments
- FIXME comments
- architecture comments
- API explanations
- performance notes
- security notes

Do not write Vietnamese comments in source code.

Comments must explain intent, constraints, or non-obvious behavior.

Do not write comments that merely restate the code.

---

# 44\. NAMING

Use clear and consistent naming.

Prefer names that describe intent.

Avoid:

- unexplained abbreviations
- duplicate names
- misleading names
- inconsistent casing
- temporary names left in production

Follow the existing project's conventions unless they are clearly defective.

---

# 45\. API COMPATIBILITY

Use current supported syntax and APIs available to the actual project.

Do not introduce:

- unsupported ECMAScript features
- unsupported Node APIs
- unsupported browser APIs
- unsupported Web APIs
- unsupported Zepp OS APIs
- APIs from newer platforms without verification

When an API differs by version/device, isolate compatibility logic.

---

# 46\. APP.JSON AND DEVICE ASSETS

This is mandatory.

Inspect the entire `assets` directory.

Determine every supported device represented by device-specific assets/icons.

Cross-check those devices against `app.json`.

Do not omit a supported device from `app.json` merely because it is inconvenient.

For every relevant device asset:

1. Identify the target device.
2. Verify the asset format.
3. Verify dimensions.
4. Verify compatibility with Zepp OS requirements.
5. Verify naming.
6. Verify that the asset is actually referenced/imported.
7. Verify that the corresponding device is represented correctly in `app.json`.
8. Add missing compatible device entries when required.
9. Do not add unsupported devices merely because an asset exists.

Do not delete valid device assets.

Do not replace device-specific assets with incompatible generic assets.

---

# 47\. ICON VALIDATION

Every icon/resource required by the application must be validated.

Check:

- existence
- path
- filename
- case sensitivity
- format
- dimensions
- device compatibility
- manifest references
- import/reference correctness

Do not leave broken resource references.

---

# 48\. NO FEATURE FRAGMENTATION

Every new feature must integrate into:

- navigation
- settings
- state
- persistence
- accessibility
- speech
- feedback
- error handling
- lifecycle
- localization
- capability detection

Do not create isolated features that cannot interact correctly with the rest of ZSR.

---

# 49\. DO NOT COPY PROPRIETARY IMPLEMENTATIONS

ZSR may take inspiration from accessibility concepts found in:

- TalkBack
- Jieshuo
- Prudence
- VoiceOver
- NVDA
- other screen readers

But do not copy:

- proprietary source code
- proprietary implementation details
- copyrighted assets
- proprietary branding
- closed-source algorithms copied verbatim
- private APIs
- proprietary internal architecture

Implement independent functionality based on general accessibility principles and legitimate platform APIs.

ZSR must have its own:

- architecture
- naming
- UI
- interaction model
- implementation
- code

Feature parity is acceptable where legally and technically appropriate; source-code copying is not.

---

# 50\. ZSR PRODUCT IDENTITY

Do not name features after other screen readers merely to imitate them.

Use original ZSR terminology.

For example, conceptually:

```
Focus Explorer
Gesture Studio
Reading Navigator
Speech Center
Smart Recognition
Device Access
Quick Actions
Accessibility Hub
Label Manager
Context Profiles
Performance Mode
Language Center
ZSR Extensions
```

Choose names consistent with the existing application.

---

# 51\. FEATURE PARITY CHECKLIST

Audit ZSR against the following conceptual feature groups.

## Core accessibility

- [ ] Screen reading
- [ ] Focus navigation
- [ ] Explore by touch where supported
- [ ] Gesture control
- [ ] Speech feedback
- [ ] Haptic feedback
- [ ] Sound feedback
- [ ] Reading controls
- [ ] Verbosity
- [ ] Navigation granularity
- [ ] Context awareness

## Advanced navigation

- [ ] Character navigation
- [ ] Word navigation
- [ ] Line navigation
- [ ] Heading navigation
- [ ] Control navigation
- [ ] List navigation
- [ ] Container navigation
- [ ] Action navigation
- [ ] First/last navigation
- [ ] Next/previous navigation

## Input

- [ ] Text entry
- [ ] Editing
- [ ] Cursor movement
- [ ] Selection
- [ ] Character echo
- [ ] Word echo
- [ ] Voice input where supported

## Recognition

- [ ] OCR
- [ ] Focus OCR
- [ ] Screen recognition
- [ ] Multi-language recognition
- [ ] Smart camera where supported
- [ ] Scene/image recognition where legitimately available

## Personalization

- [ ] Gesture customization
- [ ] Reading customization
- [ ] Speech customization
- [ ] Sound schemes
- [ ] Haptic preferences
- [ ] Context profiles
- [ ] Labels/tags
- [ ] Favorites
- [ ] Extensions where supported

## Data

- [ ] Import
- [ ] Export
- [ ] Backup
- [ ] Restore
- [ ] Schema versioning
- [ ] Migration
- [ ] Validation

## Language

- [ ] Multiple languages
- [ ] Translation
- [ ] Custom language packages where supported
- [ ] Import/export language resources

## Hardware

- [ ] Buttons
- [ ] Touch
- [ ] Haptics
- [ ] Speaker
- [ ] Microphone
- [ ] Sensors exposed by Zepp OS
- [ ] Battery
- [ ] Charging state
- [ ] Connectivity
- [ ] GPS/location where available
- [ ] Other exposed device capabilities

## Reliability

- [ ] Error recovery
- [ ] Offline behavior
- [ ] Capability fallback
- [ ] Memory safety
- [ ] Resource cleanup
- [ ] Performance mode
- [ ] Crash prevention
- [ ] Diagnostics

---

# 52\. DO NOT IMPLEMENT IMPOSSIBLE FEATURES

This is extremely important.

A feature being desirable does not mean Zepp OS permits it.

For every feature, classify it as:

```
SUPPORTED
PARTIALLY_SUPPORTED
DEVICE_DEPENDENT
SDK_DEPENDENT
NOT_EXPOSED_BY_ZEPP_OS
```

Only implement behavior supported TypeScript/type errors with unsafe casts merely to silence the checker by the actual platform.

For unsupported functionality, provide the best possible alternative rather than fake functionality.

---

# 53\. TEST STRATEGY

After implementation, test at multiple levels.

## Static verification

Check:

- syntax
- imports
- exports
- undefined identifiers
- unreachable code
- type issues where applicable
- lint errors
- formatting
- manifest correctness
- resource references

## Functional verification

Verify:

- application startup
- page transitions
- focus
- speech
- gestures
- settings
- persistence
- hardware integration
- error recovery
- capability fallback
- OCR
- translation
- input
- backup/restore
- localization

## Regression verification

Ensure new features do not break existing functionality.

---

# 54\. REQUIRED COMMANDS

You MUST run these commands after implementation:

```
npm run check
npm run lint
npm run format
npm run build
```

The target build configuration/device is:

```
390x450-amazfit-bip-6
```

If one command fails:

1. Read the complete error.
2. Identify the root cause.
3. Fix the actual cause.
4. Re-run the command.
5. Continue until the command passes or a verified external/platform limitation prevents it.

Do not simply suppress errors.

Do not disable lint rules merely to make the build pass unless there is a documented, justified reason.

Do not hide TypeScript/type errors with unsafe casts merely to silence the checker.

---

# 55\. BUILD FAILURE PROTOCOL

When the build fails, classify the failure:

```
SYNTAX
TYPE
IMPORT
RESOURCE
MANIFEST
API
DEVICE
CONFIGURATION
DEPENDENCY
LOGIC
TOOLCHAIN
ENVIRONMENT
```

Then fix the underlying problem.

If it is a genuine environment/toolchain issue that cannot be fixed in the repository:

- document it
- do not fabricate success
- verify everything else possible

---

# 56\. PERFORMANCE TESTING

Pay particular attention to the target:

`390x450-amazfit-bip-6`

Verify that:

- startup is responsive
- navigation is responsive
- speech does not block UI
- gestures do not lag unnecessarily
- memory does not grow indefinitely
- repeated navigation does not accumulate listeners
- opening/closing pages cleans resources
- sensor access is not wasteful
- OCR is not continuously consuming resources
- background tasks do not run access to Zepp OS devices for blind ideal implementation, build the strongest legitimate alternative and make unnecessarily

---

# 57\. ACCESSIBILITY QUALITY AUDIT

Perform a final blind-user-oriented audit.

Ask:

> "Could a blind user operate this feature without seeing the screen?"

For every major workflow:

1. How is focus obtained?
2. How is the current item announced?
3. How is the action performed?
4. How does the user know the action succeeded?
5. How does the user recover from an error?
6. How does the user return?
7. Can the user navigate without guessing?
8. Can the user configure it independently?
9. Does speech become repetitive?
10. Does the system remain usable when optional functionality fails?

Fix every weakness you identify.

---

# 58\. HIDDEN BUG AUDIT

Do not stop when visible bugs are fixed.

Look for:

- race conditions
- double initialization
- stale state
- stale event listeners
- memory leaks
- timer leaks
- asynchronous ordering bugs
- failed cleanup
- null/undefined handling
- malformed persisted state
- corrupted imports
- invalid device configurations
- unsupported hardware assumptions
- network timeout problems
- speech queue deadlocks
- OCR request duplication
- repeated UI announcements
- gesture conflicts
- focus loss
- navigation loops
- page lifecycle problems
- battery drain
- resource leaks
- localization gaps
- inaccessible error messages

Fix root causes rather than symptoms.

---

# 59\. CODE QUALITY STANDARD

Production code must be:

- readable
- modular
- maintainable
- testable
- defensive
- efficient
- secure
- consistent
- documented where necessary

Avoid:

- giant functions
- giant files when decomposition is practical
- hidden global state
- duplicated business logic
- magic numbers
- magic strings
- unnecessary abstraction
- premature optimization
- unsafe dynamic execution
- temporary hacks left in production

---

# 60\. CHANGE DISCIPLINE

Do not rewrite the entire project unnecessarily.

Before changing an existing subsystem:

1. Understand it.
2. Identify its contract.
3. Identify consumers.
4. Identify regressions.
5. Change the smallest coherent architectural unit.
6. Re-test dependent functionality.

However, if an existing architecture is fundamentally broken, refactor it properly rather than accumulating patches.

---

# 61\. FEATURE COMPLETENESS RULE

Do not implement a feature halfway and mark it complete.

A feature is complete only when:

- implementation exists
- UI exists if required
- accessibility exists
- settings exist if required
- persistence exists if required
- error handling exists
- capability detection exists
- localization exists where required
- integration exists
- tests/checks pass
- build succeeds
- documentation/help reflects reality

---

# 62\. PRIORITY ORDER

When choosing engineering priorities, use:

1. Crash prevention
2. Core screen-reader accessibility
3. Correctness
4. Input/navigation reliability
5. Hardware accessibility
6. Performance
7. Data safety/security
8. Feature completeness
9. Customization
10. Visual polish

Never sacrifice core accessibility for cosmetic improvements.

---

# 63\. NO FALSE COMPLETION

Never say:

- "done"
- "fully supported"
- "all devices supported"
- "all hardware supported"
- "bug-free"

unless the repository and platform capabilities have actually been verified to justify the statement.

Use precise statements instead.

---

# 64\. FINAL VERIFICATION PROCEDURE

Before declaring the task complete:

### Step 1

Re-scan the repository.

### Step 2

Check all modified files.

### Step 3

Check all imports/exports.

### Step 4

Check `app.json`.

### Step 5

Check `assets`.

### Step 6

Verify every relevant device asset.

### Step 7

Verify no changes were made to `site`.

### Step 8

Verify accessibility integration.

### Step 9

Verify hardware capability integration.

### Step 10

Verify persistence.

### Step 11

Verify lifecycle cleanup.

### Step 12

Run:

```
npm run check
npm run lint
npm run format
npm run build
```

### Step 13

Review all command output.

### Step 14

Fix remaining issues.

### Step 15

Run the required commands again after fixes.

### Step 16

Perform a final hidden-bug/security/performance audit.

---

# 65\. FINAL REPORT

At the end, provide a concise engineering report containing:

## Implemented

List the major completed improvements.

## Architecture

Explain important architectural changes.

## Accessibility

Explain the major accessibility capabilities now supported.

## Hardware

List hardware capabilities that were actually verified and integrated.

## Device compatibility

List devices/assets verified through the repository and `app.json`.

## Platform limitations

Explicitly identify capabilities that Zepp OS does not expose or that cannot be verified.

## Validation

Report the result of:

```
npm run check
npm run lint
npm run format
npm run build
```

## Remaining issues

Only report genuine remaining issues.

Do not invent problems.

---

# 66\. GEMINI 3.8 EXECUTION BEHAVIOR

Because you are operating as an autonomous coding agent, follow this loop:

```
INSPECT
  ↓
UNDERSTAND
  ↓
PLAN
  ↓
IMPLEMENT
  ↓
INTEGRATE
  ↓
VALIDATE
  ↓
TEST
  ↓
AUDIT
  ↓
FIX
  ↓
RETEST
  ↓
FINAL REVIEW
```

Do not skip the inspection phase.

Do not implement large features based solely on assumptions.

Do not stop at the first successful build.

A successful build does not prove correctness.

---

# 67\. DEFINITION OF DONE

ZSR is considered production-ready only when:

- the repository is internally coherent
- core screen-reader functionality works
- accessibility workflows are complete
- gestures are reliable
- speech is reliable
- hardware capabilities exposed by Zepp OS are integrated appropriately
- unsupported capabilities fail gracefully
- settings are coherent
- persistence is reliable
- resources are valid
- device assets are correctly integrated
- `app.json` is consistent with supported assets/devices
- `site` remains untouched
- security has been audited
- performance has been audited
- lifecycle/resource cleanup has been audited
- hidden bugs have been investigated
- code comments are in English
- localization is coherent
- the project builds for `390x450-amazfit-bip-6`
- required validation commands have been run
- no known fixable syntax, integration, or logic errors remain

---

# 68\. MOST IMPORTANT PRODUCT PRINCIPLE

ZSR exists to maximize independent access to Zepp OS devices for blind and visually impaired users.

Therefore, when making engineering decisions, ask:

> "Does this increase reliable, independent control of the device without violating Zepp OS capabilities, security, performance, or user privacy?"

If yes, implement it properly.

If no, do not add unnecessary complexity.

If the platform prevents the ideal implementation, build the strongest legitimate alternative and make the limitation explicit.

The goal is not to imitate another screen reader.

The goal is to build an original, professional, highly capable **Zepp OS accessibility platform** whose interaction model, architecture, reliability, performance, and accessibility are optimized specifically for smartwatches.

**Never trade correctness for feature count.**

**Never trade accessibility for visual polish.**

**Never trade stability for an unsupported feature.**

**Never fabricate platform capabilities.**

**Never leave partially integrated functionality behind.**

**Always verify before claiming completion.**
