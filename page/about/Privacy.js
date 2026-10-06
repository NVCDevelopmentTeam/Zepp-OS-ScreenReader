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
      gettext('Privacy Policy'),
      gettext(
        'ZSR respects your privacy and does not collect your personal data.\n\nThe text ZSR speaks is turned into speech by the Zepp app on your phone and kept on your watch; it is not sent to ZSR servers. The speech engine is downloaded once from a public package host.\n\nVoice commands and image reading are optional. When you use them, the audio or image is sent through your phone to the online service you configured yourself, and only then.\n\nFull policy: https://zeppreader.com/privacy-policy'
      )
    )
  }
})
