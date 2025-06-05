import { createWidget, widget } from '@zos/ui'
import { ScreenReader } from '../../lib/core/screenReader'
import { VibrationManager } from '../../lib/feedback/vibrate feedback'

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
    const element = (
      <div>
        <text>Welcome to the User Guide</text>
        <button onClick={this.navigateToDetail.bind(this)}>Go to Detail</button>
      </div>
    );
    container.appendChild(element)
  },

  navigateToDetail() {
    ScreenReader.speak('Navigating to detail page')
    window.location.href = "userGuideDetail"; // Redirect to userGuideDetail route
  }
})
