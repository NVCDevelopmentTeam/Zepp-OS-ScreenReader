/**
 * ZSR widget layer - the single, deterministic way ZSR's own pages create UI.
 *
 * Why this exists: patching `createWidget` at runtime (WidgetInterceptor)
 * cannot be relied on, because pages import `createWidget` by name from
 * '@zos/ui' and that binding is resolved once at module load. Instead, ZSR
 * pages call the functions below, which create the widget through the
 * official API and register it with NavigationManager in the same call.
 *
 * Works on every supported API level (2.0+): widget types that do not exist
 * on an older firmware are simply absent from `widget`, never dereferenced.
 */
import { createWidget as rawCreateWidget, widget, prop } from '@zos/ui'
import { showToast as rawShowToast } from '@zos/interaction'
import { log } from '@zos/utils'

// The reader core lives in app.js. Each page is bundled on its own, so this
// module must NOT import it (that would copy the whole reader into every page);
// it reaches the shared instances through globals at call time instead.
const getNavigation = () => globalThis.NavigationManagerInstance
const getReader = () => globalThis.ScreenReaderInstance

/** Widget types that can receive screen-reader focus (built lazily, API-level safe). */
function getFocusableTypes() {
  const names = [
    'BUTTON',
    'IMG',
    'SLIDE_SWITCH',
    'CHECKBOX_GROUP',
    'RADIO_GROUP',
    'SLIDER',
    'PROGRESS',
    'PICKER',
    'SCROLL_LIST',
    'CYCLE_LIST',
    'QRCODE'
  ]
  const set = new Set()
  names.forEach((n) => {
    if (widget && widget[n] !== undefined) set.add(widget[n])
  })
  return set
}

let focusableTypes = null

/**
 * @param {number} type
 * @param {any} options
 */
export function isFocusable(type, options) {
  if (!focusableTypes) focusableTypes = getFocusableTypes()
  if (widget && type === widget.TEXT) {
    return !!options && options.text !== undefined && String(options.text).trim() !== ''
  }
  if (widget && type === widget.IMG) {
    // Decorative images are skipped unless they are clickable / labelled.
    return !!options && (typeof options.click_func === 'function' || !!options.label)
  }
  return focusableTypes.has(type)
}

/**
 * A list row has no widget handle of its own, so it is represented by a small
 * adapter: NavigationManager reads text via getProperty(prop.TEXT) and falls
 * back to the registered options for bounds.
 */
function makeVirtualItem(text) {
  return {
    _virtual: true,
    getProperty(p) {
      return p === prop.TEXT ? text : undefined
    }
  }
}

/** Column key that holds the label text of a SCROLL_LIST row. */
function listLabelKey(options) {
  const configs = (options && options.item_config) || []
  for (let i = 0; i < configs.length; i++) {
    const views = configs[i].text_view || []
    for (let j = 0; j < views.length; j++) {
      if (views[j].key) return views[j].key
    }
  }
  return 'name'
}

/**
 * Expand a SCROLL_LIST into one focusable/activatable element per row so a
 * blind user can browse and open each item (previously the whole list was a
 * single "N items" element and rows could never be activated).
 */
function registerListItems(handle, options, parent) {
  const data = options.data_array || []
  const key = listLabelKey(options)
  const itemHeight = options.item_height || 0
  const gap = options.item_space || 0
  const baseX = options.x || 0
  const baseY = options.y || 0
  for (let i = 0; i < data.length; i++) {
    const row = data[i]
    const label =
      row && typeof row === 'object' ? String(row[key] != null ? row[key] : '') : String(row)
    const index = i
    getNavigation()?.registerElement(
      makeVirtualItem(label),
      widget.BUTTON,
      {
        text: label,
        // Read as "Item N of M" (spec item 10: list position).
        item_index: index,
        total_items: data.length,
        x: baseX,
        y: baseY + i * (itemHeight + gap),
        w: options.w || 0,
        h: itemHeight,
        click_func: () => {
          if (typeof options.item_click_func === 'function') {
            options.item_click_func(handle, index, key)
          }
        }
      },
      parent || null
    )
  }
}

function register(handle, type, options, parent, a11y) {
  try {
    if (!handle) return
    if (widget && type === widget.GROUP && parent) {
      try {
        handle._parent = parent
      } catch (_e) {
        /* handle not extensible on this firmware: nested offsets fall back to one level */
      }
    }
    if (!isFocusable(type, options)) return
    if (
      widget &&
      type === widget.SCROLL_LIST &&
      options &&
      Array.isArray(options.data_array) &&
      typeof options.item_click_func === 'function'
    ) {
      registerListItems(handle, options, parent)
      return
    }
    // `a11y` ({ label, hint }) carries screen-reader-only metadata so it never
    // has to be passed to the native widget as an unknown option.
    const merged = a11y
      ? { ...(options || {}), ...(a11y.label ? { text: a11y.label } : {}) }
      : options || {}
    getNavigation()?.registerElement(handle, type, merged, parent || null)
  } catch (e) {
    log.warn('zsrWidgets register failed: ' + (e && e.message))
  }
}

/**
 * Switches: the platform has no official way to read a switch back, so ZSR
 * keeps its own copy of the state, updated by wrapping the page's own
 * checked_change_func. `native` goes to the platform, `meta` to the reader.
 */
function trackSwitch(type, options) {
  if (!widget || type !== widget.SLIDE_SWITCH || !options) {
    return { native: options, meta: options }
  }
  const tracker = { checked: !!options.checked }
  const original = options.checked_change_func
  return {
    native: {
      ...options,
      checked_change_func: (sw, value) => {
        tracker.checked = !!value
        if (typeof original === 'function') original(sw, value)
      }
    },
    meta: { ...options, __zsrChecked: tracker }
  }
}

/**
 * Create a top-level widget and register it for screen-reader navigation.
 * @param {number} type
 * @param {any} [options]
 * @param {{label?: string}} [a11y] screen-reader-only metadata
 */
export function createWidget(type, options, a11y) {
  const { native, meta } = trackSwitch(type, options)
  const handle = rawCreateWidget(type, native)
  register(handle, type, meta, null, a11y)
  return handle
}

/**
 * Create a widget inside a GROUP (replaces `group.createWidget(...)`).
 * @param {any} parent GROUP widget handle
 * @param {number} type
 * @param {any} [options]
 * @param {{label?: string}} [a11y] screen-reader-only metadata
 */
export function createChild(parent, type, options, a11y) {
  if (!parent || typeof parent.createWidget !== 'function') {
    return createWidget(type, options, a11y)
  }
  const { native, meta } = trackSwitch(type, options)
  const handle = parent.createWidget(type, native)
  register(handle, type, meta, parent, a11y)
  return handle
}

/**
 * Toast that is also spoken. `showToast` lives in '@zos/interaction'
 * (API_LEVEL 2.0+), not '@zos/ui'.
 * @param {{content: string} | string} options
 */
export function showToast(options) {
  const content = typeof options === 'string' ? options : (options && options.content) || ''
  try {
    getReader()?.speak(content, { priority: 'high' })
  } catch (_e) {
    /* speech must never break the UI */
  }
  try {
    rawShowToast({ content })
  } catch (e) {
    log.warn('showToast failed: ' + (e && e.message))
  }
}

export { widget }
