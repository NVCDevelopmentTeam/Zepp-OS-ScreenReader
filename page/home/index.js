import { gettext } from '@zos/utils';
import { createWidget, widget } from '@zos/ui';
import { Settings } from '@zos/settings';
import { settingsManager } from '../../setting/utils';

Page({
  state: {
    initialized: false
  },

  build() {
    this.createMainUI();
  },

  async createMainUI() {
    try {
      const { capabilities } = await settingsManager.validateDevice();
      
      const container = createWidget(widget.GROUP);
      this.createScreenReaderControls(container, capabilities);

      return container;
    } catch (error) {
      log.error('UI creation failed:', error);
    }
  },

  // ...existing code...
});
