import { createWidget, widget } from '@zos/ui';

export default {
  build() {
    createWidget(widget.TEXT, {
      x: 0,
      y: 50,
      w: 480,
      h: 50,
      text: 'Instructions for use',
      text_size: 24,
      align_h: hmUI.align.CENTER_H,
    });

    createWidget(widget.TEXT, {
      x: 20,
      y: 120,
      w: 440,
      h: 300,
      text: 'This is a detailed guide on how to use the Screen Reader application...',
      text_size: 18,
      text_style: hmUI.text_style.WRAP,
    });
  },
};