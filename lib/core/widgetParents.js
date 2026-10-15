/**
 * Remembers which group a widget was created in.
 *
 * Kept outside the widget objects: they belong to the system UI layer and must
 * not be given extra properties. Used to turn a child's position (relative to
 * its group) into screen coordinates.
 */
const parents = new WeakMap()

/**
 * @param {object} widget
 * @param {object | null} parent the group that contains `widget`
 */
export function setParent(widget, parent) {
  if (widget && typeof widget === 'object' && parent) parents.set(widget, parent)
}

/**
 * @param {object} widget
 * @returns {object | null}
 */
export function getParent(widget) {
  return (widget && typeof widget === 'object' && parents.get(widget)) || null
}
