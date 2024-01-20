// Import the modules
const ScreenReader = require('@system.screen-reader');
const UI = require('@system.ui');

// Create a slider element
const slider = UI.createElement('slider', {
  // Set the initial value to the current volume
  value: ScreenReader.getVolume(),
  // Set the minimum and maximum values
  min: 0,
  max: 100,
  // Set the event handler for the change event
  onchange: function (e) {
    // Get the new value from the event object
    const newValue = e.value;
    // Set the volume to the new value
    ScreenReader.setVolume(newValue);
    // Update the label text
    label.text = 'Volume: ' + newValue + '%';
  }
});

// Create a label element
const label = UI.createElement('label', {
  // Set the initial text to the current volume
  text: 'Volume: ' + ScreenReader.getVolume() + '%',
  // Set the style properties
  fontSize: 24,
  color: '#ffffff',
  textAlign: 'center'
});

// Create a page element
const page = UI.createElement('page', {
  // Set the background color
  backgroundColor: '#000000',
  // Add the slider and the label as children
  children: [slider, label]
});

// Export the page element
module.exports = page;
