import { createWidget, widget } from '@zos/ui'
import { gettext } from '@zos/i18n'
import { getDeviceInfo } from '@zos/device'
import SensorReader from '../../lib/extensions/sensorReader.js'
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
      y: 40,
      w: width,
      h: 60,
      text: gettext('Sensor Information'),
      color: 0xffffff,
      align_h: 2,
      align_v: 2,
      text_size: 32
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
      }
    ]

    root.createWidget(widget.SCROLL_LIST, {
      x: 0,
      y: 110,
      w: width,
      h: height - 110,
      item_height: 90,
      item_space: 10,
      item_config: [
        {
          type_id: 1,
          item_bg_color: 0x333333,
          item_bg_radius: 15,
          text_view: [
            {
              x: 20,
              y: 0,
              w: width - 40,
              h: 90,
              key: 'text',
              color: 0xffffff,
              text_size: 24,
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
