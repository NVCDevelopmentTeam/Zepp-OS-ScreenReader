// Import the modules
const ScreenReader = require('@system.screen-reader');
const UI = require('@system.ui');

// Create an array of voice options
const voices = ['Male', 'Female', 'Child'];

// Create a list element
const list = UI.createElement('list', {
  // Set the data source to the voices array
  data: voices,
  // Set the event handler for the select event
  onselect: function (e) {
    // Get the selected index from the event object
    const selectedIndex = e.index;
    // Set the voice to the selected option
    ScreenReader.setVoice(voices[selectedIndex]);
    // Update the label text
    label.text = 'Voice: ' + voices[selectedIndex];
  }
});

// Create a label element
const label = UI.createElement('label', {
  // Set the initial text to the current voice
  text: 'Voice: ' + ScreenReader.getVoice(),
  // Set the style properties
  fontSize: 24,
  color: '#ffffff',
  textAlign: 'center'
});

// Create a page element
const page = UI.createElement('page', {
  // Set the background color
  backgroundColor: '#000000',
  // Add the list and the label as children
  children: [list, label]
});

// Export the page element
module.exports = page;
