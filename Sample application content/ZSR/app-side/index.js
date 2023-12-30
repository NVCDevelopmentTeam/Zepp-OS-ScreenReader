// Import gettext function from i18n library
import { gettext } from 'i18n'

// Create an AppSideService object
AppSideService({
  // The onInit function is called when the app is initialized
  onInit() {
    // Print an internationalized language string to the screen
    console.log(gettext('Hello, this is Zepp OS screen reader'))
  },

  // The onRun function is called when the app is run
  onRun() {
    // Send a notification to the wearable device via the sendNotification function
    this.sendNotification({
      title: gettext('Screen reader is running'),
      content: gettext('Please tap the screen to activate the screen reader'),
      vibration: 'short'
    })
  },

  // The onDestroy function is called when the app is destroyed
  onDestroy() {
    // Print an internationalized language string to the screen
    console.log(gettext('Goodbye, this is Zepp OS screen reader'))
  }
})