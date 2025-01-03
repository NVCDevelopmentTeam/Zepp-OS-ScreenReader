# Zepp OS Screen Reader

## Introduction

Zepp OS Screen Reader is a screen reader developed specifically for devices running Zepp OS. It enables blind and low-vision users to operate their devices without relying on visual cues. Key features include:

- Text-to-speech output
- Braille support
- Navigation commands
- Interaction with applications and settings

## Supported Watch Models

Currently, Zepp OS Screen Reader supports the following Amazfit watch models:

- Amazfit GTS 3
- Amazfit GTR 3
- Amazfit GTR 3 Pro
- Amazfit GTS 4 Mini
- Amazfit T-Rex 2
- Amazfit Falcon
- Amazfit Balance
- Amazfit Bip 5

*Note: This list may be updated. Please refer to the official Amazfit website for the latest information.*

## Recommended Zepp OS Version

To ensure the best experience with Zepp OS Screen Reader, we recommend using watch models running Zepp OS 3.5 or higher. These newer versions integrate OpenAI's GPT-4o technology and Zepp Flow™, providing advanced text-to-speech (TTS) capabilities for a smoother and more natural user experience. [Source](https://www.zepp.com/press-release/zepp-health-introduces-zepp-os-4-redefining-wearable-intelligence-by-integrating-openais-gpt-4o-into-its-amazfit-smartwatches?utm_source=chatgpt.com)

*Note: On lower versions of Zepp OS, the application will use eSpeak TTS, which may not offer the same voice quality as OpenAI TTS.*

## How to Check Zepp OS Version Before Purchase

To ensure your Amazfit watch is compatible with Zepp OS Screen Reader, you can check the Zepp OS version as follows:

1. **On the Watch:**
   - Press the button to open the app menu.
   - Select "Settings."
   - Scroll down and select "System."
   - Choose "About" or "Device Information."
   - Look for "Software Version" or "Zepp OS Version."

2. **On the Zepp App:**
   - Connect your watch to your phone and open the Zepp app.
   - Go to "Profile" > [Your Device Name].
   - Select "System Update" to view the current Zepp OS version.

*Note: Before purchasing, refer to the specifications on the official Amazfit website or consult the retailer to confirm the Zepp OS version of the watch model.*

## How to Run

To get started, clone the repository to your local machine and navigate to the project root directory. Then, start the preview compilation by running the following command:

```bash
zeus dev
```

Once the preview is running, you can interact with the screen reader using the following keyboard shortcuts:

- Spacebar - Reads the current item
- Tab - Move to the next item
- Shift + Tab - Move to the previous item
- Enter - Selects the current item

## How to Build

To build the application, run the following command:

```bash
zeus build
```

This will create a `.zab` file in the `dist` folder, which you can install on your Zepp OS device.

## How to Install

To install the app on your device:

1. Connect your watch to your phone and open the Zepp app.
2. Go to "Profile" > [Your Device Name] > "App Store."
3. Select the Zepp OS Screen Reader application.
4. Click the "Install" button to install the app on your device.

## How to Enable Screen Reader

After installation, you can enable the screen reader by:

1. On the watch, go to "Settings" > "Accessibility" > "Zepp OS Screen Reader."
2. Toggle the switch to the "On" position.

## Conclusion

Zepp OS Screen Reader is a powerful tool that assists blind and low-vision users in independently operating their Zepp OS devices. For the optimal experience, we recommend using devices running Zepp OS 3.5 or higher to leverage the superior voice quality provided by OpenAI's GPT-4o technology.

```
