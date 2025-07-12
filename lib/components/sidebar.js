import { createWidget, widget } from '@zos/ui'
import { DEVICE_WIDTH, DEVICE_HEIGHT } from '@zos/utils'
import ScreenReader from '../core/screenReader'
import { GestureManager } from '../interaction/gestureManager'

class Sidebar {
  constructor() {
    this.isOpen = false;
    this.widget = null;
  }

  create() {
    this.widget = createWidget(widget.GROUP, {
      x: -DEVICE_WIDTH,
      y: 0,
      w: DEVICE_WIDTH,
      h: DEVICE_HEIGHT,
      visible: false
    });

    GestureManager.register('swipeRight', () => this.toggle());

    return this.widget;
  }

  toggle() {
    this.isOpen = !this.isOpen;
    this.widget.setProperty(widget.PROPERTIES.X, this.isOpen ? 0 : -DEVICE_WIDTH);
    this.widget.setProperty(widget.PROPERTIES.VISIBLE, this.isOpen);
    ScreenReader.speak(this.isOpen ? 'Sidebar opened' : 'Sidebar closed');
  }
}

export default new Sidebar();