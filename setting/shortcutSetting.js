import { settingsManager } from './utils'
import { Shortcut } from '@zos/interaction'
import { log } from '@zos/utils'
import { accessibility } from '@zos/accessibility'

// Define the settings page
Page({
  state: {
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
      const success = await settingsManager.handleSettingChange(
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
      if (!settingsManager.validateMenuOrder(newValue)) {
        throw new Error('Invalid shortcut order')
      }

      const success = await settingsManager.handleSettingChange(
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

      const success = await settingsManager.handleSettingChange(
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
    const validActions = Object.keys(this.state.shortcutActions)
    return items.every(item => validActions.includes(item))
  }
});
