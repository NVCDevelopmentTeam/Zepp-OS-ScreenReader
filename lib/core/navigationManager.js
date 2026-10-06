import { widget, prop } from '@zos/ui'
import { log } from '@zos/utils'
import { getDeviceInfo } from '@zos/device'

import { format, gettext } from '../utils/i18n.js'
import { normalize as normalizeForSearch } from './voiceCommands.js'
const WIDGET_NAMES = {
  [widget.TEXT]: 'Text',
  [widget.BUTTON]: 'Button',
  [widget.IMG]: 'Image',
  [widget.SLIDE_SWITCH]: 'Switch',
  [widget.CHECKBOX_GROUP]: 'Checkbox',
  [widget.RADIO_GROUP]: 'Radio',
  [widget.SCROLL_LIST]: 'List',
  [widget.CYCLE_LIST]: 'Cycle List',
  [widget.DIALOG]: 'Dialog',
  [widget.SLIDER]: 'Slider',
  [widget.PROGRESS]: 'Progress',
  [widget.PICKER]: 'Picker',
  [widget.VIEW_CONTAINER]: 'Container'
}

const MODE_NAMES = {
  default: 'Default navigation',
  character: 'Characters',
  word: 'Words',
  sentence: 'Sentences',
  paragraph: 'Paragraphs',
  heading: 'Headings',
  link: 'Links',
  controls: 'Controls',
  speech_rate: 'Speech rate'
}

class NavigationManager {
  constructor() {
    /** @type {'status' | 'content' | 'navigation' | null} */
    this.currentRegion = null
    this.currentIndex = -1
    this.reviewIndex = -1
    this.elements = []
    this.modes = [
      'default',
      'character',
      'word',
      'sentence',
      'paragraph',
      'heading',
      'link',
      'controls',
      'speech_rate'
    ]
    this.currentModeIndex = 0
    this._appliedDefaultGranularity = false
    this.textPosition = 0
    this.onFocusChange = null
  }

  getCurrentMode() {
    // Apply the saved "Granularity" default (settingsKey
    // 'defaultGranularity', setting/SpeechSetting.js) once config becomes
    // available, instead of always starting at 'default' regardless of
    // what the user configured. Lazy/once-only because this singleton is
    // constructed before app.js's loadSettings() populates
    // globalThis.ScreenReaderConfig.
    if (!this._appliedDefaultGranularity && globalThis.ScreenReaderConfig) {
      this._appliedDefaultGranularity = true
      const preferred = globalThis.ScreenReaderConfig.defaultGranularity
      const idx = this.modes.indexOf(preferred)
      if (idx !== -1) this.currentModeIndex = idx
    }
    return this.modes[this.currentModeIndex]
  }

  moveReviewCursor(direction) {
    // "Review Cursor" (settingsKey 'reviewCursor', NavigationSetting.js)
    // gates whether this separate examine-without-moving-focus cursor is
    // available at all - when off, fall back to moving actual focus so
    // the assigned gesture still does something useful.
    if (globalThis.ScreenReaderConfig?.reviewCursor === false) {
      const nextIndex = this.getNextIndex(direction === 'next' ? 'next' : 'prev')
      if (nextIndex !== -1) this.focusElement(nextIndex)
      return
    }

    const count = this.elements.length
    if (count === 0) return

    if (this.reviewIndex === -1) this.reviewIndex = this.currentIndex !== -1 ? this.currentIndex : 0

    if (direction === 'next') {
      this.reviewIndex = (this.reviewIndex + 1) % count
    } else {
      this.reviewIndex = (this.reviewIndex - 1 + count) % count
    }

    this.readReviewCursor()
  }

  async readReviewCursor() {
    if (this.reviewIndex === -1 || !this.elements[this.reviewIndex]) return

    const elementInfo = this.elements[this.reviewIndex]
    const text = this.getElementText(elementInfo.element, elementInfo.type, elementInfo.options)
    const screenReader = this.getScreenReader()

    if (screenReader) {
      await screenReader.speak(format(gettext('Review: {0}'), text), { priority: 'high' })
    }

    if (globalThis.ScreenReaderUIInstance) {
      const bounds = this.getAbsoluteBounds(elementInfo)
      globalThis.ScreenReaderUIInstance.updateFocusRect(bounds)
    }
  }

