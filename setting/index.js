import { AppSettingsPage, Section, Select, Text } from '@zeppos/zml'
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

AppSettingsPage({
  build(props) {
    const activeTab = props.settingsStorage.getItem('activeTab') || 'general'

    const isDevMode = props.settingsStorage.getItem('devMode') === true

    const categories = [
      { label: 'General', value: 'general' },
      { label: 'Speech', value: 'speech' },
      { label: 'Vision', value: 'vision' },
      { label: 'Gestures & Input', value: 'gestures' },
      { label: 'Notifications', value: 'notifications' },
      { label: 'Object Presentation', value: 'object' },
      { label: 'Cursor & Navigation', value: 'navigation' },
      { label: 'Audio & Braille', value: 'audio' },
      { label: 'Input Composition', value: 'input' },
      { label: 'Speech History', value: 'history' },
      { label: 'Remote Access', value: 'remote' },
      { label: 'Document Settings', value: 'document' }
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
      case 'vision':
        content = renderVision(props)
        break
      case 'gestures':
        content = renderGesturesInput(props)
        break
      case 'notifications':
        content = renderNotifications(props)
        break
      case 'object':
        content = renderObjectPresentation(props)
        break
      case 'navigation':
        content = renderNavigation(props)
        break
      case 'audio':
        content = renderAudioBraille(props)
        break
      case 'input':
        content = renderInputComposition(props)
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
