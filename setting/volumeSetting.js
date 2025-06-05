import { createWidget } from '@zos/ui'
import { Slider } from '@zos/components'
import settingsUtils from './utils'

Page({
  build() {
    const slider = createWidget(Slider, {
      x: 0,
      y: 0,
      w: '100%',
      h: 80,
      min: 0,
      max: 100,
      onChange: async (value) => {
        const [success] = await settingsUtils.handleSettingChange(
          () => this.setVolumeLevel(value),
          value,
          'volume'
        );
        if (success) this.updateLabel(value);
      }
    });

    const label = createWidget(widget.LABEL, {
      x: 0,
      y: 100,
      w: 480,
      h: 50,
      text: 'Volume: ' + hmSetting.getVolumeLevel() + '%',
      fontSize: 24,
      color: '#ffffff',
      textAlign: 'center'
    });

    this.append(slider);
    this.append(label);
  },

  setVolumeLevel(value) {
    return hmSetting.setVolumeLevel(Math.round(value));
  },

  updateLabel(value) {
    const label = this.findWidgetById('volumeLabel');
    if (label) {
      label.setProperty(hmUI.prop.TEXT, `Volume: ${value}%`);
    }
  }
});
