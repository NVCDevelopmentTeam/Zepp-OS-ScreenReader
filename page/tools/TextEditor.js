import '../../lib/utils/polyfills.js'
import { widget, prop } from '@zos/ui'
import { back } from '@zos/router'
import { gettext, format } from '../../lib/utils/i18n.js'
import { safeDeviceInfo } from '../../lib/utils/deviceInfo.js'
import { px } from '../../lib/utils/px.js'
import { guard } from '../../lib/utils/safeCall.js'
import { getStored, setStored } from '../../lib/utils/storage.js'
import { loadSettings } from '../../lib/core/config.js'
import { TextEditor, echoFor, nameOfCharacter, MAX_TEXT_LENGTH } from '../../lib/core/textEditor.js'
import BrailleService from '../../lib/core/braille.js'
import VoiceControlService from '../../lib/core/voiceControlService.js'
import { ZSRPage } from '../../lib/core/zsrPage.js'
import { createWidget, createChild } from '../../lib/core/zsrWidgets.js'

const { width } = safeDeviceInfo()

/** The one note kept between visits. */
const NOTE_KEY = 'zsr_note'
const ROW = 80
/** How much of the text is shown on screen; the reader says the rest on request. */
const PREVIEW_CHARS = 120

/** @param {string} text */
function say(text) {
  const reader = globalThis.ScreenReaderInstance
  if (text && reader && typeof reader.speak === 'function') {
    reader.speak(text, { priority: 'high', force: true })
  }
}

/**
 * Text editor with a Braille keyboard: tap dots to switch them on or off, then "Write character".
 * Everything is a button, so ZSR can move through them by swiping like any other page, and each
 * action says what happened. "Done" keeps the text for the next visit, "Cancel" discards changes.
 */