  getScreenReader() {
    return globalThis.ScreenReaderInstance
  }

  cycleMode(direction = 'next') {
    const count = this.modes.length
    if (direction === 'next') {
      this.currentModeIndex = (this.currentModeIndex + 1) % count
    } else {
      this.currentModeIndex = (this.currentModeIndex - 1 + count) % count
    }

    const mode = this.getCurrentMode()
    const screenReader = this.getScreenReader()
    if (screenReader) {
      const modeLabel = gettext(MODE_NAMES[mode]) || mode
      screenReader.speak(modeLabel, { priority: 'high', force: true })
    }
    return mode
  }

  registerElement(element, type, options = {}, parent = null) {
    try {
      if (!element) return false
      // Avoid duplicate registration
      if (this.elements.some((e) => e.element === element)) return true

      this.elements.push({
        element,
        type,
        options,
        parent,
        focusable: true,
        index: this.elements.length
      })
      log.debug(`Registered widget type: ${type}${parent ? ' with parent' : ''}`)
      return true
    } catch (/** @type {any} */ error) {
      log.error('Element registration failed:', error)
      return false
    }
  }

  async navigate(direction) {
    try {
      const screenReader = this.getScreenReader()
      const mode = this.getCurrentMode()

      if (mode === 'speech_rate') {
        const config = globalThis.ScreenReaderConfig || {}
        let currentRate = Number(config.speechRate || 1.0)
        if (direction === 'next') {
          currentRate = Math.min(3.0, Math.round((currentRate + 0.1) * 10) / 10)
        } else {
          currentRate = Math.max(0.5, Math.round((currentRate - 0.1) * 10) / 10)
        }
        config.speechRate = currentRate
        if (screenReader) {
          await screenReader.speak(format(gettext('Rate {0}%'), Math.round(currentRate * 100)), {
            priority: 'high',
            force: true
          })
        }
        return true
      }

      if (this.elements.length === 0) {
        if (screenReader)
          await screenReader.speak(gettext('No focusable elements on screen'), { priority: 'high' })
        return false
      }

      if (mode === 'default') {
        const nextIndex = this.getNextIndex(direction === 'next' ? 'next' : 'prev')
        if (nextIndex !== -1) {
          await this.focusElement(nextIndex)
        }
      } else if (mode === 'controls' || mode === 'browse') {
        // Jump to next interactive element (buttons, links, switches, sliders)
        await this.navigateByType(direction === 'next' ? 'next' : 'prev', null, 'interactive')
      } else {
        await this.navigateInText(direction === 'next' ? 'next' : 'prev', mode)
      }
      return true
    } catch (/** @type {any} */ error) {
      log.error('Navigation failed:', error)
      return false
    }
  }

