// app-side/index.js
import { gettext } from 'i18n'
import { px } from '@zos/device'

AppSideService({
  onInit() {
    console.log(gettext('example'))
  },

  onRun() {
    // Draw a rectangle on the screen
    this.canvas = new Canvas()
    this.canvas.width = px(200)
    this.canvas.height = px(100)
    this.canvas.fillStyle = '#FF0000'
    this.canvas.fillRect(0, 0, this.canvas.width, this.canvas.height)
    this.canvas.show()
  },

  onDestroy() {
    // Clear the canvas
    this.canvas.clear()
  }
})
