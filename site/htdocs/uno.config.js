import {
  defineConfig,
  presetUno,
  presetIcons,
  presetTypography,
  presetWebFonts,
  presetAttributify,
  transformerDirectives,
  transformerVariantGroup
} from 'unocss'

export default defineConfig({
  shortcuts: [
    {
      container: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
      'flex-center': 'flex items-center justify-center',
      'flex-between': 'flex items-center justify-between',

      // Zepp Style Cards
      card: 'bg-white dark:bg-dark-900/50 backdrop-blur-md rounded-3xl shadow-sm border border-gray-100 dark:border-white/10 p-8 transition-all duration-300 hover:shadow-xl hover:translate-y-[-4px]',

      // Zepp Style Buttons (Pill shaped)
      btn: 'inline-flex items-center justify-center px-8 py-3 rounded-full font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none',
      'btn-primary':
        'btn bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:from-blue-400 hover:to-blue-500',
      'btn-secondary':
        'btn bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20',

      // Glassmorphism
      glass:
        'bg-white/70 dark:bg-dark-900/70 backdrop-blur-md border border-white/20 dark:border-white/10',

      'nav-link':
        'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 font-bold transition-colors duration-200 text-sm tracking-wide uppercase',
      'input-field':
        'w-full px-6 py-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 focus:ring-2 focus:ring-blue-500 outline-none transition-all'
    }
  ],
  theme: {
    colors: {
      zeppBlue: '#0052FF',
      zeppDark: '#0B0E11'
    }
  },
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle'
      }
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        sans: [
          {
            name: 'Inter',
            provider: 'google',
            weights: ['400', '500', '600', '700', '800'],
            display: 'swap'
          },
          { name: 'system-ui', provider: 'none' },
          { name: 'sans-serif', provider: 'none' }
        ],
        display: [
          {
            name: 'Lexend',
            provider: 'google',
            weights: ['400', '500', '600', '700', '800'],
            display: 'swap'
          },
          { name: 'sans-serif', provider: 'none' }
        ]
      }
    })
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  content: {
    filesystem: ['src/**/*.{svelte,js,ts,html,md}']
  }
})
