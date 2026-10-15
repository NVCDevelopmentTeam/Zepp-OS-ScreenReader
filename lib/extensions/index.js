/**
 * Every optional ZSR extension in one place. app.js imports this file, so all of them are
 * part of the app and reachable as `globalThis.ZSR.extensions` (for example from a plugin).
 * The context menu, the navigation layer and the reader use the ones they need directly.
 */
import OCR from './OCR.js'
import SpeechMode from './SpeechMode.js'
import CameraAssistant from './cameraAssistant.js'
import CustomLabelManager from './customLabelManager.js'
import * as GamerMode from './gamerMode.js'
import KeyboardController from './keyboard.js'
import QRCode, { prepareQrScan } from './qrCode.js'
import readCaptcha from './readCaptcha.js'
import VirtualKeyboard from './virtualKeyboard.js'
import VirtualScreen from './virtualScreen.js'
import SensorReader from './sensorReader.js'
import { getImageDescription } from './ImageDescription.js'
import { handleExternalKey } from './shortcut.js'
import VibrationController from '../equipment/vibrationController.js'
import DisplayController from '../equipment/displayController.js'
import AccessibilityServer from '../server/server.js'
import { settingsManager } from '../utils/settingsManager.js'
import { CAPABILITIES, FEEDBACK_TYPES, LANGUAGES } from '../utils/constants.js'

const Extensions = {
  OCR,
  SpeechMode,
  CameraAssistant,
  CustomLabelManager,
  GamerMode,
  KeyboardController,
  QRCode,
  prepareQrScan,
  readCaptcha,
  VirtualKeyboard,
  VirtualScreen,
  SensorReader,
  getImageDescription,
  handleExternalKey,
  VibrationController,
  DisplayController,
  AccessibilityServer,
  settingsManager,
  constants: { CAPABILITIES, FEEDBACK_TYPES, LANGUAGES }
}

export default Extensions
