import { widget, prop } from '@zos/ui'
import { log } from '@zos/utils'

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

class NavigationManager {
  constructor() {
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
      'list_item',
      'browse'
    ]
    this.currentModeIndex = 0
    this.textPosition = 0
    this.onFocusChange = null
  }

  moveReviewCursor(direction) {
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
      await screenReader.speak(`Review: ${text}`, { priority: 'high' })
    }

    if (globalThis.ScreenReaderUIInstance) {
      const bounds = this.getAbsoluteBounds(elementInfo)
      globalThis.ScreenReaderUIInstance.updateFocusRect(bounds)
    }
  }

  getScreenReader() {
    return globalThis.ScreenReaderInstance
  }

  getCurrentMode() {
    return this.modes[this.currentModeIndex]
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
      screenReader.speak(`Navigation mode: ${mode}`, { priority: 'high' })
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
    } catch (error) {
      log.error('Element registration failed:', error)
      return false
    }
  }

  async navigate(direction) {
    try {
      const screenReader = this.getScreenReader()
      if (this.elements.length === 0) {
        if (screenReader)
          await screenReader.speak('No focusable elements on screen', { priority: 'high' })
        return false
      }

      const mode = this.getCurrentMode()
      if (mode === 'default') {
        const nextIndex = this.getNextIndex(direction === 'next' ? 'next' : 'prev')
        if (nextIndex !== -1) {
          await this.focusElement(nextIndex)
        }
      } else if (mode === 'browse') {
        // In browse mode, jump to next interactive element (buttons, links, switches)
        await this.navigateByType(direction === 'next' ? 'next' : 'prev', null, 'interactive')
      } else {
        await this.navigateInText(direction === 'next' ? 'next' : 'prev', mode)
      }
      return true
    } catch (error) {
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
      if (screenReader) await screenReader.speak('No text to navigate', { priority: 'high' })
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
      const words = text.match(/\b\w+\b/g) || [text]
      let currentWordIndex = -1
      let charCount = 0

      for (let i = 0; i < words.length; i++) {
        if (this.textPosition <= charCount + words[i].length) {
          currentWordIndex = i
          break
        }
        charCount += text.indexOf(words[i], charCount) - charCount + words[i].length
      }

      if (direction === 'next') {
        if (currentWordIndex < words.length - 1) {
          currentWordIndex++
          this.textPosition = text.indexOf(words[currentWordIndex], charCount)
          if (screenReader) await screenReader.speak(words[currentWordIndex], { priority: 'high' })
        } else {
          const nextIndex = this.getNextIndex('next')
          if (nextIndex !== -1) await this.focusElement(nextIndex)
        }
      } else {
        if (currentWordIndex > 0) {
          currentWordIndex--
          this.textPosition = text.indexOf(words[currentWordIndex])
          if (screenReader) await screenReader.speak(words[currentWordIndex], { priority: 'high' })
        } else {
          const prevIndex = this.getNextIndex('prev')
          if (prevIndex !== -1) await this.focusElement(prevIndex)
        }
      }
    } else if (mode === 'sentence' || mode === 'paragraph') {
      const delimiter = mode === 'sentence' ? /[.!?]+\s*/ : /\n+\s*/
      const items = text.split(delimiter).filter((s) => s.trim().length > 0)
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
            el.options.text_style === widget.TEXT_STYLE_BOLD ||
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
        await screenReader.speak(`No more ${modeLabel}s found`, { priority: 'high' })
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
    const typeName = WIDGET_NAMES[type] || ''
    const stateText = this.getElementState(element, type, options)

    let fullText = textToSpeak
    if (typeName && !textToSpeak.includes(typeName)) {
      fullText = `${textToSpeak}, ${typeName}`
    }

    if (stateText) {
      fullText += `, ${stateText}`
    }

    // Add list position info
    if (type === widget.SCROLL_LIST || type === widget.CYCLE_LIST) {
      // If we are focusing the list itself, we already said "X items"
    } else if (options.item_index !== undefined && options.total_items !== undefined) {
      if (config.readListItemPosition !== false) {
        fullText += `, Item ${options.item_index + 1} of ${options.total_items}`
      }
    }

    // Add usage hints
    if (config.readUsageHints !== false && options.usage_hint) {
      fullText += `. Hint: ${options.usage_hint}`
    }

    if (fullText) {
      if (screenReader) await screenReader.speak(fullText, { priority: 'high' })
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
        if (config.reportPasswords === 'spell') {
          text = element.getProperty
            ? element.getProperty(prop.TEXT)
            : element.text || options.text || ''
        } else {
          return 'Password field'
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
            (options.src ? options.src.split('/').pop().split('.')[0] : 'Image')
          break
        case widget.SLIDE_SWITCH:
          text = options.text || 'Switch'
          break
        case widget.CHECKBOX_GROUP:
          text = options.text || 'Checkbox'
          break
        case widget.RADIO_GROUP:
          text = options.text || 'Radio'
          break
        case widget.SCROLL_LIST:
        case widget.CYCLE_LIST: {
          const count = options.data_count || (options.data_array && options.data_array.length) || 0
          text = `${count} items`
          break
        }
        case widget.DIALOG:
          text = `${options.title || ''} ${options.content || ''}`
          break
        case widget.PICKER:
          text = 'Picker'
          break
        case widget.SLIDER:
          text = 'Slider'
          break
        case widget.PROGRESS:
          text = 'Progress bar'
          break
        case widget.VIEW_CONTAINER:
          text = 'Container'
          break
        default:
          text = options.text || 'Unlabelled'
      }

      // Add item position if it's part of a list
      const index = this.elements.findIndex((e) => e.element === element)
      if (index !== -1 && globalThis.ScreenReaderConfig?.readListPosition) {
        text = `${text}, Item ${index + 1} of ${this.elements.length}`
      }

      // Add usage hints
      if (globalThis.ScreenReaderConfig?.readUsageHints) {
        if (type === widget.BUTTON) text += ', Double tap to activate'
        if (type === widget.SLIDE_SWITCH) text += ', Double tap to toggle'
      }
    } catch (e) {
      log.error('Error getting element text:', e)
    }

    return text || 'Unlabelled'
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
        const checked = element.getProperty(prop.CHECKED)
        if (checked !== undefined) {
          state += checked ? 'On' : 'Off'
        }
      }

      const enabled = element.getProperty(prop.ENABLED)
      if (enabled === false) {
        state += state ? ', disabled' : 'disabled'
      }

      if (type === widget.SLIDER || type === widget.PROGRESS) {
        const val = element.getProperty(prop.VALUE) ?? options.val ?? 0
        const max = options.max ?? 100
        const min = options.min ?? 0
        if (type === widget.SLIDER) {
          state += state ? `, ${val}. Range ${min} to ${max}` : `${val}. Range ${min} to ${max}`
        } else {
          const percent = Math.round(((val - min) / (max - min)) * 100)
          state += state ? `, ${percent}%` : `${percent}%`
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

    if (direction === 'next') {
      return (this.currentIndex + 1) % count
    }
    return (this.currentIndex - 1 + count) % count
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
    } catch (e) {
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

  handleSelection() {
    if (this.currentIndex === -1) return
    const elementInfo = this.elements[this.currentIndex]
    if (!elementInfo) return

    const { element, options } = elementInfo

    if (element.onClick) {
      element.onClick()
    } else if (options.click_func) {
      options.click_func()
    }
  }
}

const navigationManager = new NavigationManager()
globalThis.NavigationManagerInstance = navigationManager
export default navigationManager
