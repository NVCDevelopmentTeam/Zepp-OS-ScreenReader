import { createWidget, widget } from '@zos/ui'
import ScreenReader from '../lib/core/screenReader'
import { logger } from '../lib/utils/logger'

Page({
  state: {
    loading: true,
    error: null
  },

  async onInit() {
    try {
      await ScreenReader.init()
      this.$router.replace({
        url: 'page/home/Welcome',
        params: { initialized: true }
      })
    } catch (error) {
      this.setState({
        loading: false,
        error: error.message
      })
      logger.error('Initialization failed:', error)
      this.showError(error)
    }
  },

  build() {
    const style = {
      x: 0,
      y: 0,
      w: '100%',
      h: '100%'
    }
    return createWidget(widget.GROUP, style)
  },

  showError(error) {
    const errorText = createWidget(widget.TEXT, {
      text: `Error: ${error.message}`,
      color: 0xff0000
    })
    this.append(errorText)
  }
})
