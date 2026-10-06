import { gettext } from '../../lib/utils/i18n.js'
import { loadSettings } from '../../lib/core/config.js'
import { ZSRPage } from '../../lib/core/zsrPage.js'
import { buildTextPage } from '../../lib/components/textPage.js'

export default ZSRPage({
  onInit() {
    if (!globalThis.ScreenReaderConfig) {
      globalThis.ScreenReaderConfig = loadSettings()
    }
  },
  build() {
    return buildTextPage(
      gettext('Permissions Notice'),
      gettext(
        'ZSR works with the permissions below. You can decline an optional permission: that feature will not work, but the others keep working.\n\nWatch:\n- Device information: to fit your watch model and screen.\n- Local storage: to keep your settings and the offline voice.\n- Vibration and sound: for touch feedback and speech.\n- Bluetooth: to talk to the Zepp app on your phone for speech, settings and voice features.\n- Health data (steps, heart rate, calories, distance, sleep, blood oxygen, stress): only read aloud when you ask for it.\n\nPhone and internet:\nZSR does not read your calls, messages or phone state. Speech is created by the Zepp app on your phone. Voice commands and image reading are optional, need the internet, and send audio or images only to the online service you set up yourself, and only when you use them.\n\nZSR runs as a Zepp OS Mini Program, so it can read only its own screens, not other apps.'
      )
    )
  }
})
