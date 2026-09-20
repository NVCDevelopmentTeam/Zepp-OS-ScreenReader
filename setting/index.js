import renderGeneral from './GeneralSetting.js'
import renderSpeech from './SpeechSetting.js'
import renderVision from './VisionSetting.js'
import renderGesturesInput from './GesturesInputSetting.js'
import renderNotifications from './NotificationSetting.js'
import renderObjectPresentation from './ObjectPresentationSetting.js'
import renderNavigation from './NavigationSetting.js'
import renderAudioBraille from './AudioBrailleSetting.js'
import renderInputComposition from './InputCompositionSetting.js'
import renderSpeechHistory from './SpeechHistorySetting.js'
import renderRemoteAccess from './RemoteAccessSetting.js'
import renderDocument from './DocumentSetting.js'
import renderDeveloperOptions from './DeveloperSettings.js'
import renderAbout from './AboutSetting.js'
import renderDisplay from './DisplaySetting.js'
import renderFeedback from './FeedbackSetting.js'
import renderGestureActions from './InputGestureSetting.js'
import renderKeyboard from './KeyboardSetting.js'
import renderLanguage from './LanguageSetting.js'
import renderMenu from './MenuSetting.js'
import renderOCR from './OCRSetting.js'
import renderSound from './SoundSetting.js'
import renderTextToSpeech from './TextToSpeechSetting.js'
import renderVoice from './VoiceSetting.js'
import renderAccessibilityDiagnostics from './accessibilitySetting.js'
import renderAudioOutput from './audioSetting.js'
import renderBraille from './brailleSetting.js'
import renderFont from './fontSetting.js'
import renderShortcut from './shortcutSetting.js'
import renderVolume from './volumeSetting.js'

AppSettingsPage({
  build(props) {
    const activeTab = props.settingsStorage.getItem('activeTab') || 'general'

    const isDevMode = props.settingsStorage.getItem('devMode') === true

    const categories = [
      { label: 'General', value: 'general' },
      { label: 'Speech', value: 'speech' },
      { label: 'Text-to-Speech Engine', value: 'tts' },
      { label: 'Voice Preset', value: 'voice' },
      { label: 'Sound Effects', value: 'sound' },
      { label: 'Master Volume', value: 'volume' },
      { label: 'Vision', value: 'vision' },
      { label: 'OCR & Image Recognition', value: 'ocr' },
      { label: 'Display', value: 'display' },
      { label: 'Font Style', value: 'font' },
      { label: 'Gestures & Input', value: 'gestures' },
      { label: 'Gesture Actions', value: 'gestureActions' },
      { label: 'Keyboard', value: 'keyboard' },
      { label: 'Feedback', value: 'feedback' },
      { label: 'Notifications', value: 'notifications' },
      { label: 'Object Presentation', value: 'object' },
      { label: 'Context Menu', value: 'menu' },
      { label: 'Cursor & Navigation', value: 'navigation' },
      { label: 'Shortcut Card', value: 'shortcut' },
      { label: 'Audio & Braille', value: 'audio' },
      { label: 'Audio Output', value: 'audioOutput' },
      { label: 'Braille Input', value: 'brailleInput' },
      { label: 'Input Composition', value: 'input' },
      { label: 'Language & Region', value: 'language' },
      { label: 'Speech History', value: 'history' },
      { label: 'Remote Access', value: 'remote' },
      { label: 'Document Settings', value: 'document' },
      { label: 'Reliability & Diagnostics', value: 'diagnostics' },
      { label: 'About', value: 'about' }
    ]

    if (isDevMode) {
      categories.push({ label: 'Developer Options', value: 'developer' })
    }

    let content
    switch (activeTab) {
      case 'general':
        content = renderGeneral(props)
        break
      case 'speech':
        content = renderSpeech(props)
        break
      case 'tts':
        content = renderTextToSpeech(props)
        break
      case 'voice':
        content = renderVoice(props)
        break
      case 'sound':
        content = renderSound(props)
        break
      case 'volume':
        content = renderVolume(props)
        break
      case 'vision':
        content = renderVision(props)
        break
      case 'ocr':
        content = renderOCR(props)
        break
      case 'display':
        content = renderDisplay(props)
        break
      case 'font':
        content = renderFont(props)
        break
      case 'gestures':
        content = renderGesturesInput(props)
        break
      case 'gestureActions':
        content = renderGestureActions(props)
        break
      case 'keyboard':
        content = renderKeyboard(props)
        break
      case 'feedback':
        content = renderFeedback(props)
        break
      case 'notifications':
        content = renderNotifications(props)
        break
      case 'object':
        content = renderObjectPresentation(props)
        break
      case 'menu':
        content = renderMenu(props)
        break
      case 'navigation':
        content = renderNavigation(props)
        break
      case 'shortcut':
        content = renderShortcut(props)
        break
      case 'audio':
        content = renderAudioBraille(props)
        break
      case 'audioOutput':
        content = renderAudioOutput(props)
        break
      case 'brailleInput':
        content = renderBraille(props)
        break
      case 'input':
        content = renderInputComposition(props)
        break
      case 'language':
        content = renderLanguage(props)
        break
      case 'history':
        content = renderSpeechHistory(props)
        break
      case 'remote':
        content = renderRemoteAccess(props)
        break
      case 'document':
        content = renderDocument(props)
        break
      case 'diagnostics':
        content = renderAccessibilityDiagnostics(props)
        break
      case 'about':
        content = renderAbout(props)
        break
      case 'developer':
        content = renderDeveloperOptions(props)
        break
      default:
        content = renderGeneral(props)
    }

    return [
      Section({ title: 'ZSR Settings' }, [
        Select({
          label: 'Category',
          settingsKey: 'activeTab',
          options: categories
        })
      ]),
      ...content,
      Section({ title: 'About' }, [
        Text('ZSR — Zepp OS Screen Reader'),
        Text('Version: 1.0.1', {
          onClick: () => {
            const taps = (props.settingsStorage.getItem('devTaps') || 0) + 1
            if (taps >= 7) {
              const currentDevMode = props.settingsStorage.getItem('devMode')
              props.settingsStorage.setItem('devMode', !currentDevMode)
              props.settingsStorage.setItem('devTaps', 0)
            } else {
              props.settingsStorage.setItem('devTaps', taps)
            }
          }
        }),
        Text('Developer: NVCDevelopmentTeam')
      ])
    ]
  }
})
