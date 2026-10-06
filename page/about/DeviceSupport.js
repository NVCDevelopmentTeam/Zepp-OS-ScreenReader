import { gettext } from '../../lib/utils/i18n.js'
import { loadSettings } from '../../lib/core/config.js'
import { describeSupport } from '../../lib/utils/featureSupport.js'
import { ZSRPage } from '../../lib/core/zsrPage.js'
import { buildTextPage } from '../../lib/components/textPage.js'

export default ZSRPage({
  onInit() {
    if (!globalThis.ScreenReaderConfig) {
      globalThis.ScreenReaderConfig = loadSettings()
    }
  },
  build() {
    return buildTextPage(gettext('Device Support'), describeSupport())
  }
})
