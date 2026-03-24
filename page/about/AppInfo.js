import { createWidget, widget, showToast } from '@zos/ui'
import { gettext } from '@zos/i18n'
import { getDeviceInfo } from '@zos/device'
import { push } from '@zos/router'
import { saveSettings, loadSettings } from '../../lib/core/config.js'

const { width, height } = getDeviceInfo()

export default Page({
  onInit() {
    this.tapCount = 0
    this.lastTapTime = 0
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
      text: gettext('App Information'),
      color: 0xffffff,
      align_h: 2,
      align_v: 2,
      text_size: 28
    })

    const info = [
      `${gettext('Name')}: Zepp OS Screen Reader`,
      `${gettext('Version')}: 1.0.1`,
      `${gettext('Build Date')}: 2026-03-08`,
      `${gettext('Developer')}: NVCDevelopmentTeam`
    ]

    const infoWidget = root.createWidget(widget.TEXT, {
      x: 20,
      y: 80,
      w: width - 40,
      h: 120,
      text: info.join('\n'),
      color: 0xaaaaaa,
      text_size: 18,
      text_style: widget.TEXT_STYLE_WRAP,
      align_h: 2
    })

    // Unlock developer options with 5 taps
    infoWidget.addEventListener(widget.event.CLICK, () => {
      const now = Date.now()
      if (now - this.lastTapTime < 500) {
        this.tapCount++
      } else {
        this.tapCount = 1
      }
      this.lastTapTime = now

      if (this.tapCount === 5) {
        const config = globalThis.ScreenReaderConfig || {}
        config.devMode = true
        saveSettings(config)
        showToast({ content: gettext('Developer options unlocked!') })
      } else if (this.tapCount > 0 && this.tapCount < 5) {
        showToast({
          content: `${gettext('Tap')} ${5 - this.tapCount} ${gettext('more times to unlock.')}`
        })
      }
    })

    const links = [
      { name: 'Introduction', url: 'page/about/Introduction', type_id: 1 },
      { name: "What's New", url: 'page/about/WhatsNew', type_id: 1 },
      { name: 'License Agreement', url: 'page/about/License', type_id: 1 },
      { name: 'Copyright Notice', url: 'page/about/Copyright', type_id: 1 },
      { name: 'Privacy Policy', url: 'page/about/Privacy', type_id: 1 },
      { name: 'Terms of Service', url: 'page/about/Terms', type_id: 1 },
      { name: 'Accessibility Statement', url: 'page/about/AccessibilityStatement', type_id: 1 },
      { name: 'Contact & Feedback', url: 'page/about/Contact', type_id: 1 },
      { name: 'Official Website', link: 'https://zeppreader.com', type_id: 1 },
      {
        name: 'GitHub Source',
        link: 'https://github.com/NVCDevelopmentTeam/Zepp-OS-ScreenReader.git',
        type_id: 1
      }
    ]

    root.createWidget(widget.SCROLL_LIST, {
      x: 20,
      y: 210,
      w: width - 40,
      h: height - 210,
      item_height: 60,
      item_space: 5,
      item_config: [
        {
          type_id: 1,
          item_bg_color: 0x222222,
          item_bg_radius: 10,
          text_view: [
            {
              x: 15,
              y: 0,
              w: width - 70,
              h: 60,
              key: 'name',
              color: 0xffffff,
              text_size: 20,
              align_h: 1,
              align_v: 2
            }
          ]
        }
      ],
      data_array: links,
      data_count: links.length,
      item_click_func: (list, index) => {
        const item = links[index]
        if (item.url) {
          push({ url: item.url })
        } else if (item.link) {
          // Zepp OS doesn't have a direct browser open, but we can announce it
          // In some versions, you can use specialized APIs or just show a QR
          showToast({ content: `Visit: ${item.link}` })
        }
      }
    })

    return root
  }
})
