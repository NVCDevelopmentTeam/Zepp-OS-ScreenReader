import { widget, createWidget, deleteWidget } from '@zos/ui'
import { getDeviceInfo } from '@zos/device'
import { gettext } from '@zos/i18n'
import AccessibilityService from '../core/accessibility.js'
import VisionService from '../core/visionService.js'
import SensorReader from '../extensions/sensorReader.js'
import BrailleKeyboard from './BrailleKeyboard.js'

const { width, height } = getDeviceInfo()

class ContextMenu {
  constructor() {
    /** @type {ZSRWidget | null} */
    this.group = null
    this.visible = false
  }

  getScreenReader() {
    return globalThis.ScreenReaderInstance
  }

  getNavigationManager() {
    return globalThis.NavigationManagerInstance
  }

  getScreenReaderUI() {
    return globalThis.ScreenReaderUIInstance
  }

  async show() {
    if (this.visible) return
    this.visible = true

    this.group = createWidget(widget.GROUP, {
      x: 0,
      y: 0,
      w: width,
      h: height,
      z_index: 999
    })

    // Background
    this.group.createWidget(widget.FILL_RECT, {
      x: 0,
      y: 0,
      w: width,
      h: height,
      color: 0x000000,
      alpha: 200
    })

    const allOptions = [
      {
        key: 'menuShowReadFromTop',
        text: gettext('readFromTop') || 'Read from top',
        action: () => this.readFromTop()
      },
      {
        key: 'menuShowReadFromBottom',
        text: gettext('readFromBottom') || 'Read from bottom',
        action: () => this.readFromBottom()
      },
      {
        key: 'menuShowCycleNavigationMode',
        text: gettext('cycleNavigationMode') || 'Cycle Navigation Mode',
        action: () => this.cycleNavigationMode()
      },
      {
        key: 'menuShowObjectDetails',
        text: gettext('objectDetails') || 'Object Details',
        action: () => this.showObjectDetails()
      },
      {
        key: 'menuShowScreenCurtain',
        text: gettext('screenCurtain') || 'Screen Curtain',
        action: () => this.toggleScreenCurtain()
      },
      {
        key: 'menuShowReadSensors',
        text: gettext('readSensors') || 'Read Sensors',
        action: () => this.readSensors()
      },
      {
        key: 'menuShowReadStatusBar',
        text: gettext('readStatusBar') || 'Read Status Bar',
        action: () => this.readStatusBar()
      },
      {
        key: 'menuShowScreenRecognition',
        text: gettext('screenRecognition') || 'Screen Recognition',
        action: () => this.screenRecognition()
      },
      {
        key: 'menuShowPhotoGuidance',
        text: gettext('photoGuidance') || 'Photo Guidance',
        action: () => this.startPhotoGuidance()
      },
      {
        key: 'menuShowImageDescription',
        text: gettext('imageDescription') || 'Image Description',
        action: () => this.describeCurrentImage()
      },
      {
        key: 'menuShowSpellOut',
        text: gettext('spellOut') || 'Spell Out',
        action: () => this.spellOut()
      },
      {
        key: 'menuShowBrailleKeyboard',
        text: gettext('brailleKeyboard') || 'Braille Keyboard',
        action: () => this.openBrailleKeyboard()
      },
      {
        key: 'menuShowRepeatLast',
        text: gettext('repeatLast') || 'Repeat Last',
        action: () => this.repeatLast()
      },
      {
        key: 'menuShowReadCenter',
        text: gettext('readCenter') || 'Read Center',
        action: () => this.readCenter()
      },
      {
        key: 'menuShowToggleSpeech',
        text: gettext('toggleSpeech') || 'Toggle Speech Feedback',
        action: () => this.toggleSpeech()
      }
    ]

    // "Context Menu" settings (setting/MenuSetting.js): each item's
    // settingsKey hides/shows it, and 'menuOrder' optionally sorts the
    // visible items alphabetically. "Cancel" is appended unconditionally
    // so the menu is always dismissible even if every item is hidden.
    const config = globalThis.ScreenReaderConfig || {}
    let options = allOptions.filter((opt) => config[opt.key] !== false)
    if (config.menuOrder === 'alphabetical') {
      options = [...options].sort((a, b) => a.text.localeCompare(b.text))
    }
    options.push({ key: 'cancel', text: gettext('cancel') || 'Cancel', action: () => this.hide() })

    const itemHeight = 60
    const startY = (height - options.length * itemHeight) / 2

    options.forEach((opt, i) => {
      if (this.group) {
        this.group.createWidget(widget.BUTTON, {
          x: 20,
          y: startY + i * itemHeight,
          w: width - 40,
          h: itemHeight - 10,
          text: opt.text,
          normal_color: 0x333333,
          press_color: 0x555555,
          radius: 10,
          click_func: () => {
            opt.action()
            if (opt.text !== (gettext('cancel') || 'Cancel')) this.hide()
          }
        })
      }
    })

    const ScreenReader = this.getScreenReader()
    if (ScreenReader) {
      ScreenReader.speak(gettext('contextMenuOpened') || 'Context menu opened', {
        priority: 'high'
      })
    }
  }

