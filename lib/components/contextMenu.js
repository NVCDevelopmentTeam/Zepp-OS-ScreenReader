import { widget, createWidget, deleteWidget } from '@zos/ui'
import { getDeviceInfo } from '@zos/device'
import { gettext } from '@zos/i18n'
import { log } from '@zos/utils'
import AccessibilityService from '../core/accessibility.js'
import VisionService from '../core/visionService.js'
import SensorReader from '../extensions/sensorReader.js'
import BrailleKeyboard from './brailleKeyboard.js'

const { width, height } = getDeviceInfo()

class ContextMenu {
  constructor() {
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

    const options = [
      { text: gettext('readFromTop') || 'Read from top', action: () => this.readFromTop() },
      {
        text: gettext('readFromBottom') || 'Read from bottom',
        action: () => this.readFromBottom()
      },
      {
        text: gettext('cycleNavigationMode') || 'Cycle Navigation Mode',
        action: () => this.cycleNavigationMode()
      },
      {
        text: gettext('objectDetails') || 'Object Details',
        action: () => this.showObjectDetails()
      },
      {
        text: gettext('screenCurtain') || 'Screen Curtain',
        action: () => this.toggleScreenCurtain()
      },
      {
        text: gettext('readSensors') || 'Read Sensors',
        action: () => this.readSensors()
      },
      {
        text: gettext('readStatusBar') || 'Read Status Bar',
        action: () => this.readStatusBar()
      },
      {
        text: gettext('screenRecognition') || 'Screen Recognition',
        action: () => this.screenRecognition()
      },
      {
        text: gettext('photoGuidance') || 'Photo Guidance',
        action: () => this.startPhotoGuidance()
      },
      {
        text: gettext('imageDescription') || 'Image Description',
        action: () => this.describeCurrentImage()
      },
      {
        text: gettext('spellOut') || 'Spell Out',
        action: () => this.spellOut()
      },
      {
        text: gettext('brailleKeyboard') || 'Braille Keyboard',
        action: () => this.openBrailleKeyboard()
      },
      { text: gettext('repeatLast') || 'Repeat Last', action: () => this.repeatLast() },
      { text: gettext('cancel') || 'Cancel', action: () => this.hide() }
    ]

    const itemHeight = 60
    const startY = (height - options.length * itemHeight) / 2

    options.forEach((opt, i) => {
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
    const details = `Type: ${current.type}, Options: ${JSON.stringify(current.options)}`
    log.info('Object details:', details)
    await ScreenReader.speak(`Focused element type is ${current.type}`, { priority: 'high' })
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
    BrailleKeyboard.show()
  }
}

const instance = new ContextMenu()
globalThis.ContextMenuInstance = instance
export default instance
