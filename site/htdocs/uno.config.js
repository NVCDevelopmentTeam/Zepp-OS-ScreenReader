// uno.config.js
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
  // ─────────────────────────────────────────────────────────
  // SHORTCUTS
  // ─────────────────────────────────────────────────────────
  shortcuts: [
    {
      wrapper: 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
      container: 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',
      'flex-center': 'flex items-center justify-center',
      'flex-between': 'flex items-center justify-between',
      'flex-col-center': 'flex flex-col items-center justify-center',
      card: 'bg-white dark:bg-[#13171c] rounded-3xl border border-gray-100 dark:border-white/7 shadow-sm p-8 transition-shadow,transform duration-300 ease-out hover:shadow-xl hover:-translate-y-1 will-change-transform',
      'card-glass':
        'bg-white/70 dark:bg-[#0b0e11]/70 backdrop-blur-md rounded-3xl border border-white/20 dark:border-white/10 shadow-sm p-8',
      btn: 'inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-8 py-3 rounded-full font-bold text-sm transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0052ff]',
      'btn-primary':
        'btn bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:from-blue-400 hover:to-blue-500',
      'btn-secondary':
        'btn bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20',
      'btn-ghost': 'btn text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10',
      glass:
        'bg-white/70 dark:bg-[#0b0e11]/70 backdrop-blur-md border border-white/20 dark:border-white/10',
      'nav-link':
        'min-h-[44px] flex items-center text-gray-600 dark:text-gray-400 hover:text-[#0052ff] dark:hover:text-blue-400 font-bold text-sm tracking-wide uppercase transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0052ff] rounded-sm',
      'input-field':
        'w-full min-h-[44px] px-6 py-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:ring-2 focus:ring-[#0052ff] focus:ring-offset-0 outline-none transition-all duration-200'
    }
  ],

  // ─────────────────────────────────────────────────────────
  // THEME
  // ─────────────────────────────────────────────────────────
  theme: {
    colors: {
      zeppBlue: '#0052FF',
      zeppDark: '#0B0E11'
    },
    breakpoints: {
      xs: '375px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px'
    }
  },

  // ─────────────────────────────────────────────────────────
  // PRESETS
  // ─────────────────────────────────────────────────────────
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

    // Web fonts: system-ui for UI + Fira Mono for code blocks
    presetWebFonts({
      provider: 'google',
      fonts: {
        sans: [{ name: 'system-ui', provider: 'none' }],
        mono: [
          {
            name: 'Fira Mono',
            weights: ['400', '700'],
            display: 'swap',
            subsets: ['latin'],
            provider: 'none'
          },
          { name: 'ui-monospace', provider: 'none' }
        ]
      }
    })
  ],

  // ─────────────────────────────────────────────────────────
  // TRANSFORMERS
  // ─────────────────────────────────────────────────────────
  transformers: [transformerDirectives(), transformerVariantGroup()],

  // ─────────────────────────────────────────────────────────
  // CONTENT SCANNING
  // ─────────────────────────────────────────────────────────
  content: {
    filesystem: ['src/**/*.{svelte,js,ts,html,md}']
  },

  // ─────────────────────────────────────────────────────────
  // SAFELIST — classes used in app.css or dynamically via JS
  // ─────────────────────────────────────────────────────────
  safelist: [
    'dark',
    'reveal-up',
    'reveal-up-delay-1',
    'reveal-up-delay-2',
    'reveal-up-delay-3',
    'reveal-fade',
    'bg-zepp',
    'container',
    'sr-only',
    'safe-top',
    'safe-bottom',
    'safe-x'
  ]
})
