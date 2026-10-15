/**
 * Small helpers over the official Settings App components.
 *
 * Every Settings App component has the shape `(props, children?)`. The official
 * set is Auth, Button, Image, Link, Modal, Section, Select, Slider, Text,
 * TextImageRow, TextInput, Toast, Toggle and View. There is no `Row`
 * component, so rows are built from `View` here.
 */

/** Horizontal row: label on the left, control on the right. */
const ROW_STYLE = {
  display: 'flex',
  flexDirection: 'row',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '6px 0'
}

/**
 * @param {any[]} children components shown side by side
 */
export function Row(children) {
  return View({ style: ROW_STYLE }, children)
}

/**
 * `Select` whose options may be written as `{ label, value }`. The settings
 * component shows the `name` of each option, so both keys are always set.
 * @param {{ options?: { label?: string, name?: string, value: any }[] } & Record<string, any>} props
 */
export function SelectField(props) {
  const options = (props.options || []).map((option) => {
    const name = option.name !== undefined ? option.name : option.label
    return { name, label: name, value: option.value }
  })
  return Select({ ...props, options })
}
