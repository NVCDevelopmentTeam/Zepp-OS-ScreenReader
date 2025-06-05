import { SettingsUtils } from './utils'
import { Shortcut } from '@zos/interaction'
import { log } from '@zos/utils'

// Import the accessibility module
const accessibility = require('@system.accessibility');

// Define the settings page
Page({
  data: {
    // The current values of the shortcut settings
    shortcutItems: ['Read', 'Pause', 'Next', 'Previous', 'Settings'],
    shortcutOrder: 'asc',
    shortcutActions: {
      'Read': accessibility.read,
      'Pause': accessibility.pause,
      'Next': accessibility.next,
      'Previous': accessibility.previous,
      'Settings': accessibility.settings
    }
  },
  // The function to change the shortcut items
  async changeShortcutItems(e) {
    try {
      const newValue = e.newValue
      const success = await SettingsUtils.handleSettingChange(
        () => Shortcut.setItems(newValue),
        newValue,
        'shortcutItems'
      )
      if (success) this.setState({ shortcutItems: newValue })
    } catch (error) {
      log.error('Shortcut items update failed:', error)
    }
  },
  // The function to change the shortcut order
  async changeShortcutOrder(e) {
    try {
      const newValue = e.newValue[0]
      if (!SettingsUtils.validateMenuOrder(newValue)) {
        throw new Error('Invalid shortcut order')
      }

      const success = await SettingsUtils.handleSettingChange(
        () => Shortcut.setOrder(newValue),
        newValue,
        'shortcutOrder'
      )
      if (success) this.setState({ shortcutOrder: newValue })
    } catch (error) {
      log.error('Shortcut order change failed:', error)
    }
  },
  // The function to change the shortcut actions
  async changeShortcutActions(e) {
    try {
      const newValue = e.newValue
      if (!this.validateShortcutItems(Object.keys(newValue))) {
        throw new Error('Invalid shortcut actions')
      }

      const success = await SettingsUtils.handleSettingChange(
        () => Shortcut.setActions(newValue),
        newValue,
        'shortcutActions'
      )
      if (success) this.setState({ shortcutActions: newValue })
    } catch (error) {
      log.error('Shortcut actions update failed:', error)
    }
  },
  validateShortcutItems(items) {
    const validActions = Object.keys(this.data.shortcutActions)
    return items.every(item => validActions.includes(item))
  }
});
