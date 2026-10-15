import { widget, createWidget, deleteWidget } from '@zos/ui'
import { safeDeviceInfo } from '../utils/deviceInfo.js'
import { gettext, format } from '../utils/i18n.js'
import SpeechMode from '../extensions/SpeechMode.js'
import { toggleTouchExploration } from '../core/TouchExploration.js'
import CameraAssistant from '../extensions/cameraAssistant.js'
import readCaptcha from '../extensions/readCaptcha.js'
import { prepareQrScan } from '../extensions/qrCode.js'
import OCR from '../extensions/OCR.js'
import CustomLabelManager, { elementLabelKey } from '../extensions/customLabelManager.js'
import { toggleGamerMode } from '../extensions/gamerMode.js'
import DisplayController from '../equipment/displayController.js'
import VoiceControlService from '../core/voiceControlService.js'
import AccessibilityService from '../core/accessibility.js'
import SensorReader from '../extensions/sensorReader.js'
import BrailleKeyboard from './BrailleKeyboard.js'
import { guard } from '../utils/safeCall.js'

const { width, height } = safeDeviceInfo()

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

    // @ts-expect-error alpha / z_index are valid widget options that @zeppos/device-types 4.0.0 does not declare
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
      alpha: 200,
      radius: 0,
      angle: 0
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
        key: 'menuShowVoiceCommand',
        text: gettext('voiceCommand'),
        action: () => this.startVoiceCommand()
      },
      {
        key: 'menuShowToggleSpeech',
        text: gettext('toggleSpeech') || 'Toggle Speech Feedback',
        action: () => this.toggleSpeech()
      },
      {
        key: 'menuShowTouchExploration',
        text: gettext('touchExploration') || 'Touch Exploration',
        action: () => toggleTouchExploration(true)
      },
      {
        key: 'menuShowQrScanHelp',
        text: gettext('qrScanHelp') || 'QR Scan Help',
        action: () => this.helpScanQr()
      },
      {
        key: 'menuShowReadImageText',
        text: gettext('readImageText') || 'Read Text in Image',
        action: () => this.readImageText()
      },
      {
        key: 'menuShowSceneDescription',
        text: gettext('sceneDescription') || 'Scene Description',
        action: () => this.describeScene()
      },
      {
        key: 'menuShowReadCaptcha',
        text: gettext('readCaptcha') || 'Read CAPTCHA',
        action: () => this.readCaptchaAloud()
      },
      {
        key: 'menuShowCustomLabel',
        text: gettext('customLabel') || 'Custom Label',
        action: () => this.editCustomLabel()
      },
      {
        key: 'menuShowGamerMode',
        text: gettext('gamerMode') || 'Gamer Mode',
        action: () => this.toggleGamerMode()
      },
      {
        key: 'menuShowBrightness',
        text: gettext('brightness') || 'Brightness',
        action: () => this.cycleBrightness()
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
          click_func: guard(() => {
            opt.action()
            if (opt.text !== (gettext('cancel') || 'Cancel')) this.hide()
          }, 'click_func')
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
      const on = ScreenReaderUI.toggleCurtain()
      ScreenReader.speak(
        on ? gettext('Screen curtain enabled') : gettext('Screen curtain disabled'),
        {
          priority: 'high'
        }
      )
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
      await ScreenReader.speak(gettext('No element focused'), { priority: 'high' })
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

  /** Listen for a spoken command (needs the phone, internet and an online speech service). */
  async startVoiceCommand() {
    await VoiceControlService.startListening()
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
      ScreenReader.speak(gettext('Braille keyboard input is not yet available on this screen.'), {
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
    SpeechMode.toggle()
  }

  /** Make a QR code on the watch easy to scan with the phone, and say how. */
  async helpScanQr() {
    const ScreenReader = this.getScreenReader()
    if (!ScreenReader) return
    await ScreenReader.speak(prepareQrScan(), { priority: 'high' })
  }

  /** Read the text in the picture that is focused (online recognition through the phone). */
  async readImageText() {
    const ScreenReader = this.getScreenReader()
    const NavigationManager = this.getNavigationManager()
    if (!ScreenReader || !NavigationManager) return
    const current = NavigationManager.elements[NavigationManager.currentIndex]
    const src = current && current.options && current.options.src
    if (!src) {
      await ScreenReader.speak(gettext('The focused element is not a picture'), {
        priority: 'high'
      })
      return
    }
    await ScreenReader.speak(gettext('Reading the text in the picture...'), { priority: 'high' })
    const result = await new OCR().readImageText(src)
    await ScreenReader.speak(
      result.ok && result.text
        ? result.text
        : result.ok
          ? gettext('No text was found in the picture')
          : gettext('The text in this picture could not be read'),
      { priority: 'high' }
    )
  }

  /** Photograph the surroundings with the phone and speak what is in the picture. */
  async describeScene() {
    const ScreenReader = this.getScreenReader()
    if (!ScreenReader) return
    await new CameraAssistant(ScreenReader).captureAndDescribe()
  }

  /** @returns {string} spoken name of the focused element, or '' when nothing is focused */
  focusedElementText() {
    const NavigationManager = this.getNavigationManager()
    const current = NavigationManager && NavigationManager.elements[NavigationManager.currentIndex]
    if (!current) return ''
    return NavigationManager.getElementText(current.element, current.type, current.options)
  }

  /** Read the focused text one character at a time ("Capital A, Number 7"). */
  async readCaptchaAloud() {
    const ScreenReader = this.getScreenReader()
    if (!ScreenReader) return
    const text = this.focusedElementText()
    if (!text) {
      await ScreenReader.speak(gettext('No readable text to read as a CAPTCHA'), {
        priority: 'high'
      })
      return
    }
    const result = readCaptcha(text)
    await ScreenReader.speak('text' in result ? result.text : result.error, { priority: 'high' })
  }

  /**
   * Give the focused element a name of the user's choice (dictated by voice), or remove the
   * name given earlier. The label is spoken from then on, in every app.
   */
  async editCustomLabel() {
    const ScreenReader = this.getScreenReader()
    const NavigationManager = this.getNavigationManager()
    if (!ScreenReader || !NavigationManager) return
    const current = NavigationManager.elements[NavigationManager.currentIndex]
    if (!current) {
      await ScreenReader.speak(gettext('No element is focused'), { priority: 'high' })
      return
    }
    const key = elementLabelKey(current.type, current.options)
    if (CustomLabelManager.hasLabel(key)) {
      CustomLabelManager.removeLabel(key)
      await ScreenReader.speak(gettext('Custom label removed'), { priority: 'high' })
      return
    }
    const label = await VoiceControlService.dictate()
    if (!label) return
    try {
      CustomLabelManager.addLabel(key, label.trim())
      await ScreenReader.speak(format(gettext('Custom label saved: {0}'), label.trim()), {
        priority: 'high'
      })
    } catch (_e) {
      await ScreenReader.speak(gettext('The label could not be saved'), { priority: 'high' })
    }
  }

  /** Speech off and vibration only, until switched off again or ZSR restarts. */
  async toggleGamerMode() {
    const ScreenReader = this.getScreenReader()
    if (!ScreenReader) return
    const on = toggleGamerMode()
    // Said with force: this is the one message that must be heard as the mode switches.
    await ScreenReader.speak(
      on
        ? gettext('Gamer mode on. Speech is off; ZSR answers with vibration.')
        : gettext('Gamer mode off'),
      { priority: 'high', force: true }
    )
  }

  /** Step the screen brightness through low, medium, high and full. */
  async cycleBrightness() {
    const ScreenReader = this.getScreenReader()
    if (!ScreenReader) return
    const steps = [20, 50, 80, 100]
    const next = steps.find((level) => level > DisplayController.brightness) || steps[0]
    const changed = DisplayController.setBrightness(next)
    await ScreenReader.speak(
      changed
        ? format(gettext('Brightness {0} percent'), next)
        : gettext('Brightness cannot be changed'),
      { priority: 'high' }
    )
  }
}

// Shared across separately bundled pages: reuse the instance that already exists.
const instance = globalThis.ContextMenuInstance || new ContextMenu()
globalThis.ContextMenuInstance = instance
export default instance
