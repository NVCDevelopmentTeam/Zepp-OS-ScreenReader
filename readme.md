# Zepp OS Screen Reader

## Overview

The Zepp OS Screen Reader is a specialized application designed for devices operating on Zepp OS, aimed at assisting blind and low-vision users. This screen reader provides essential functionalities such as text-to-speech output, braille support, navigation commands, and interaction with applications and settings, ensuring an inclusive user experience.

## Key Features

- **Text-to-Speech Output:** Converts text into spoken words.
- **Braille Support:** Facilitates braille display compatibility.
- **Navigation Commands:** Enables intuitive navigation.
- **Application Interaction:** Seamlessly interacts with apps and device settings.

## Supported Devices

The following Amazfit watch models are currently compatible with Zepp OS Screen Reader:

- Amazfit GTS 3
- Amazfit GTR 3
- Amazfit GTR 3 Pro
- Amazfit GTS 4 Mini
- Amazfit T-Rex 2
- Amazfit Falcon
- Amazfit Balance
- Amazfit Bip 5

*Note: The list of supported devices is subject to updates. Please refer to the [official Amazfit website](https://www.zepp.com) for the latest information.*

## Recommended Zepp OS Version

For optimal performance, we recommend using Zepp OS 3.5 or higher. These versions incorporate OpenAI's GPT-4o technology and Zepp Flow™, offering advanced text-to-speech capabilities for a smoother and more natural user experience. [Learn more](https://www.zepp.com/press-release/zepp-health-introduces-zepp-os-4-redefining-wearable-intelligence-by-integrating-openais-gpt-4o-into-its-amazfit-smartwatches?utm_source=chatgpt.com)

*Note: On lower versions of Zepp OS, the application will use eSpeak TTS, which may not provide the same voice quality as OpenAI TTS.*

## Checking Zepp OS Version

To ensure compatibility, you can check the Zepp OS version on your Amazfit watch:

### On the Watch:
1. Press the button to open the app menu.
2. Select "Settings."
3. Scroll down and select "System."
4. Choose "About" or "Device Information."
5. Look for "Software Version" or "Zepp OS Version."

### On the Zepp App:
1. Connect your watch to your phone and open the Zepp app.
2. Go to "Profile" > [Your Device Name].
3. Select "System Update" to view the current Zepp OS version.

*Note: Before purchasing, refer to the specifications on the official Amazfit website or consult the retailer to confirm the Zepp OS version.*

## Getting Started

### Running the Application

Clone the repository to your local machine and navigate to the project root directory. Start the preview compilation with the following command:

```bash
zeus dev
```

### Interaction Shortcuts
- **Spacebar:** Reads the current item.
- **Tab:** Move to the next item.
- **Shift + Tab:** Move to the previous item.
- **Enter:** Selects the current item.

### Building the Application

To build the application, run:

```bash
zeus build
```

This will generate a `.zab` file in the `dist` folder, ready for installation on your Zepp OS device.

## Installation

Install the app on your device using the following steps:

1. Connect your watch to your phone and open the Zepp app.
2. Navigate to "Profile" > [Your Device Name] > "App Store."
3. Select the Zepp OS Screen Reader application.
4. Click "Install" to install the app on your device.

## Enabling the Screen Reader

After installation, enable the screen reader by:

1. Going to "Settings" > "Accessibility" > "Zepp OS Screen Reader" on your watch.
2. Toggling the switch to the "On" position.

## Conclusion

The Zepp OS Screen Reader is an invaluable tool for blind and low-vision users, enhancing their ability to independently operate Zepp OS devices. For the best experience, we recommend using devices running Zepp OS 3.5 or higher to benefit from the superior voice quality powered by OpenAI's GPT-4o technology.