/**
 * Groups of Zepp OS widget types that share one accessible role.
 *
 * Zepp OS has no SLIDER, PROGRESS or PICKER widget: progress is drawn by the
 * *_PROGRESS widgets and pickers are the *_PICKER / PICK_DATE widgets. Looking up
 * a name that does not exist yields `undefined`, which would make every
 * widget of an unknown type look like that role, so names are resolved here and
 * missing ones (older API levels) are dropped.
 */
import { widget } from '@zos/ui'

/**
 * @param {string[]} names widget type names, e.g. ['ARC_PROGRESS']
 * @returns {number[]} the numeric widget types that exist on this firmware
 */
export function resolveTypes(names) {
  const out = []
  names.forEach((name) => {
    if (widget && widget[name] !== undefined) out.push(widget[name])
  })
  return out
}

const PROGRESS_TYPES = resolveTypes([
  'ARC_PROGRESS',
  'LINE_PROGRESS',
  'IMG_PROGRESS',
  'IMG_ARC_PROGRESS'
])
const PICKER_TYPES = resolveTypes(['WIDGET_PICKER', 'TIME_PICKER', 'PICK_DATE'])

/** @param {number} type */
export const isProgressType = (type) => type !== undefined && PROGRESS_TYPES.includes(type)

/** @param {number} type */
export const isPickerType = (type) => type !== undefined && PICKER_TYPES.includes(type)

export { PICKER_TYPES, PROGRESS_TYPES }
