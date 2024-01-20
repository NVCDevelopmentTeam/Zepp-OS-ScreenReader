// Import the modules
const ScreenReader = require('@system.screen-reader');
const UI = require('@system.ui');

// Create a slider element for speech rate
const rateSlider = UI.createElement('slider', {
  // Set the initial value to the current speech rate
  value: ScreenReader.getSpeechRate(),
  // Set the minimum and maximum values
  min: 0.5,
  max: 2,
  // Set the event handler for the change event
  onchange: function (e) {
    // Get the new value from the event object
    const newValue = e.value;
    // Set the speech rate to the new value
    ScreenReader.setSpeechRate(newValue);
    // Update the label text
    rateLabel.text = 'Speech rate: ' + newValue.toFixed(1) + 'x';
  }
});

// Create a label element for speech rate
const rateLabel = UI.createElement('label', {
  // Set the initial text to the current speech rate
  text: 'Speech rate: ' + ScreenReader.getSpeechRate().toFixed(1) + 'x',
  // Set the style properties
  fontSize: 24,
  color: '#ffffff',
  textAlign: 'center'
});

// Create a slider element for speech pitch
const pitchSlider = UI.createElement('slider', {
  // Set the initial value to the current speech pitch
  value: ScreenReader.getSpeechPitch(),
  // Set the minimum and maximum values
  min: 0.5,
  max: 2,
  // Set the event handler for the change event
  onchange: function (e) {
    // Get the new value from the event object
    const newValue = e.value;
    // Set the speech pitch to the new value
    ScreenReader.setSpeechPitch(newValue);
    // Update the label text
    pitchLabel.text = 'Speech pitch: ' + newValue.toFixed(1) + 'x';
  }
});

// Create a label element for speech pitch
const pitchLabel = UI.createElement('label', {
  // Set the initial text to the current speech pitch
  text: 'Speech pitch: ' + ScreenReader.getSpeechPitch().toFixed(1) + 'x',
  // Set the style properties
  fontSize: 24,
  color: '#ffffff',
  textAlign: 'center'
});

// Create a page element
const page = UI.createElement('page', {
  // Set the background color
  backgroundColor: '#000000',
  // Add the sliders and the labels as children
  children: [rateSlider, rateLabel, pitchSlider, pitchLabel]
});

// Export the page element
module.exports = page;
