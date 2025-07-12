import { accessibility } from '@zos/accessibility'
import { settingsManager } from './utils'
import { log } from '@zos/utils'

// Define the settings page
Page({
  state: {
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
    this.setState({
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
      if (!settingsManager.validateMenuOrder(newValue)) {
        throw new Error('Invalid menu order')
      }

      const success = await settingsManager.handleSettingChange(
        () => this.updateMenuOrder(newValue),
        newValue,
        'menuOrder'
      )

      if (success) {
        this.setState({ menuOrder: newValue })
        await this.registerMenuActions()
      }
    } catch (error) {
      settingsManager.handleError(error, 'menu_order')
    }
  },
  // Placeholder for updateMenuOrder
  updateMenuOrder(newValue) {
    log.log('Updating menu order:', newValue)
    // Actual implementation for updating menu order would go here
  },
  // The function to change the menu actions
  changeMenuActions(e) {
    // Get the new value from the map
    let newValue = e.newValue;
    // Update the data
    this.setState({
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
        ([name, action]) => settingsManager.handleSettingChange(
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
