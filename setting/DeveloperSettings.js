export default function renderDeveloperOptions(props) {
  return [
    Section({ title: 'Developer Options' }, [
      Row([Text('Debug Logging'), Toggle({ settingsKey: 'debugLogging' })]),
      Row([Text('Verbose Speech'), Toggle({ settingsKey: 'verboseSpeech' })]),
      Row([
        // HONESTY NOTE: the Zepp OS API level available to a Mini
        // Program is fixed at build time by `zeus build` (from
        // app.json's apiVersion) - there's no runtime API to
        // retroactively change which @zos/* capabilities are compiled
        // in, so this can't actually do anything real. Kept as a
        // persisted, non-crashing value only.
        Text('API Version Override (not possible at runtime)'),
        Select({
          settingsKey: 'apiVersionOverride',
          options: [
            { label: 'Default', value: 'default' },
            { label: '3.0.0', value: '3.0.0' },
            { label: '2.0.0', value: '2.0.0' }
          ]
        })
      ]),
      Row([
        Button({
          label: 'Export Debug Log',
          onPress: () => {
            props.settingsStorage.setItem('exportLogSignal', Date.now())
          }
        })
      ]),
      Row([
        Button({
          label: 'Reset All Settings',
          onPress: () => {
            props.settingsStorage.setItem('resetSettingsSignal', Date.now())
          }
        })
      ])
    ]),
    // Policy (per project directive): any setting with no confirmed,
    // stable Zepp OS technical solution - a real platform limitation
    // rather than a simple wiring bug - lives here in Developer Options,
    // not in a main user-facing screen where an ordinary user would
    // reasonably expect it to actually do something. Each row states
    // exactly why it doesn't work yet, so a future contributor with a
    // fix (or a newer Zepp OS API) knows precisely what to unblock.
    Section({ title: 'Experimental / Unsupported by current Zepp OS' }, [
      Row([
        Text('Audio Ducking - no audio focus API exists in Zepp OS'),
        Toggle({ settingsKey: 'audioDucking' })
      ]),
      Row([
        Text('Read when screen off - Mini Program lifecycle has no onPause/onResume/screen event'),
        Toggle({ settingsKey: 'readScreenOff' })
      ]),
      Row([
        Text('Audio Routing - no output-device-selection API found'),
        Select({
          settingsKey: 'audioRouting',
          options: [
            { label: 'System Default', value: 'default' },
            { label: 'Bluetooth Only', value: 'bluetooth' }
          ]
        })
      ]),
      Row([
        Text('Document Navigation Mode - document/rich-text reader not yet built'),
        Select({
          settingsKey: 'docNavMode',
          options: [
            { label: 'Standard', value: 'standard' },
            { label: 'Strict', value: 'strict' }
          ]
        })
      ]),
      Row([
        Text('Announce Formatting - document/rich-text reader not yet built'),
        Toggle({ settingsKey: 'announceFormatting' })
      ]),
      Row([
        Text('Browse Mode Behavior - document/rich-text reader not yet built'),
        Select({
          settingsKey: 'browseBehavior',
          options: [
            { label: 'Automatic', value: 'auto' },
            { label: 'Manual', value: 'manual' }
          ]
        })
      ]),
      Row([
        Text('Echo Behavior - on-screen/braille keyboard input pipeline not yet built'),
        Select({
          settingsKey: 'echoBehavior',
          options: [
            { label: 'Characters', value: 'chars' },
            { label: 'Words', value: 'words' },
            { label: 'Both', value: 'both' },
            { label: 'None', value: 'none' }
          ]
        })
      ]),
      Row([
        Text('Autocomplete Suggestions - text-input pipeline not yet built'),
        Toggle({ settingsKey: 'announceAutocomplete' })
      ]),
      Row([
        Text('Selection Changes - text-input pipeline not yet built'),
        Toggle({ settingsKey: 'announceSelection' })
      ])
    ])
  ]
}
