/**
 * Text editing for ZSR: a text buffer with a cursor and a selection, and what to say about it.
 *
 * Zepp OS has no system text field that a screen reader can drive, so ZSR provides its own
 * editor (page/tools/TextEditor.js). The editor is a plain model with no screen or speech in it:
 *   insert, delete, move by character / word / edge, select, copy, cut, paste, undo.
 * `echoFor` says what is spoken after typing, following the setting `echoBehavior`:
 *   'chars' the typed character, 'words' the word that was just finished, 'both', or 'none'.
 */
import { gettext } from '../utils/i18n.js'

/** The watch has little memory and a long text is tedious to edit by ear. */
export const MAX_TEXT_LENGTH = 2000
const MAX_UNDO_STEPS = 50

/** Shared by all editors: what was last copied or cut. */
let clipboard = ''

/**
 * Characters that end a word. Written out (not a Unicode property escape) so that it runs on an
 * ES6 engine; letters of every language, digits, the apostrophe and the underscore belong to words.
 */
const WORD_SEPARATORS =
  ' \t\n\r.,;:!?"()[]{}<>/\\|@#$%^&*+=~`-\u3000，。！？、；：（）【】「」《》…“”‘'

/** @param {string} char @returns {boolean} true when `char` is part of a word */
function isWordChar(char) {
  return char !== '' && WORD_SEPARATORS.indexOf(char) === -1
}

export class TextEditor {
  /** @param {string} [text] initial text; the cursor starts at its end */
  constructor(text = '') {
    this.text = String(text).slice(0, MAX_TEXT_LENGTH)
    this.cursor = this.text.length
    /** @type {number | null} where the selection started; null when nothing is selected */
    this.anchor = null
    /** @type {{ text: string, cursor: number, anchor: number | null }[]} */
    this.undoStack = []
  }

  /** @returns {boolean} */
  hasSelection() {
    return this.anchor !== null && this.anchor !== this.cursor
  }

  /** @returns {[number, number]} start and end of the selection, or an empty range at the cursor */
  selectionRange() {
    if (!this.hasSelection()) return [this.cursor, this.cursor]
    const anchor = /** @type {number} */ (this.anchor)
    return anchor < this.cursor ? [anchor, this.cursor] : [this.cursor, anchor]
  }

  /** @returns {string} the selected text */
  selectedText() {
    const [start, end] = this.selectionRange()
    return this.text.slice(start, end)
  }

  /** Remember the current state so `undo` can return to it. */
  remember() {
    this.undoStack.push({ text: this.text, cursor: this.cursor, anchor: this.anchor })
    if (this.undoStack.length > MAX_UNDO_STEPS) this.undoStack.shift()
  }

  /**
   * Insert text at the cursor, replacing the selection.
   * @param {string} value
   * @returns {string} what was really inserted (shorter than `value` when the text is full)
   */
  insert(value) {
    const [start, end] = this.selectionRange()
    const room = MAX_TEXT_LENGTH - (this.text.length - (end - start))
    const inserted = String(value).slice(0, Math.max(0, room))
    if (!inserted && start === end) return ''
    this.remember()
    this.text = this.text.slice(0, start) + inserted + this.text.slice(end)
    this.cursor = start + inserted.length
    this.anchor = null
    return inserted
  }

  /** @returns {string} the text that was removed ('' when there was nothing to remove) */
  deleteBackward() {
    if (this.hasSelection()) return this.deleteSelection()
    if (this.cursor === 0) return ''
    this.remember()
    const removed = this.text.slice(this.cursor - 1, this.cursor)
    this.text = this.text.slice(0, this.cursor - 1) + this.text.slice(this.cursor)
    this.cursor -= 1
    return removed
  }

  /** @returns {string} the text that was removed */
  deleteForward() {
    if (this.hasSelection()) return this.deleteSelection()
    if (this.cursor >= this.text.length) return ''
    this.remember()
    const removed = this.text.slice(this.cursor, this.cursor + 1)
    this.text = this.text.slice(0, this.cursor) + this.text.slice(this.cursor + 1)
    return removed
  }

  /** @returns {string} */
  deleteSelection() {
    if (!this.hasSelection()) return ''
    const [start, end] = this.selectionRange()
    this.remember()
    const removed = this.text.slice(start, end)
    this.text = this.text.slice(0, start) + this.text.slice(end)
    this.cursor = start
    this.anchor = null
    return removed
  }

