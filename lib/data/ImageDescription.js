import { images } from './images';  // Assuming there's an images file to import from

const imageDescriptions = {
  // Common UI elements
  'btn_back': 'Back button',
  'btn_confirm': 'Confirm button',
  'icon_settings': 'Settings icon',
  'icon_home': 'Home screen icon',
  'icon_notification': 'Notifications icon',
  'icon_battery': 'Battery status indicator',
  'icon_heart': 'Heart rate icon',
  'icon_steps': 'Step counter icon',
};

export function getImageDescription(imageId) {
  return imageDescriptions[imageId] || 'Image description not available';
}

export function addImageDescription(imageId, description) {
  imageDescriptions[imageId] = description;
}

export function removeImageDescription(imageId) {
  delete imageDescriptions[imageId];
}

export function hasImageDescription(imageId) {
  return imageId in imageDescriptions;
}