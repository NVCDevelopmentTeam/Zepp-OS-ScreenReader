module.exports = {
  type: 'app',
  builder: '@zeppos/zeus-cli',
  options: {
    deviceType: 'gtr3-pro',
    targets: [
      '480x480-gtr-3-pro',
      '466x466-gtr-4',
      '390x450-gts-4',
      '454x454-t-rex-ultra'
    ],
    development: {
      outputPath: 'dist',
      targetDevice: 'simulator'
    },
    assets: {
      path: 'assets',
      icons: {
        'gtr3-pro': { path: 'assets/480x480-gtr-3-pro/icons/icon.png', size: 120 },
        'gtr4': { path: 'assets/466x466-gtr-4/icons/icon.png', size: 120 },
        'gts4': { path: 'assets/390x450-gts-4/icons/icon.png', size: 120 },
        't-rex-ultra': { path: 'assets/454x454-t-rex-ultra/icons/icon.png', size: 120 }
      },
      sounds: {
        path: 'assets/sounds',
        files: [
          'tap.wav',
          'success.wav',
          'error.wav',
          'warning.wav',
          'notification.wav'
        ]
      }
    },
    moduleResolution: {
      alias: {
        '@zos': '@zeppos/zeus-cli/api',
        '@zos/ui': '@zeppos/zeus-cli/api/ui',
        '@zos/utils': '@zeppos/zeus-cli/api/utils',
        '@zos/device': '@zeppos/zeus-cli/api/device',
        '@zos/settings': '@zeppos/zeus-cli/api/settings'
      },
      fallback: {
        '@zos/ui': false,
        '@zos/utils': false,
        '@zos/device': false,
        '@zos/settings': false
      },
      extensions: ['.js', '.json']
    }
  }
}
