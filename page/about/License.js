import { createWidget, widget } from '@zos/ui'
import { getDeviceInfo } from '@zos/device'
import { loadSettings } from '../../lib/core/config.js'

const { width, height } = getDeviceInfo()

export default Page({
  onInit() {
    if (!globalThis.ScreenReaderConfig) {
      globalThis.ScreenReaderConfig = loadSettings()
    }
  },
  build() {
    const root = createWidget(widget.GROUP, {
      x: 0,
      y: 0,
      w: width,
      h: height
    })

    root.createWidget(widget.TEXT, {
      x: 0,
      y: 20,
      w: width,
      h: 50,
      text: 'License Agreement',
      color: 0xffffff,
      align_h: 2,
      align_v: 2,
      text_size: 28
    })

    root.createWidget(widget.TEXT, {
      x: 20,
      y: 80,
      w: width - 40,
      h: 800,
      text: 'MIT License\n\nCopyright (c) 2026 NVCDevelopmentTeam\n\nPermission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:\n\nThe above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.',
      color: 0xaaaaaa,
      text_size: 18,
      text_style: widget.TEXT_STYLE_WRAP
    })

    return root
  }
})
