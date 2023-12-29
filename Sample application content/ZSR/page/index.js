// Import gettext function from i18n library
import { gettext } from 'i18n';

// Create a page for the application
Page({
  build() {
    // Print out an example message
    console.log(gettext('example'));

    // Create a div element for the home screen
    const homeScreen = document.createElement('div');

    // Use template literals to create HTML content for the home screen
    homeScreen.innerHTML = `
      <h1>${gettext('Welcome to the Screen Reader')}</h1>
      <p>${gettext('This is the main home screen of the Screen Reader app.')}</p>
      <p>${gettext('Use the navigation buttons to browse through different sections.')}</p>
      <button id="start-button">${gettext('Start Reading')}</button>
    `;

    // Add a click event for the start button
    const startButton = document.getElementById('start-button');
    startButton.addEventListener('click', startReading);

    // Add the main screen to the body of the document
    document.body.appendChild(homeScreen);
  }
});

// Create a SecondaryWidget for the application
const widget = new SecondaryWidget({
  id: 'screen-reader-switch',
  title: gettext('Zepp OS Screen reader'),
  icon: 'screen-reader-icon.png'
});

// Create a Switch widget
const switch = new Switch({
  id: 'switch',
  checked: false, // Initially the switch will be off
  color: '#FFFFFF', // Switch color when turned off
  backgroundColor: '#888888' // Background color of the switch when turned off
});

// Add a click event to the switch
switch.addEventListener('click', function() {
  // Check the status of the switch
  if (switch.checked) {
    // If the switch is on, turn it off
    switch.checked = false;
    switch.color = '#FFFFFF';
    switch.backgroundColor = '#888888';
    // Turn off Zepp OS Screen reader
    screenReader.stop();
  } else {
    // If the switch is off, turn it on
    switch.checked = true;
    switch.color = '#000000';
    switch.backgroundColor = '#00FFFF'; // Blue
    // Turn on Zepp OS Screen reader
    screenReader.start();
  }
});

// Add switch to widget
widget.appendChild(switch);

// Display widgets
widget.show();

// Function to start reading screen content
function startReading() {
  // Get the current screen content
  const screenContent = document.body.textContent;

  // Use Zepp OS speak function to read screen content
  Zepp.speak(screenContent);
}