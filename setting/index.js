import { gettext } from 'i18n'

AppSettingsPage({
  build() {
    // Render the setting screen here
    const screenReaderSetting = document.createElement('div');
    screenReaderSetting.classList.add('setting-item');

    const label = document.createElement('label');
    label.textContent = gettext('Screen Reader');
    label.setAttribute('for', 'screen-reader-toggle');

    const toggleSwitch = document.createElement('input');
    toggleSwitch.setAttribute('id', 'screen-reader-toggle');
    toggleSwitch.setAttribute('type', 'checkbox');
    toggleSwitch.addEventListener('change', this.handleScreenReaderToggle);

    const toggleSwitchLabel = document.createElement('label');
    toggleSwitchLabel.setAttribute('for', 'screen-reader-toggle');

    screenReaderSetting.appendChild(label);
    screenReaderSetting.appendChild(toggleSwitch);
    screenReaderSetting.appendChild(toggleSwitchLabel);

    // Add the setting screen to the page
    const container = document.getElementById('settings-container');
    container.appendChild(screenReaderSetting);
  },

  handleScreenReaderToggle() {
    // Handle the screen reader toggle change here
    const isScreenReaderEnabled = this.checked;

    // Update the screen reader setting accordingly
    // ...
  }
})
