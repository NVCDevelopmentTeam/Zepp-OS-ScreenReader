import globals from 'globals'
import js from '@eslint/js'
// I hate TS only using js
export default [
  {
    // The website lives in its own workspace with its own ESLint/Prettier setup.
    // Third-party vendor/generated files (e.g. partytown) must never be linted
    // here since they are not project sources.
    ignores: ['site/htdocs/**', '**/~partytown/**', 'dist/**', 'node_modules/**', '.cache/**']
  },
  js.configs.recommended,
  {
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        App: 'readonly',
        Page: 'readonly',
        AppSideService: 'readonly',
        GestureHandler: 'readonly',
        __DEV__: 'readonly',
        Speech: 'readonly',
        hmUI: 'readonly',
        DEVICE_CAPABILITIES: 'readonly',
        createWidget: 'readonly',
        widget: 'readonly',
        DEVICE_WIDTH: 'readonly',
        GestureManager: 'readonly',
        gettext: 'readonly',
        EventManager: 'readonly',
        getDeviceInfo: 'readonly',
        settingsManager: 'readonly',
        logger: 'readonly',
        accessibility: 'readonly',
        getApp: 'readonly',
        AppWidget: 'readonly',
        SecondaryWidget: 'readonly',
        messaging: 'readonly',
        globalThis: 'readonly',
        Buffer: 'readonly',
        ES6Promise: 'readonly'
      }
    }
  },
  {
    files: ['**/*.js', '**/*.jsx'],
    languageOptions: {
      parser: js.parser,
      parserOptions: {
        ecmaVersion: 2020,
        sourceType: 'module'
      }
    },
    rules: {
      'no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }
      ]
    }
  }
]