  async navigateInText(direction, mode) {
    const screenReader = this.getScreenReader()
    if (this.currentIndex === -1) {
      if (this.elements.length > 0) {
        await this.focusElement(0)
      }
      return
    }

    const elementInfo = this.elements[this.currentIndex]
    const text = this.getElementText(elementInfo.element, elementInfo.type, elementInfo.options)

    if (!text || text === 'Unlabelled') {
      if (screenReader)
        await screenReader.speak(gettext('No text to navigate'), { priority: 'high' })
      return
    }

    if (mode === 'character') {
      if (direction === 'next') {
        if (this.textPosition < text.length - 1) {
          this.textPosition++
          const char = text[this.textPosition]
          if (screenReader) await screenReader.speak(char, { priority: 'high' })
        } else {
          // Move to next element
          const nextIndex = this.getNextIndex('next')
          if (nextIndex !== -1) await this.focusElement(nextIndex)
        }
      } else {
        if (this.textPosition > 0) {
          this.textPosition--
          const char = text[this.textPosition]
          if (screenReader) await screenReader.speak(char, { priority: 'high' })
        } else {
          // Move to previous element
          const prevIndex = this.getNextIndex('prev')
          if (prevIndex !== -1) {
            await this.focusElement(prevIndex)
            // Set position to end of previous element
            const prevText = this.getElementText(
              this.elements[prevIndex].element,
              this.elements[prevIndex].type,
              this.elements[prevIndex].options
            )
            this.textPosition = Math.max(0, prevText.length - 1)
          }
        }
      }
    } else if (mode === 'word') {
      // Build a list of {word, start} so the cursor jumps accurately
      // even when there are punctuation/whitespace gaps between words.
      const wordRegex = /\S+/g
      const words = []
      let match
      while ((match = wordRegex.exec(text)) !== null) {
        words.push({ word: match[0], start: match.index })
      }
      if (words.length === 0) {
        if (screenReader)
          await screenReader.speak(gettext('No text to navigate'), { priority: 'high' })
        return
      }

      let currentWordIndex = 0
      for (let i = 0; i < words.length; i++) {
        if (this.textPosition >= words[i].start) {
          currentWordIndex = i
        } else {
          break
        }
      }

      if (direction === 'next') {
        if (currentWordIndex < words.length - 1) {
          currentWordIndex++
          this.textPosition = words[currentWordIndex].start
          if (screenReader)
            await screenReader.speak(words[currentWordIndex].word, { priority: 'high' })
        } else {
          const nextIndex = this.getNextIndex('next')
          if (nextIndex !== -1) await this.focusElement(nextIndex)
        }
      } else {
        if (currentWordIndex > 0) {
          currentWordIndex--
          this.textPosition = words[currentWordIndex].start
          if (screenReader)
            await screenReader.speak(words[currentWordIndex].word, { priority: 'high' })
        } else {
          const prevIndex = this.getNextIndex('prev')
          if (prevIndex !== -1) await this.focusElement(prevIndex)
        }
      }
    } else if (mode === 'sentence' || mode === 'paragraph') {
      const delimiter = mode === 'sentence' ? /[.!?]+\s*/ : /\n+\s*/
      const items = text.split(delimiter).filter((s) => s.trim().length > 0)
      if (items.length === 0) {
        if (screenReader)
          await screenReader.speak(gettext('No text to navigate'), { priority: 'high' })
        return
      }
      let currentItemIndex = 0
      let charCount = 0

      for (let i = 0; i < items.length; i++) {
        charCount += items[i].length
        if (this.textPosition < charCount) {
          currentItemIndex = i
          break
        }
      }

      if (direction === 'next') {
        if (currentItemIndex < items.length - 1) {
          currentItemIndex++
          this.textPosition = text.indexOf(items[currentItemIndex])
          if (screenReader) await screenReader.speak(items[currentItemIndex], { priority: 'high' })
        } else {
          const nextIndex = this.getNextIndex('next')
          if (nextIndex !== -1) await this.focusElement(nextIndex)
        }
      } else {
        if (currentItemIndex > 0) {
          currentItemIndex--
          this.textPosition = text.indexOf(items[currentItemIndex])
          if (screenReader) await screenReader.speak(items[currentItemIndex], { priority: 'high' })
        } else {
          const prevIndex = this.getNextIndex('prev')
          if (prevIndex !== -1) await this.focusElement(prevIndex)
        }
      }
    } else {
      await this.navigateByType(direction, null, mode)
    }
  }

  async readCurrent() {
    if (this.currentIndex === -1) return
    const elementInfo = this.elements[this.currentIndex]
    const text = this.getElementText(elementInfo.element, elementInfo.type, elementInfo.options)
    const screenReader = this.getScreenReader()
    if (screenReader) await screenReader.speak(text, { priority: 'high' })
  }