export default ZSRPage({
  onInit() {
    if (!globalThis.ScreenReaderConfig) globalThis.ScreenReaderConfig = loadSettings()
    this.initialText = getStored(NOTE_KEY) || ''
    this.editor = new TextEditor(this.initialText)
    /** @type {Set<number>} the dots that are on */
    this.dots = new Set()
    /** @type {any[]} */
    this.dotButtons = []
    this.selecting = false
    this.preview = null
  },

  /** Show the start of the text on screen (for a helper with sight). */
  refreshPreview() {
    if (!this.preview) return
    const text = this.editor.text
    this.preview.setProperty(
      prop.TEXT,
      text.length > PREVIEW_CHARS ? text.slice(-PREVIEW_CHARS) : text
    )
  },

  /** @param {number} dot */
  toggleDot(dot) {
    const on = !this.dots.has(dot)
    if (on) this.dots.add(dot)
    else this.dots.delete(dot)
    const button = this.dotButtons[dot - 1]
    if (button) button.setProperty(prop.MORE, { normal_color: on ? 0x00aa00 : 0x333333 })
    say(format(on ? gettext('Dot {0} on') : gettext('Dot {0} off'), dot))
  },

  /** Turn the dots that are on into a character and insert it. */
  writeCharacter() {
    const dots = Array.from(this.dots)
    if (dots.length === 0) {
      say(gettext('No dots are on'))
      return
    }
    const character = BrailleService.translateDotsToChar(dots)
    this.dots.clear()
    this.dotButtons.forEach((button) => button.setProperty(prop.MORE, { normal_color: 0x333333 }))
    if (!character) {
      say(gettext('No character for these dots'))
      return
    }
    this.type(character)
  },

  /** @param {string} character */
  type(character) {
    const inserted = this.editor.insert(character)
    if (!inserted) {
      say(gettext('Text is full'))
      return
    }
    this.refreshPreview()
    const config = globalThis.ScreenReaderConfig || {}
    say(echoFor(this.editor, inserted, config.echoBehavior || 'chars'))
  },

  /** Say what is at the cursor after it moved. @param {boolean} moved @param {'left' | 'right'} side */
  announceCursor(moved, side) {
    if (!moved) {
      say(side === 'left' ? gettext('Start of text') : gettext('End of text'))
      return
    }
    const char = this.editor.charAtCursor()
    say(
      this.editor.hasSelection()
        ? format(gettext('Selected: {0}'), this.editor.selectedText())
        : char
          ? nameOfCharacter(char)
          : gettext('End of text')
    )
  },

  readAll() {
    const text = this.editor.text
    say(text ? format(gettext('Text: {0}'), text) : gettext('Empty'))
  },

  build() {
    const root = createWidget(widget.GROUP, { x: 0, y: 0, w: width, h: px(ROW * 20) })
    const self = this
    const buttonWidth = width - px(80)
    let row = 0

    createChild(root, widget.TEXT, {
      x: 0,
      y: px(10),
      w: width,
      h: px(50),
      text: gettext('Text Editor'),
      color: 0xffffff,
      align_h: 2,
      align_v: 2,
      text_size: px(28)
    })
    this.preview = createChild(root, widget.TEXT, {
      x: px(30),
      y: px(60),
      w: width - px(60),
      h: px(120),
      text: this.editor.text,
      color: 0xcccccc,
      text_size: px(22),
      text_style: 1
    })
    row = 2.5

    /**
     * @param {string} label
     * @param {() => void} action
     * @param {number} [color]
     * @param {number} [column] 0 = full width, 1 = left half, 2 = right half
     */
    const button = (label, action, color = 0x333333, column = 0) => {
      const half = (buttonWidth - px(10)) / 2
      return createChild(root, widget.BUTTON, {
        x: px(40) + (column === 2 ? half + px(10) : 0),
        y: px(row * ROW),
        w: column === 0 ? buttonWidth : half,
        h: px(ROW - 10),
        text: label,
        color: 0xffffff,
        normal_color: color,
        press_color: 0x666666,
        radius: px(30),
        click_func: guard(action, 'click_func')
      })
    }

    // Dots 1-2-3 on the left, 4-5-6 on the right, as on a Braille keyboard
    for (let line = 0; line < 3; line++) {
      this.dotButtons[line] = button(
        format(gettext('Dot {0}'), line + 1),
        () => self.toggleDot(line + 1),
        0x333333,
        1
      )
      this.dotButtons[line + 3] = button(
        format(gettext('Dot {0}'), line + 4),
        () => self.toggleDot(line + 4),
        0x333333,
        2
      )
      row++
    }
    // The buttons were created left, right, left, right ...; keep dot order 1..6
    this.dotButtons = [
      this.dotButtons[0],
      this.dotButtons[1],
      this.dotButtons[2],
      this.dotButtons[3],
      this.dotButtons[4],
      this.dotButtons[5]
    ]

    button(gettext('Write character'), () => self.writeCharacter(), 0x00aa55)
    row++
    button(gettext('Space'), () => self.type(' '), 0x333333, 1)
    button(
      gettext('Backspace'),
      () => {
        const removed = self.editor.deleteBackward()
        self.refreshPreview()
        say(
          removed
            ? format(gettext('Deleted {0}'), nameOfCharacter(removed))
            : gettext('Start of text')
        )
      },
      0x884400,
      2
    )
    row++
    button(
      gettext('Cursor left'),
      () => self.announceCursor(self.editor.moveBy(-1, self.selecting), 'left'),
      0x333333,
      1
    )
    button(
      gettext('Cursor right'),
      () => self.announceCursor(self.editor.moveBy(1, self.selecting), 'right'),
      0x333333,
      2
    )
    row++
    button(
      gettext('Previous word'),
      () => self.announceCursor(self.editor.moveWord(-1, self.selecting), 'left'),
      0x333333,
      1
    )
    button(
      gettext('Next word'),
      () => self.announceCursor(self.editor.moveWord(1, self.selecting), 'right'),
      0x333333,
      2
    )
    row++
    button(gettext('Select: on or off'), () => {
      self.selecting = !self.selecting
      if (!self.selecting) self.editor.clearSelection()
      say(self.selecting ? gettext('Selection on') : gettext('Selection off'))
    })
    row++
    button(
      gettext('Select all'),
      () => {
        self.editor.selectAll()
        say(self.editor.text ? gettext('Selected all') : gettext('Empty'))
      },
      0x333333,
      1
    )
    button(gettext('Read text'), () => self.readAll(), 0x333333, 2)
    row++
    button(
      gettext('Copy'),
      () => {
        const copied = self.editor.copy()
        say(copied ? format(gettext('Copied: {0}'), copied) : gettext('Nothing selected'))
      },
      0x333333,
      1
    )
    button(
      gettext('Cut'),
      () => {
        const cut = self.editor.cut()
        self.refreshPreview()
        say(cut ? format(gettext('Cut: {0}'), cut) : gettext('Nothing selected'))
      },
      0x333333,
      2
    )
    row++
    button(
      gettext('Paste'),
      () => {
        const pasted = self.editor.paste()
        self.refreshPreview()
        say(pasted ? format(gettext('Pasted {0}'), pasted) : gettext('Nothing to paste'))
      },
      0x333333,
      1
    )
    button(
      gettext('Undo'),
      () => {
        const undone = self.editor.undo()
        self.refreshPreview()
        say(undone ? gettext('Undone') : gettext('Nothing to undo'))
      },
      0x333333,
      2
    )
    row++
    button(
      gettext('Dictate'),
      async () => {
        const heard = await VoiceControlService.dictate()
        if (!heard) return
        const inserted = self.editor.insert(heard)
        self.refreshPreview()
        say(inserted ? format(gettext('Inserted: {0}'), inserted) : gettext('Text is full'))
      },
      0x225588
    )
    row++
    button(
      gettext('Done'),
      () => {
        setStored(NOTE_KEY, self.editor.text)
        say(format(gettext('Text saved, {0} characters'), self.editor.text.length))
        back()
      },
      0x00aa00,
      1
    )
    button(
      gettext('Cancel'),
      () => {
        say(gettext('Changes discarded'))
        back()
      },
      0xaa0000,
      2
    )

    // keep the limit visible to tests and readers of the code
    this.maxLength = MAX_TEXT_LENGTH
    return root
  }
})
