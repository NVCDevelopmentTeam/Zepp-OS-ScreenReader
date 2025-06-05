import { defineConfig } from '@zeus/core'

export default defineConfig({
  app: {
    name: 'Zepp OS Screen Reader',
    type: 'app',
    version: {
      name: '1.0.1',
      code: 1
    }
  },
  host: {
    target: 'device',
    connection: {
      protocol: 'ws',
      port: 8000
    }
  },
  build: {
    sourcemap: true,
    targets: ['gtr3-pro', 'gts4', 'falcon'],
    capabilities: {
      'screen-reader': true,
      'accessibility': true,
      'tts': true
    }
  },
  dev: {
    hot: true,
    port: 3000,
    https: false
  },
  dependencies: {
    '@zos/utils': '^1.0.0',
    '@zos/ui': '^1.0.0',
    '@zos/sensor': '^1.0.0'
  }
})