  async navigateByType(direction, targetType, mode) {
    const screenReader = this.getScreenReader()
    let found = false

    const start = this.currentIndex
    const count = this.elements.length
    if (count === 0) return false

    for (let i = 1; i <= count; i++) {
      const checkIndex = direction === 'next' ? (start + i) % count : (start - i + count) % count

      const el = this.elements[checkIndex]
      let match = false

      if (mode === 'heading') {
        // Heading heuristic: Large text or bold text
        match =
          el.type === widget.TEXT &&
          (el.options.text_size >= 28 ||
            // Zepp OS has no bold text style; pages can mark a heading explicitly.
            el.options.is_heading === true ||
            String(el.options.text_style).includes('bold'))
      } else if (mode === 'link') {
        // Link heuristic: Buttons or specifically marked links
        match = el.type === widget.BUTTON || el.options.is_link === true
      } else if (mode === 'list_item') {
        // List item heuristic: Part of a list or has item index
        match =
          el.options.item_index !== undefined ||
          el.type === widget.SCROLL_LIST ||
          el.type === widget.CYCLE_LIST
      } else if (mode === 'interactive') {
        // Interactive: buttons, switches, checkboxes, sliders
        match = [
          widget.BUTTON,
          widget.SLIDE_SWITCH,
          widget.CHECKBOX_GROUP,
          widget.RADIO_GROUP,
          widget.SLIDER,
          widget.PICKER
        ].includes(el.type)
      } else if (targetType) {
        match = el.type === targetType
      }

      if (match) {
        await this.focusElement(checkIndex)
        found = true
        break
      }
    }

    if (!found) {
      if (screenReader) {
        const modeLabel = mode === 'list_item' ? 'list item' : mode
        await screenReader.speak(format(gettext('No more {0}s found'), modeLabel), {
          priority: 'high'
        })
      }
    }
    return found
  }

  async focusElement(index) {
    if (index < 0 || index >= this.elements.length) return false

    const screenReader = this.getScreenReader()
    const config = globalThis.ScreenReaderConfig || {}

    this.currentIndex = index
    this.textPosition = 0
    const elementInfo = this.elements[index]
    const { element, type, options } = elementInfo

    let textToSpeak = this.getElementText(element, type, options)
    const typeName = gettext(WIDGET_NAMES[type] || '')
    const stateText = this.getElementState(element, type, options)

    let fullText = textToSpeak
    // "Verbose Speech" (settingsKey 'verboseSpeech', DeveloperSettings.js):
    // always announce the element's type explicitly, even when the
    // heuristic below would normally omit it as redundant. This matches
    // NVDA's "speak role always" style verbose mode - useful when
    // learning the app's structure, at the cost of slightly longer
    // announcements.
    if (typeName && (config.verboseSpeech || !textToSpeak.includes(typeName))) {
      fullText = `${textToSpeak}, ${typeName}`
    }

    if (stateText) {
      fullText += `, ${stateText}`
    }

    // Screen regions: say where focus is when it moves into another region
    // (status bar / main content / navigation area). Local state, reset per page.
    if (config.announceRegions !== false) {
      const region = this.getRegion(elementInfo)
      if (this.currentRegion !== null && region !== this.currentRegion) {
        fullText = `${this.getRegionName(region)}. ${fullText}`
      }
      this.currentRegion = region
    }

    // Add list position info
    if (type === widget.SCROLL_LIST || type === widget.CYCLE_LIST) {
      // If we are focusing the list itself, we already said "X items"
    } else if (options.item_index !== undefined && options.total_items !== undefined) {
      if (config.readListPosition !== false) {
        fullText +=
          ', ' + format(gettext('Item {0} of {1}'), options.item_index + 1, options.total_items)
      }
    }

    // Add usage hints
    if (config.readUsageHints !== false && options.usage_hint) {
      fullText += `. Hint: ${options.usage_hint}`
    }

    if (fullText) {
      // "Spell out mode" (settingsKey 'spellOutMode') makes every
      // navigation announcement spell its core text letter-by-letter
      // (matching the manual spellOut() action's behavior), while still
      // announcing type/state/hints normally afterward rather than
      // spelling those out too.
      if (config.spellOutMode && screenReader && textToSpeak) {
        for (const char of textToSpeak) {
          await screenReader.speak(char, { priority: 'high', force: true })
        }
        const rest = fullText.slice(textToSpeak.length)
        if (rest) await screenReader.speak(rest, { priority: 'high' })
      } else if (screenReader) {
        await screenReader.speak(fullText, { priority: 'high' })
      }
    }

    if (this.onFocusChange) {
      this.onFocusChange(index)
    }

    return true
  }

