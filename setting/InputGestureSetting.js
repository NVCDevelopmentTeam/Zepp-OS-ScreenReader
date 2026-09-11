import { Section, Row, Text, Select } from '@zeppos/zml'

// These settingsKeys are read directly by lib/interaction/gesture.js on
// init (`gesture_${GESTURE_NAME.toLowerCase()}`) to remap what each
// gesture does - this is fully working end-to-end, not just persisted:
// directional swipes arrive via @zos/interaction's onGesture(), and
// tap/double-tap/long-press/multi-finger gestures arrive via
// lib/components/screenReaderUI.js's own touch handling, both funneled
// into the same handleGesture() dispatcher.
const ACTIONS = [
  { label: 'Next Item', value: 'next' },
  { label: 'Previous Item', value: 'previous' },
  { label: 'Select', value: 'select' },
  { label: 'Read Current Item', value: 'read_current' },
  { label: 'Read Screen', value: 'read_all' },
  { label: 'Read Status Bar', value: 'read_status_bar' },
  { label: 'Open Context Menu', value: 'context_menu' },
  { label: 'Previous Reading Mode', value: 'cycle_mode_prev' },
  { label: 'Next Reading Mode', value: 'cycle_mode_next' },
  { label: 'Scroll Up', value: 'scroll_up' },
  { label: 'Scroll Down', value: 'scroll_down' },
  { label: 'Previous Page', value: 'previous_page' },
  { label: 'Next Page', value: 'next_page' },
  { label: 'Spell Out', value: 'spell_out' },
  { label: 'Toggle Mute', value: 'toggle_mute' },
  { label: 'Toggle Screen Curtain', value: 'toggle_screen_curtain' }
]

export default function renderGestureActions(_props) {
  return [
    Section({ title: 'Gesture Actions - Swipe' }, [
      Row([Text('Swipe Up'), Select({ settingsKey: 'gesture_up', options: ACTIONS })]),
      Row([Text('Swipe Down'), Select({ settingsKey: 'gesture_down', options: ACTIONS })]),
      Row([Text('Swipe Left'), Select({ settingsKey: 'gesture_left', options: ACTIONS })]),
      Row([Text('Swipe Right'), Select({ settingsKey: 'gesture_right', options: ACTIONS })])
    ]),
    Section({ title: 'Gesture Actions - Tap & Hold' }, [
      Row([Text('Single Tap'), Select({ settingsKey: 'gesture_click', options: ACTIONS })]),
      Row([Text('Double Tap'), Select({ settingsKey: 'gesture_double_click', options: ACTIONS })]),
      Row([Text('Long Press'), Select({ settingsKey: 'gesture_long_press', options: ACTIONS })]),
      Row([
        Text('2-Finger Tap'),
        Select({ settingsKey: 'gesture_two_finger_tap', options: ACTIONS })
      ]),
      Row([
        Text('3-Finger Tap'),
        Select({ settingsKey: 'gesture_three_finger_tap', options: ACTIONS })
      ])
    ]),
    Section({ title: 'Gesture Actions - Multi-Finger Swipe' }, [
      Row([
        Text('2-Finger Swipe Up'),
        Select({ settingsKey: 'gesture_two_finger_swipe_up', options: ACTIONS })
      ]),
      Row([
        Text('2-Finger Swipe Down'),
        Select({ settingsKey: 'gesture_two_finger_swipe_down', options: ACTIONS })
      ]),
      Row([
        Text('2-Finger Swipe Left'),
        Select({ settingsKey: 'gesture_two_finger_swipe_left', options: ACTIONS })
      ]),
      Row([
        Text('2-Finger Swipe Right'),
        Select({ settingsKey: 'gesture_two_finger_swipe_right', options: ACTIONS })
      ]),
      Row([
        Text('3-Finger Swipe Up'),
        Select({ settingsKey: 'gesture_three_finger_swipe_up', options: ACTIONS })
      ]),
      Row([
        Text('3-Finger Swipe Down'),
        Select({ settingsKey: 'gesture_three_finger_swipe_down', options: ACTIONS })
      ]),
      Row([
        Text('3-Finger Swipe Left'),
        Select({ settingsKey: 'gesture_three_finger_swipe_left', options: ACTIONS })
      ]),
      Row([
        Text('3-Finger Swipe Right'),
        Select({ settingsKey: 'gesture_three_finger_swipe_right', options: ACTIONS })
      ])
    ])
  ]
}
