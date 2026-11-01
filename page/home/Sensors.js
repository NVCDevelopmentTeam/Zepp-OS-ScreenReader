import '../../lib/utils/polyfills.js'
import { widget } from '@zos/ui'
import { gettext } from '../../lib/utils/i18n.js'
import { safeDeviceInfo } from '../../lib/utils/deviceInfo.js'
import SensorReader from '../../lib/extensions/sensorReader.js'
import { loadSettings } from '../../lib/core/config.js'

import { ZSRPage } from '../../lib/core/zsrPage.js'
import { createWidget, createChild } from '../../lib/core/zsrWidgets.js'
import { px } from '../../lib/utils/px.js'
const { width, height } = safeDeviceInfo()

export default ZSRPage({
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

    createChild(root, widget.TEXT, {
      x: 0,
      y: px(40),
      w: width,
      h: px(60),
      text: gettext('Sensor Information'),
      color: 0xffffff,
      align_h: 2,
      align_v: 2,
      text_size: px(32)
    })

    const sensorButtons = [
      {
        text: gettext('Read Heart Rate'),
        color: 0xaa0000,
        func: () => SensorReader.readHeartRate(),
        type_id: 1
      },
      {
        text: gettext('Read SpO2'),
        color: 0x0000aa,
        func: () => SensorReader.readSpO2(),
        type_id: 1
      },
      {
        text: gettext('Read Sleep Data'),
        color: 0x5500aa,
        func: () => SensorReader.readSleep(),
        type_id: 1
      },
      {
        text: gettext('Read Steps'),
        color: 0x00aa00,
        func: () => SensorReader.readSteps(),
        type_id: 1
      },
      {
        text: gettext('Read Calories'),
        color: 0xaa5500,
        func: () => SensorReader.readCalories(),
        type_id: 1
      },
      {
        text: gettext('Read Distance'),
        color: 0x0055aa,
        func: () => SensorReader.readDistance(),
        type_id: 1
      },
      {
        text: gettext('Read Stress'),
        color: 0x55aa00,
        func: () => SensorReader.readStress(),
        type_id: 1
      },
      {
        text: gettext('Read Battery'),
        color: 0x777700,
        func: () => SensorReader.readBattery(),
        type_id: 1
      },
      {
        text: gettext('Where am I (GPS)'),
        color: 0x007777,
        func: () => SensorReader.readLocation(),
        type_id: 1
      },
      {
        text: gettext('Read Altitude and Pressure'),
        color: 0x555577,
        func: () => SensorReader.readAltitude(),
        type_id: 1
      },
      {
        text: gettext('Read Compass'),
        color: 0x775555,
        func: () => SensorReader.readCompass(),
        type_id: 1
      }
    ]

    createChild(root, widget.SCROLL_LIST, {
      x: 0,
      y: px(110),
      w: width,
      h: height - px(110),
      item_height: px(90),
      item_space: px(10),
      item_config: [
        {
          type_id: 1,
          item_bg_color: 0x333333,
          item_bg_radius: 15,
          text_view: [
            {
              x: px(20),
              y: 0,
              w: width - px(40),
              h: px(90),
              key: 'text',
              color: 0xffffff,
              text_size: px(24),
              align_h: 1,
              align_v: 2
            }
          ]
        }
      ],
      data_array: sensorButtons,
      data_count: sensorButtons.length,
      item_click_func: (list, index) => {
        sensorButtons[index].func()
      }
    })

    return root
  }
})
