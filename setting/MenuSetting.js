// Import the accessibility module
const accessibility = require('@system.accessibility');
import { createWidget } from '@zos/ui'
import { settingsUtils } from './utils'
import { log } from '@zos/utils'

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
  async changeMenuOrder(e) {
    try {
      const newValue = e.newValue[0]
      if (!settingsUtils.validateMenuOrder(newValue)) {
        throw new Error('Invalid menu order')
      }

      const success = await settingsUtils.handleSettingChange(
        () => this.updateMenuOrder(newValue),
        newValue,
        'menuOrder'
      )

      if (success) {
        this.setData({ menuOrder: newValue })
        await this.registerMenuActions()
      }
    } catch (error) {
      settingsUtils.handleError(error, 'menu_order')
    }
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
  },
  async registerMenuActions() {
    try {
      const { menuActions } = this.data
      const registrationPromises = Object.entries(menuActions).map(
        ([name, action]) => settingsUtils.handleSettingChange(
          () => accessibility.registerMenuAction(name, action),
          action,
          `menuAction_${name}`
        )
      )
      
      await Promise.all(registrationPromises)
    } catch (error) {
      log.error('Menu registration error:', error)
    }
  }
});
