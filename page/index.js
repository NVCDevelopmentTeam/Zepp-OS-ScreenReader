import { gettext } from 'i18n'
import { Button } from '@zos/button'
import { Slider } from '@zos/slider'
import { StatusBar } from '@zos/status-bar'
import { Settings } from '@zos/settings'

Page({
  build() {
    console.log(gettext('example'))
    // Create a Button object
    const button = new Button()
    // Set button text to 'Screen reader'
    button.text = gettext('Screen reader')
    // Set the button's background color to blue
    button.backgroundColor = 'blue'
    // Set the button's text color to white
    button.textColor = 'white'
    // Set the button's position to the center of the screen
    button.center()
    // Create a Slider object
    const slider = new Slider()
    // Set the minimum value of the slider to 0.5
    slider.min = 0.5
    // Set the maximum value of the slider to 2
    slider.max = 2
    // Set the default value of the slider to 1
    slider.value = 1
    // Set the position of the slider below the button
    slider.below(button)
    // Create a StatusBar object
    const statusBar = new StatusBar()
    // Set the background color of the status bar to black
    statusBar.backgroundColor = 'black'
    // Set the status bar text color to white
    statusBar.textColor = 'white'
    // Set the position of the status bar at the top of the screen
    statusBar.top()
    // Create a Settings object
    const settings = new Settings()
    // Set the location of the setting to the top right corner of the screen
    settings.topRight()
    // Register for button click event
    button.on('tap', () => {
      // Enable/disable screen reader function
      settings.toggleScreenReader()
    })
    // Register for the slider value change event
    slider.on('change', (value) => {
      // Adjust reading speed according to the value of the slider
      settings.setScreenReaderSpeed(value)
    })
  }
})