// Create an application service to run the screen reader
import { AppService } from '@zos/app-service';
import { Screen } from '@zos/sensor';
import { Notification } from '@zos/notification';

const appService = new AppService();
const screen = new Screen();
const notification = new Notification();

// Register a callback function to listen for screen display change events
const callback = () => {
  // Get the current screen display state
  const status = screen.getStatus();
  // If the screen is on, send a system notification with the screen reader text
  if (status === 1) {
    notification.send({
      title: 'Screen reader',
      content: 'The screen is displaying the following content: ...', // Replace ... with the actual content of the screen
      buttons: [
        {
          text: 'Off',
          action: () => {
            // Turn off screen reader
            appService.stop();
          }
        }
      ]
    });
  }
};

screen.on(callback);

// Start running the screen reader
appService.start();