  getElementText(element, type, options) {
    let text = ''
    const config = globalThis.ScreenReaderConfig || {}

    // Check for custom accessibility label first
    if (options.accessibility_label) return options.accessibility_label

    try {
      if (options.is_password) {
        const rawText = element.getProperty
          ? element.getProperty(prop.TEXT)
          : element.text || options.text || ''
        if (config.readPasswords === true) {
          text = rawText || gettext('Blank password')
        } else {
          const len = rawText ? rawText.length : 0
          return len > 0
            ? format(gettext('Password field, {0} bullets'), len)
            : gettext('Password field, blank')
        }
      }

      switch (type) {
        case widget.TEXT:
        case widget.BUTTON:
          if (element.getProperty) {
            text = element.getProperty(prop.TEXT) || options.text || ''
          } else {
            text = element.text || options.text || ''
          }
          break
        case widget.IMG:
          text =
            options.accessibility_text ||
            (options.src ? (options.src.split('/').pop() || '').split('.')[0] : '')
          break
        case widget.SLIDE_SWITCH:
          text = options.text || gettext('Switch')
          break
        case widget.CHECKBOX_GROUP:
          text = options.text || gettext('Checkbox')
          break
        case widget.RADIO_GROUP:
          text = options.text || gettext('Radio')
          break
        case widget.SCROLL_LIST:
        case widget.CYCLE_LIST: {
          const count = options.data_count || (options.data_array && options.data_array.length) || 0
          text = format(gettext('{0} items'), count)
          break
        }
        case widget.DIALOG:
          text = `${options.title || ''} ${options.content || ''}`
          break
        case widget.PICKER:
          text = gettext('Picker')
          break
        case widget.SLIDER:
          text = options.text || options.accessibility_text || gettext('Slider')
          break
        case widget.PROGRESS:
          text = gettext('Progress bar')
          break
        case widget.VIEW_CONTAINER:
          text = gettext('Container')
          break
        default:
          text = options.text || ''
      }

      // If text is still empty, announce unlabeled element with its type and id/index
      if (!text) {
        const typeName = gettext(WIDGET_NAMES[type] || 'Element')
        const index = this.elements.findIndex((e) => e.element === element)
        const idLabel = options.id ? `${options.id}` : index !== -1 ? `${index + 1}` : ''
        text = idLabel
          ? format(gettext('Unlabeled {0} {1}'), typeName, idLabel)
          : format(gettext('Unlabeled {0}'), typeName)
      }

      // Add usage hints
      if (globalThis.ScreenReaderConfig?.readUsageHints) {
        if (type === widget.BUTTON) text += ', ' + gettext('Double tap to activate')
        if (type === widget.SLIDE_SWITCH) text += ', ' + gettext('Double tap to toggle')
      }
    } catch (/** @type {any} */ e) {
      log.error('Error getting element text:', e)
    }

    return text || gettext('Unlabelled')
  }

  /**
   * Checked state of a switch / checkbox. The platform has no official way to
   * read it back, so ZSR tracks the state itself (see zsrWidgets.trackSwitch).
   */
  readChecked(element, options) {
    if (options && options.__zsrChecked) return options.__zsrChecked.checked
    if (options && typeof options.checked === 'boolean') return options.checked
    return undefined
  }

  getElementState(element, type, options) {
    let state = ''
    if (!element.getProperty) return state

    try {
      if (
        type === widget.SLIDE_SWITCH ||
        type === widget.CHECKBOX_GROUP ||
        type === widget.RADIO_GROUP
      ) {
        const checked = this.readChecked(element, options)
        if (checked !== undefined) {
          state += checked ? gettext('On') : gettext('Off')
        }
      }

      // Buttons expose `enable`; there is no official ENABLED property.
      if (options && options.enable === false) {
        state += state ? ', ' + gettext('disabled') : gettext('disabled')
      }

      if (type === widget.SLIDER || type === widget.PROGRESS) {
        const val = options.val ?? 0
        const max = options.max ?? 100
        const min = options.min ?? 0
        const config = globalThis.ScreenReaderConfig || {}
        const progressFeedback = config.progressFeedback || 'both'
        if (type === widget.SLIDER) {
          const rangeText = format(gettext('{0}. Range {1} to {2}'), val, min, max)
          state += state ? `, ${rangeText}` : rangeText
        } else {
          const percent = Math.round(((val - min) / (max - min)) * 100)
          if (progressFeedback === 'speech' || progressFeedback === 'both') {
            state += state ? `, ${percent}%` : `${percent}%`
          }
          if (progressFeedback === 'beep' || progressFeedback === 'both') {
            globalThis.ScreenReaderInstance?.sound?.play('click')
          }
        }
      }
    } catch (_error) {
      // No-op
    }

    return state
  }