  async hide() {
    if (!this.visible) return
    deleteWidget(this.group)
    this.group = null
    this.visible = false
    const ScreenReader = this.getScreenReader()
    if (ScreenReader) {
      ScreenReader.speak(gettext('contextMenuClosed') || 'Context menu closed', {
        priority: 'high'
      })
    }
  }

  async readFromTop() {
    const NavigationManager = this.getNavigationManager()
    if (NavigationManager) {
      NavigationManager.currentIndex = -1
      NavigationManager.navigate('next')
    }
  }

  async readFromBottom() {
    const NavigationManager = this.getNavigationManager()
    if (NavigationManager) {
      await NavigationManager.navigateToEdge('last')
    }
  }

  async cycleNavigationMode() {
    const NavigationManager = this.getNavigationManager()
    if (NavigationManager) {
      NavigationManager.cycleMode()
    }
  }

  async toggleScreenCurtain() {
    const ScreenReaderUI = this.getScreenReaderUI()
    const ScreenReader = this.getScreenReader()
    if (ScreenReaderUI && ScreenReader) {
      const root = ScreenReaderUI.getRootGroup()
      const dimmed = VisionService.toggleScreenDimming(root)
      ScreenReader.speak(`Screen curtain ${dimmed ? 'enabled' : 'disabled'}`, { priority: 'high' })
    }
  }

  async readSensors() {
    await SensorReader.readHeartRate()
    await SensorReader.readSpO2()
  }

  async showObjectDetails() {
    const NavigationManager = this.getNavigationManager()
    const ScreenReader = this.getScreenReader()
    if (!NavigationManager || !ScreenReader) return

    if (NavigationManager.currentIndex === -1) {
      await ScreenReader.speak('No element focused', { priority: 'high' })
      return
    }
    const current = NavigationManager.elements[NavigationManager.currentIndex]
    const parts = []
    const typeName = current.type !== undefined ? `Type ${current.type}` : 'Element'
    parts.push(typeName)
    if (current.options.text_size) {
      parts.push(`font size ${current.options.text_size}`)
    }
    if (current.options.text_style) {
      parts.push(`style ${current.options.text_style}`)
    }
    if (current.options.color !== undefined) {
      parts.push(`color hex ${Number(current.options.color).toString(16)}`)
    }
    const bounds = NavigationManager.getAbsoluteBounds(current)
    parts.push(`width ${bounds.w}, height ${bounds.h}`)
    await ScreenReader.speak(parts.join(', '), { priority: 'high' })
  }

  async screenRecognition() {
    await AccessibilityService.performOCR()
  }

  async readStatusBar() {
    await AccessibilityService.readStatusBar()
  }

  async startPhotoGuidance() {
    await AccessibilityService.startCameraGuidance()
  }

  async describeCurrentImage() {
    const NavigationManager = this.getNavigationManager()
    const ScreenReader = this.getScreenReader()
    if (!NavigationManager || !ScreenReader) return

    const current = NavigationManager.elements[NavigationManager.currentIndex]
    if (current && current.type === widget.IMG) {
      const desc = await AccessibilityService.describeImage(current.element, current.options)
      await ScreenReader.speak(desc, { priority: 'high' })
    } else {
      await ScreenReader.speak(gettext('noImageFocused') || 'No image focused', {
        priority: 'high'
      })
    }
  }

  async repeatLast() {
    const ScreenReader = this.getScreenReader()
    if (!ScreenReader) return
    const lastText = ScreenReader.getLastSpoken()
    if (lastText) {
      ScreenReader.speak(lastText, { priority: 'high' })
    } else {
      ScreenReader.speak(gettext('nothingToRepeat') || 'Nothing to repeat', { priority: 'high' })
    }
  }

  async spellOut() {
    const NavigationManager = this.getNavigationManager()
    if (NavigationManager) {
      await NavigationManager.spellOut()
    }
  }

  openBrailleKeyboard() {
    // BrailleKeyboard (lib/components/BrailleKeyboard.js) only tracks the
    // dot pattern/state - it has no show() method because the on-screen
    // dot-input widget itself hasn't been built yet. Calling .show()
    // directly would throw. Until that UI exists, apply the configured
    // input mode (setting/brailleSetting.js's 'brailleInputMode',
    // '6dot'/'8dot') so the plumbing is ready, and tell the user honestly
    // instead of crashing.
    const config = globalThis.ScreenReaderConfig || {}
    const mode = config.brailleInputMode === '8dot' ? '8dot' : '6dot'
    BrailleKeyboard.setMode(mode)

    const ScreenReader = this.getScreenReader()
    if (typeof BrailleKeyboard.show === 'function') {
      BrailleKeyboard.show()
    } else if (ScreenReader) {
      ScreenReader.speak('Braille keyboard input is not yet available on this screen.', {
        priority: 'high'
      })
    }
  }

  async readCenter() {
    const NavigationManager = this.getNavigationManager()
    if (NavigationManager) {
      await NavigationManager.readCenterElement()
    }
  }

  toggleSpeech() {
    const ScreenReader = this.getScreenReader()
    if (ScreenReader) {
      ScreenReader.toggleMute()
    }
  }
}

const instance = new ContextMenu()
globalThis.ContextMenuInstance = instance
export default instance
