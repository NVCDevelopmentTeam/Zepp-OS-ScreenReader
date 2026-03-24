import { createWidget, widget } from '@zos/ui'
import { getDeviceInfo } from '@zos/device'
import { push } from '@zos/router'

const { width, height } = getDeviceInfo()

Page({
  onInit() {
    this.state = {
      items: [
        { name: 'Introduction', url: 'page/about/Introduction' },
        { name: 'App Information', url: 'page/about/AppInfo' },
        { name: "What's New", url: 'page/about/WhatsNew' },
        { name: 'Privacy Policy', url: 'page/about/Privacy' },
        { name: 'Terms of Service', url: 'page/about/Terms' },
        { name: 'Copyright Notice', url: 'page/about/Copyright' },
        { name: 'Accessibility', url: 'page/about/AccessibilityStatement' },
        { name: 'Contact & Feedback', url: 'page/about/Contact' },
        { name: 'License', url: 'page/about/License' }
      ]
    }
  },

  build() {
    createWidget(widget.TEXT, {
      x: 0,
      y: 10,
      w: width,
      h: 50,
      text: 'About ZSR',
      color: 0xffffff,
      align_h: 2,
      align_v: 2,
      text_size: 28
    })

    createWidget(widget.SCROLL_LIST, {
      x: 0,
      y: 70,
      w: width,
      h: height - 70,
      item_height: 80,
      item_space: 10,
      item_config: [
        {
          type_id: 1,
          item_bg_color: 0x333333,
          item_bg_radius: 10,
          text_view: [
            {
              x: 20,
              y: 0,
              w: width - 40,
              h: 80,
              key: 'name',
              color: 0xffffff,
              text_size: 24,
              align_h: 1,
              align_v: 2
            }
          ]
        }
      ],
      data_array: this.state.items,
      data_count: this.state.items.length,
      item_click_func: (list, index) => {
        const item = this.state.items[index]
        push({ url: item.url })
      }
    })
  }
})