  getNextIndex(direction) {
    const count = this.elements.length
    if (count === 0) return -1

    // "Browse Mode Order" (settingsKey 'browseOrder', NavigationSetting.js):
    // 'type' groups elements by widget type (all buttons together, then
    // all text, etc.) instead of the default registration/visual order.
    if (globalThis.ScreenReaderConfig?.browseOrder === 'type') {
      const order = this.elements
        .map((el, i) => ({ i, type: el.type }))
        .sort((a, b) => (a.type > b.type ? 1 : a.type < b.type ? -1 : a.i - b.i))
      const pos = order.findIndex((o) => o.i === this.currentIndex)
      const safePos = pos === -1 ? 0 : pos
      const nextPos = direction === 'next' ? (safePos + 1) % count : (safePos - 1 + count) % count
      return order[nextPos].i
    }

    if (direction === 'next') {
      return (this.currentIndex + 1) % count
    }
    return (this.currentIndex - 1 + count) % count
  }

  /**
   * Logical screen region of an element, from its vertical position:
   * status area (top), navigation area (bottom) or main content (between).
   * @param {any} elementInfo
   * @returns {'status' | 'content' | 'navigation'}
   */
  getRegion(elementInfo) {
    try {
      const bounds = this.getAbsoluteBounds(elementInfo)
      if (!bounds) return 'content'
      const { height } = getDeviceInfo()
      const centerY = bounds.y + bounds.h / 2
      if (centerY < height * 0.14) return 'status'
      if (centerY > height * 0.82) return 'navigation'
    } catch (_e) {
      /* unknown geometry: treat as content */
    }
    return 'content'
  }

  /** @param {'status' | 'content' | 'navigation'} region */
  getRegionName(region) {
    if (region === 'status') return gettext('Status bar')
    if (region === 'navigation') return gettext('Navigation area')
    return gettext('Main content')
  }

  /**
   * Screen search: focus the next (or previous) element on the page whose
   * spoken text contains `query` (case and accent insensitive).
   * @param {string} query
   * @param {'next' | 'prev'} [direction]
   * @returns {Promise<boolean>} true when a match was found
   */
  async search(query, direction = 'next') {
    const needle = normalizeForSearch(query)
    const screenReader = this.getScreenReader()
    const count = this.elements.length
    if (!needle || count === 0) {
      if (screenReader) {
        await screenReader.speak(format(gettext('No match for {0}'), query || ''), {
          priority: 'high'
        })
      }
      return false
    }
    const step = direction === 'prev' ? -1 : 1
    const start = this.currentIndex === -1 ? (step === 1 ? -1 : 0) : this.currentIndex
    for (let i = 1; i <= count; i++) {
      const index = (((start + step * i) % count) + count) % count
      const info = this.elements[index]
      let text
      try {
        text = this.getElementText(info.element, info.type, info.options)
      } catch (_e) {
        continue
      }
      if (normalizeForSearch(text).indexOf(needle) !== -1) {
        await this.focusElement(index)
        return true
      }
    }
    if (screenReader) {
      await screenReader.speak(format(gettext('No match for {0}'), query), { priority: 'high' })
    }
    return false
  }

  getAbsoluteBounds(elementInfo) {
    const { element, options, parent } = elementInfo
    let x = 0
    let y = 0
    let w = 0
    let h = 0

    try {
      if (element.getProperty) {
        x = element.getProperty(prop.X) ?? options.x ?? 0
        y = element.getProperty(prop.Y) ?? options.y ?? 0
        w = element.getProperty(prop.W) ?? options.w ?? 0
        h = element.getProperty(prop.H) ?? options.h ?? 0
      } else {
        x = options.x ?? 0
        y = options.y ?? 0
        w = options.w ?? 0
        h = options.h ?? 0
      }

      // If there's a parent, add its position
      if (parent) {
        let p = parent
        while (p) {
          if (p.getProperty) {
            x += p.getProperty(prop.X) || 0
            y += p.getProperty(prop.Y) || 0
          }
          // We assume WidgetInterceptor added _parent to the group
          p = p._parent
        }
      }
    } catch (/** @type {any} */ e) {
      log.error('Error getting absolute bounds:', e)
    }

    return { x, y, w, h }
  }

