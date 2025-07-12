import { createWidget, widget } from '@zos/ui'
import { settingsManager } from './utils'
import { log } from '@zos/utils'

Page({
  state: {
    selectedVoice: 'Male',
    voices: ['Male', 'Female', 'Child']
  },

  onInit() {
    // You might want to load the initial voice from settings here
    // For now, we'll use a default.
  },

  build() {
    const voiceList = createWidget(widget.SELECT, {
      x: 0,
      y: 0,
      w: '100%',
      h: 200,
      options: this.state.voices.map(voice => ({ text: voice, value: voice })),
      value: this.state.selectedVoice,
      onChange: (value) => this.changeVoice(value)
    });

    const voiceLabel = createWidget(widget.TEXT, {
      x: 0,
      y: 220,
      w: '100%',
      h: 50,
      text: `Voice: ${this.state.selectedVoice}`,
      fontSize: 24,
      color: '#ffffff',
      textAlign: 'center',
      id: 'voiceLabel'
    });

    this.append(voiceList);
    this.append(voiceLabel);
  },

  async changeVoice(value) {
    try {
      const [success] = await settingsManager.handleSettingChange(
        // TODO: Replace with actual API call to set voice
        () => log.log('Setting voice:', value),
        value,
        'voice'
      );
      if (success) {
        this.setState({ selectedVoice: value });
        this.updateLabel(value);
      }
    } catch (error) {
      log.error('Voice change failed:', error);
    }
  },

  updateLabel(value) {
    const labelWidget = this.getElementById('voiceLabel');
    if (labelWidget) {
      labelWidget.setProperty(widget.TEXT, `Voice: ${value}`);
    }
  }
});