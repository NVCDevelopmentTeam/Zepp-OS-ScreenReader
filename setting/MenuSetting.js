// Import the accessibility module
const accessibility = require('@system.accessibility');

// Define the settings page
Page({
  data: {
    // The current values of the menu settings
    menuItems: ['Read', 'Pause', 'Next', 'Previous', 'Settings'],
    menuOrder: 'asc',
    menuActions: {
      'Read': accessibility.read,
      'Pause': accessibility.pause,
      'Next': accessibility.next,
      'Previous': accessibility.previous,
      'Settings': accessibility.settings
    }
  },
  // The function to change the menu items
  changeMenuItems(e) {
    // Get the new value from the list
    let newValue = e.newValue;
    // Update the data
    this.setData({
      menuItems: newValue
    });
    // Call the accessibility API to set the menu items
    accessibility.setMenuItems({
      items: newValue
    });
  },
  // The function to change the menu order
  changeMenuOrder(e) {
    // Get the new value from the picker
    let newValue = e.newValue[0];
    // Update the data
    this.setData({
      menuOrder: newValue
    });
    // Call the accessibility API to set the menu order
    accessibility.setMenuOrder({
      order: newValue
    });
  },
  // The function to change the menu actions
  changeMenuActions(e) {
    // Get the new value from the map
    let newValue = e.newValue;
    // Update the data
    this.setData({
      menuActions: newValue
    });
    // Call the accessibility API to set the menu actions
    accessibility.setMenuActions({
      actions: newValue
    });
  }
});
