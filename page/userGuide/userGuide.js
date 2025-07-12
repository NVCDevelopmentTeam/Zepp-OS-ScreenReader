import { createWidget, widget } from '@zos/ui'
import ScreenReader from '../../lib/core/screenReader'
import { VibrationManager } from '../../lib/feedback/vibrateFeedback'
import { log } from '@zos/utils'

Page({
  state: {
    initialized: false
  },

  async onInit() {
    try {
      await ScreenReader.speak('Welcome to the User Guide')
      await VibrationManager.feedback('notification')
      this.setState({ initialized: true })
    } catch (error) {
      log.error('Guide initialization failed:', error)
    }
  },

  build() {
    const container = createWidget(widget.GROUP)
    this.createGuideContent(container)
    return container
  },

  createGuideContent(container) {
    const welcomeText = createWidget(widget.TEXT, {
      text: 'Welcome to the User Guide',
      x: 0,
      y: 0,
      w: '100%',
      h: 50
    });

    const detailButton = createWidget(widget.BUTTON, {
      text: 'Go to Detail',
      x: 0,
      y: 60,
      w: '100%',
      h: 50,
      onClick: this.navigateToDetail.bind(this)
    });

    container.appendChild(welcomeText);
    container.appendChild(detailButton);
  },

  navigateToDetail() {
    ScreenReader.speak('Navigating to detail page')
    this.$router.push('userGuideDetail');
  }
})
