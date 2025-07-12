import { createWidget, widget } from '@zos/ui'
import { settingsManager } from './utils'
import { Audio } from '@zos/sensor'

Page({
  state: {
    volumeLevel: 50 // Default volume
  },

  onInit() {
    // Initialize volume level from settings or a default
    // For now, just set a default
    this.setState({ volumeLevel: 50 });
  },

  build() {
    createWidget(widget.SLIDER, {
      x: 0,
      y: 0,
      w: '100%',
      h: 80,
      min: 0,
      max: 100,
      value: this.state.volumeLevel,
      onChange: async (value) => {
        const [success] = await settingsManager.handleSettingChange(
          () => Audio.setVolume(Math.round(value)),
          value,
          'volume'
        );
        if (success) {
          this.setState({ volumeLevel: value });
          this.updateLabel(value);
        }
      }
    });

    createWidget(widget.TEXT, {
      x: 0,
      y: 100,
      w: '100%', // Use '100%' for width
      h: 50,
      text: `Volume: ${this.state.volumeLevel}%`,
      fontSize: 24,
      color: '#ffffff',
      textAlign: 'center',
      id: 'volumeLabel' // Add an ID to find it later
    });
  },

  updateLabel(value) {
    const labelWidget = this.getElementById('volumeLabel'); // Use getElementById
    if (labelWidget) {
      labelWidget.setProperty(widget.TEXT, `Volume: ${value}%`);
    }
  }
});
