import { gettext } from 'i18n';
import { Button } from '@zos/button';
import { Slider } from '@zos/slider';
import { StatusBar } from '@zos/status-bar';
import { Settings } from '@zos/settings';
import { Page } from '@zeppos/zml';

// Define the build function for the main page
const MainPage = {
  build() {
    console.log(gettext('example'));

    // Create a Button object
    const button = new Button();
    button.text = gettext('Screen reader');
    button.backgroundColor = 'blue';
    button.textColor = 'white';
    button.center();

    // Create a Slider object
    const slider = new Slider();
    slider.min = 0.5;
    slider.max = 2;
    slider.value = 1;
    slider.below(button);

    // Create a StatusBar object
    const statusBar = new StatusBar();
    statusBar.backgroundColor = 'black';
    statusBar.textColor = 'white';
    statusBar.top();

    // Create a Settings object
    const settings = new Settings();
    settings.topRight();

    // Register button tap event
    button.on('tap', () => {
      settings.toggleScreenReader();
    });

    // Register slider value change event
    slider.on('change', (value) => {
      settings.setScreenReaderSpeed(value);
    });
  }
};

// Define pages for the router
const pages = {
  userGuide: userGuidePage,
  welcome: welcomePage
};

// Initialize the Page with router configuration
Page({
  onInit() {
    // Register pages
    for (let page in pages) {
      this.$router.registerPage(page, pages[page]);
    }
    // Navigate to the welcome page on startup
    this.$router.push('welcome');
  }
});
