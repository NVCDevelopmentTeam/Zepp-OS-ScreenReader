import { createWidget, widget } from '@zos/ui';
import { push } from '@zos/router';

export default {
  build() {
    createWidget(widget.TEXT, {
      x: 0,
      y: 100,
      w: 480,
      h: 50,
      text: 'Welcome to Zepp OS Screen Reader',
      text_size: 24,
      align_h: hmUI.align.CENTER_H,
      align_v: hmUI.align.CENTER_V,
    });

    createWidget(widget.BUTTON, {
      x: 140,
      y: 200,
      w: 200,
      h: 50,
      text: 'Go to User Guide',
      click_func: () => {
        push({
          url: 'page/userGuide/index',
        });
      },
    });
  },
};