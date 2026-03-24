const imageDescriptions = {
  // Common UI elements
  btn_back: 'Back button',
  btn_confirm: 'Confirm button',
  btn_cancel: 'Cancel button',
  btn_delete: 'Delete button',
  btn_add: 'Add button',
  btn_edit: 'Edit button',
  btn_save: 'Save button',
  btn_share: 'Share button',
  btn_search: 'Search button',
  btn_more: 'More options button',

  // Icons
  icon_settings: 'Settings icon',
  icon_home: 'Home screen icon',
  icon_notification: 'Notifications icon',
  icon_battery: 'Battery status indicator',
  icon_heart: 'Heart rate icon',
  icon_steps: 'Step counter icon',
  icon_calories: 'Calories icon',
  icon_distance: 'Distance icon',
  icon_sleep: 'Sleep tracking icon',
  icon_stress: 'Stress monitoring icon',
  icon_spo2: 'Blood oxygen icon',
  icon_bluetooth: 'Bluetooth status icon',
  icon_wifi: 'Wifi status icon',
  icon_alarm: 'Alarm icon',
  icon_timer: 'Timer icon',
  icon_weather: 'Weather icon'
}

export function getImageDescription(imageId) {
  return imageDescriptions[imageId] || 'Image description not available'
}

export function addImageDescription(imageId, description) {
  imageDescriptions[imageId] = description
}

export function removeImageDescription(imageId) {
  delete imageDescriptions[imageId]
}

export function hasImageDescription(imageId) {
  return imageId in imageDescriptions
}
