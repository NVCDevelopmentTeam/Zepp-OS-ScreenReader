import { prop } from '@zos/ui'
import { gettext, format } from '../../lib/utils/i18n.js'
import { loadSettings } from '../../lib/core/config.js'
import ScreenReader from '../../lib/core/readerProxy.js'
import { ZSRPage } from '../../lib/core/zsrPage.js'
import { getGuideSections, buildGuideLayout } from './userGuide.layout.js'

let currentPage = 0
/** @type {{title: string, content: string}[]} */
let sections = []
/** @type {any} */
let titleWidget = null
/** @type {any} */
let contentWidget = null

function navigate(dir) {
  const next = Math.min(Math.max(currentPage + dir, 0), sections.length - 1)
  if (next === currentPage) return

  currentPage = next
  const section = sections[next]
  try {
    if (titleWidget) titleWidget.setProperty(prop.TEXT, section.title)
    if (contentWidget) contentWidget.setProperty(prop.TEXT, section.content)
  } catch (_e) {
    /* speech below still delivers the content */
  }
  ScreenReader.speak(format(gettext('{0}. {1}'), section.title, section.content), {
    priority: 'high'
  })
}

function togglePractice() {
  const config = globalThis.ScreenReaderConfig || {}
  config.gesturePracticeMode = !config.gesturePracticeMode
  ScreenReader.speak(
    config.gesturePracticeMode
      ? gettext(
          'Gesture practice mode on. Try any gesture - ZSR will tell you what it detected instead of performing it.'
        )
      : gettext('Gesture practice mode off. Gestures will now perform their normal actions again.'),
    { priority: 'high', force: true }
  )
}

export default ZSRPage({
  onInit() {
    globalThis.ScreenReaderConfig = loadSettings()
    currentPage = 0
    sections = getGuideSections()

    ScreenReader.speak(
      format(
        gettext('User Guide. Section {0} of {1}: {2}. Use the Next button for the next section.'),
        1,
        sections.length,
        sections[0].title
      ),
      { priority: 'high' }
    )
  },

  build() {
    const layout = buildGuideLayout({
      first: sections[0],
      onPrevious: () => navigate(-1),
      onNext: () => navigate(1),
      onTogglePractice: togglePractice
    })
    titleWidget = layout.titleWidget
    contentWidget = layout.contentWidget
  }
})