  findElementAt(x, y) {
    // Find the focusable element that contains the point (x, y)
    // We reverse to find the top-most element first
    for (let i = this.elements.length - 1; i >= 0; i--) {
      const bounds = this.getAbsoluteBounds(this.elements[i])

      if (x >= bounds.x && x <= bounds.x + bounds.w && y >= bounds.y && y <= bounds.y + bounds.h) {
        return i
      }
    }
    return -1
  }

  clearElements() {
    this.currentRegion = null
    this.elements = []
    this.currentIndex = -1
  }

  async spellOut() {
    const screenReader = this.getScreenReader()
    if (this.currentIndex === -1 || !screenReader) return

    const elementInfo = this.elements[this.currentIndex]
    const text = this.getElementText(elementInfo.element, elementInfo.type, elementInfo.options)

    if (text) {
      for (const char of text) {
        await screenReader.speak(char, { priority: 'high', force: true })
      }
    }
  }

  async navigateToEdge(edge) {
    if (this.elements.length === 0) return
    const index = edge === 'first' ? 0 : this.elements.length - 1
    await this.focusElement(index)
  }

  async readCenterElement() {
    const { width, height } = getDeviceInfo()
    const centerX = width / 2
    const centerY = height / 2
    let closestIndex = -1
    let minDistance = Infinity

    for (let i = 0; i < this.elements.length; i++) {
      const bounds = this.getAbsoluteBounds(this.elements[i])
      if (
        centerX >= bounds.x &&
        centerX <= bounds.x + bounds.w &&
        centerY >= bounds.y &&
        centerY <= bounds.y + bounds.h
      ) {
        closestIndex = i
        break
      }
      const elemCenterX = bounds.x + bounds.w / 2
      const elemCenterY = bounds.y + bounds.h / 2
      const dist = Math.hypot(centerX - elemCenterX, centerY - elemCenterY)
      if (dist < minDistance) {
        minDistance = dist
        closestIndex = i
      }
    }

    if (closestIndex !== -1) {
      await this.focusElement(closestIndex)
    } else {
      const screenReader = this.getScreenReader()
      if (screenReader) {
        await screenReader.speak(gettext('No element found at center of screen'), {
          priority: 'high'
        })
      }
    }
  }

  /**
   * Activate the focused element (double tap).
   * - buttons / rows: their click handler
   * - switches: toggle and fire the widget's change callback ourselves,
   *   because setProperty() does not raise it
   */
  handleSelection() {
    if (this.currentIndex === -1) return
    const elementInfo = this.elements[this.currentIndex]
    if (!elementInfo) return

    const { element, options, type } = elementInfo

    try {
      if (element.onClick) {
        element.onClick()
        return
      }
      if (typeof options.click_func === 'function') {
        options.click_func(element)
        return
      }
      if (type === widget.SLIDE_SWITCH && element.setProperty) {
        const tracked =
          options.__zsrChecked || (options.__zsrChecked = { checked: !!options.checked })
        const next = !tracked.checked
        tracked.checked = next
        // setProperty(prop.MORE, {...}) is the official way to change options.
        element.setProperty(prop.MORE, { checked: next })
        if (typeof options.checked_change_func === 'function') {
          options.checked_change_func(element, next)
        }
        const screenReader = globalThis.ScreenReaderInstance
        if (screenReader) {
          screenReader.speak(next ? gettext('On') : gettext('Off'), { priority: 'high' })
        }
      }
    } catch (/** @type {any} */ e) {
      log.error('Activation failed:', e)
    }
  }
}

// Shared across separately bundled pages: reuse the instance that already exists.
const navigationManager = globalThis.NavigationManagerInstance || new NavigationManager()
globalThis.NavigationManagerInstance = navigationManager
export default navigationManager
