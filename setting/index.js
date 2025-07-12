import { gettext } from '@zos/utils'
import { createWidget, widget } from '@zos/ui'
import { Settings } from '@zos/settings'
import { settingsManager } from './utils'
import { log } from '@zos/utils'

const SETTINGS_CONFIG = {
  volume: { path: 'volumeSetting', requires: ['audio'] },
  keyboard: { path: 'KeyboardSetting', requires: ['keyboard'] },
  speech: { path: 'SpeechSetting', requires: ['speech'] },
  display: { path: 'DisplaySetting', requires: ['display'] }
};

Page({
  state: {
    initialized: false,
    error: null,
    widgets: new Map()
  },
  async onInit() {
    try {
      const { success, capabilities } = await settingsManager.deviceManager.validate();
      if (!success) {
        throw new Error('Device validation failed');
      }
      await this.registerSettings(capabilities);
      await this.createWidgets();
      this.setState({ initialized: true });
    } catch (error) {
      this.setState({ error: error.message });
    }
  },
  build() {
    this.initialize();
  },
  async initialize() {
    try {
      const { success } = await settingsManager.validateDevice();
      if (!success) throw new Error('Device not supported');
      await this.createWidgets();
      this.setState({ initialized: true });
    } catch (error) {
      this.setState({ error: error.message });
    }
  },
  async registerSettings(capabilities) {
    Object.entries(SETTINGS_CONFIG).forEach(([key, config]) => {
      if (config.requires.every(cap => capabilities[cap])) {
        Settings.register(key, { ...config, deviceSupported: true });
      }
    });
  },
  async createWidgets() {
    try {
      const container = await this.createContainer();
      await this.createControls(container);
      return container;
    } catch (error) {
      log.error('Widget creation failed:', error);
      return null;
    }
  },
  async createContainer() {
    return createWidget(widget.GROUP, {
      x: 0,
      y: 0,
      w: '100%',
      h: '100%'
    });
  },
  createControls(container) {
    this.createToggle(container);
    this.createVolumeControl(container);
  },
  createToggle(parent) {
    const toggle = createWidget(widget.SWITCH, {
      x: 0,
      y: 0,
      w: '100%',
      h: 48,
      label: gettext('Screen Reader'),
      checked: false,
      onChange: (value) => this.handleToggle(value)
    });
    parent.appendChild(toggle);
    this.state.widgets.set('toggle', toggle);
  },
  createVolumeControl(parent) {
    const slider = createWidget(widget.SLIDER, {
      x: 0,
      y: 56,
      w: '100%',
      h: 48,
      min: 0,
      max: 100,
      value: 50,
      onChange: (value) => this.handleVolume(value)
    });
    parent.appendChild(slider);
    this.state.widgets.set('volume', slider);
  },
  handleToggle(enabled) {
    settingsManager.handleSettingChange(
      () => Settings.setScreenReaderEnabled(enabled),
      enabled,
      'screenReader'
    );
  },
  handleVolume(value) {
    settingsManager.handleSettingChange(
      () => Settings.setVolume(value),
      value,
      'volume'
    );
  }
});
