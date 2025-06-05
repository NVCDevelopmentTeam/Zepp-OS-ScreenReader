import { createWidget, widget } from '@zos/ui'
import { ScreenReader } from '../../lib/core/screenReader'

Page({
  state: {
    ready: false
  },

  async onInit() {
    await ScreenReader.speak('Welcome to Zepp OS Screen Reader')
    this.setState({ ready: true })
  },

  build() {
    return createWidget(widget.GROUP, {
      children: [
        this.createWelcomeText(),
        this.createGuideButton()
      ]
    })
  },

  createWelcomeText() {
    return createWidget(widget.TEXT, {
      text: 'Welcome to Zepp OS Screen Reader'
    })
  },

  createGuideButton() {
    return createWidget(widget.BUTTON, {
      text: 'Go to User Guide',
      onClick: this.onNavigateToUserGuide
    })
  },

  onNavigateToUserGuide() {
    this.$router.push('userGuide');
  }
});