  /**
   * @param {number} to new cursor position
   * @param {boolean} extend keep/start a selection while moving
   */
  moveTo(to, extend) {
    if (extend && this.anchor === null) this.anchor = this.cursor
    if (!extend) this.anchor = null
    this.cursor = Math.max(0, Math.min(this.text.length, to))
  }

  /**
   * @param {number} delta characters to move (negative = left)
   * @param {boolean} [extend]
   * @returns {boolean} false when the cursor was already at the end it was moving towards
   */
  moveBy(delta, extend = false) {
    const before = this.cursor
    this.moveTo(this.cursor + delta, extend)
    return this.cursor !== before
  }

  /**
   * Move to the start of the previous word, or the end of the next word.
   * @param {1 | -1} direction
   * @param {boolean} [extend]
   * @returns {boolean} false when there is no further word
   */
  moveWord(direction, extend = false) {
    let at = this.cursor
    const step = direction
    const inside = (/** @type {number} */ index) => index >= 0 && index < this.text.length
    if (step > 0) {
      while (inside(at) && !isWordChar(this.text[at])) at++
      while (inside(at) && isWordChar(this.text[at])) at++
    } else {
      while (at > 0 && !isWordChar(this.text[at - 1])) at--
      while (at > 0 && isWordChar(this.text[at - 1])) at--
    }
    const moved = at !== this.cursor
    this.moveTo(at, extend)
    return moved
  }

  /** @param {'start' | 'end'} edge @param {boolean} [extend] */
  moveToEdge(edge, extend = false) {
    this.moveTo(edge === 'start' ? 0 : this.text.length, extend)
  }

  selectAll() {
    this.anchor = 0
    this.cursor = this.text.length
  }

  clearSelection() {
    this.anchor = null
  }

  /** @returns {string} the copied text ('' when nothing is selected) */
  copy() {
    if (!this.hasSelection()) return ''
    clipboard = this.selectedText()
    return clipboard
  }

  /** @returns {string} the cut text */
  cut() {
    const text = this.copy()
    if (text) this.deleteSelection()
    return text
  }

  /** @returns {string} what was pasted */
  paste() {
    return clipboard ? this.insert(clipboard) : ''
  }

  /** @returns {boolean} false when there is nothing to undo */
  undo() {
    const previous = this.undoStack.pop()
    if (!previous) return false
    this.text = previous.text
    this.cursor = previous.cursor
    this.anchor = previous.anchor
    return true
  }

  /** @returns {string} the character the cursor is in front of ('' at the end) */
  charAtCursor() {
    return this.text.slice(this.cursor, this.cursor + 1)
  }

  /** @returns {string} the word before the cursor ('' when the cursor does not follow a word) */
  wordBeforeCursor() {
    let start = this.cursor
    while (start > 0 && isWordChar(this.text[start - 1])) start--
    return this.text.slice(start, this.cursor)
  }
}

/** @returns {string} the text last copied (for tests and the programming interface) */
export function getClipboard() {
  return clipboard
}

/**
 * How a character is said: spaces and line breaks have no sound of their own.
 * @param {string} char
 * @returns {string}
 */
export function nameOfCharacter(char) {
  if (char === ' ') return gettext('space')
  if (char === '\n') return gettext('new line')
  if (char === '\t') return gettext('tab')
  return char
}

/**
 * What to say after a character was typed.
 * @param {TextEditor} editor the editor, after the character was inserted
 * @param {string} typed the character that was typed
 * @param {string} behavior 'chars' | 'words' | 'both' | 'none' (setting echoBehavior)
 * @returns {string} words to speak ('' for silence)
 */
export function echoFor(editor, typed, behavior) {
  if (!typed || behavior === 'none') return ''
  const parts = []
  if (behavior === 'chars' || behavior === 'both') parts.push(nameOfCharacter(typed))
  if ((behavior === 'words' || behavior === 'both') && !isWordChar(typed)) {
    // A word ends when a space or punctuation is typed: say the word that was finished.
    const before = new TextEditor(editor.text)
    before.cursor = Math.max(0, editor.cursor - typed.length)
    const word = before.wordBeforeCursor()
    if (word) parts.push(word)
  }
  return parts.join(' ')
}
