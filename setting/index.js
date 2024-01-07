// Import the gettext function for internationalization
import { gettext } from 'i18n'

// Import the widgets for the settings page
import { AppSettingsPage, Switch, Slider, Text } from '@zeppos/widgets'

// Create a settings page with a title and a build function
AppSettingsPage({
  title: gettext('Settings'),
  build() {
    // Create a switch widget to toggle the screen reader on or off
    Switch({
      id: 'screen-reader-switch',
      label: gettext('Screen reader'),
      value: true, // The initial value of the switch
      onChanged: (value) => {
        // The callback function when the switch value changes
        console.log('Screen reader is ' + (value ? 'on' : 'off'))
      }
    })

    // Create a slider widget to adjust the volume of the screen reader
    Slider({
      id: 'volume-slider',
      label: gettext('Volume'),
      value: 50, // The initial value of the slider
      min: 0, // The minimum value of the slider
      max: 100, // The maximum value of the slider
      onChanged: (value) => {
        // The callback function when the slider value changes
        console.log('Volume is ' + value)
      }
    })

    // Create a text widget to display some information
    Text({
      id: 'info-text',
      text: gettext('This is a sample application for Zepp OS Screen reader')
    })
  }
})
