// Import the accessibility module
const accessibility = require('@system.accessibility');

// Define the settings page
Page({
  data: {
    // The current values of the input gesture settings
    swipeAction: 'read',
    tapAction: 'pause',
    doubleTapAction: 'next'
  },
  // The function to change the swipe action
  changeSwipeAction(e) {
    // Get the new value from the picker
    let newValue = e.newValue[0];
    // Update the data
    this.setData({
      swipeAction: newValue
    });
    // Call the accessibility API to set the swipe action
    accessibility.setSwipeAction({
      action: newValue
    });
  },
  // The function to change the tap action
  changeTapAction(e) {
    // Get the new value from the picker
    let newValue = e.newValue[0];
    // Update the data
    this.setData({
      tapAction: newValue
    });
    // Call the accessibility API to set the tap action
    accessibility.setTapAction({
      action: newValue
    });
  },
  // The function to change the double tap action
  changeDoubleTapAction(e) {
    // Get the new value from the picker
    let newValue = e.newValue[0];
    // Update the data
    this.setData({
      doubleTapAction: newValue
    });
    // Call the accessibility API to set the double tap action
    accessibility.setDoubleTapAction({
      action: newValue
    });
  }
});
