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
      // Use "wrapper" instead of "container" to avoid conflict with .container in app.css
      wrapper: 'w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8',

      // Layout helpers
      'flex-center':     'flex items-center justify-center',
      'flex-between':    'flex items-center justify-between',
      'flex-col-center': 'flex flex-col items-center justify-center',

      // Card — no backdrop-blur by default (GPU cost), use card-glass when blur is needed
      card: 'bg-white dark:bg-[#13171c] rounded-3xl border border-gray-100 dark:border-white/7 shadow-sm p-8 transition-shadow,transform duration-300 ease-out hover:shadow-xl hover:-translate-y-1 will-change-transform',

      // Card with glassmorphism — use only when the design calls for it
      'card-glass': 'bg-white/70 dark:bg-[#0b0e11]/70 backdrop-blur-md rounded-3xl border border-white/20 dark:border-white/10 shadow-sm p-8',

      // Button base — includes 44x44px minimum tap target (WCAG 2.1 AA)
      btn: 'inline-flex items-center justify-center min-h-[44px] min-w-[44px] px-8 py-3 rounded-full font-bold text-sm transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0052ff]',

      'btn-primary':   'btn bg-gradient-to-b from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:from-blue-400 hover:to-blue-500',
      'btn-secondary': 'btn bg-gray-100 text-gray-900 hover:bg-gray-200 dark:bg-white/10 dark:text-white dark:hover:bg-white/20',
      'btn-ghost':     'btn text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10',

      // Standalone glassmorphism surface
      glass: 'bg-white/70 dark:bg-[#0b0e11]/70 backdrop-blur-md border border-white/20 dark:border-white/10',

      // Nav link — 44px tap target for mobile accessibility
      'nav-link': 'min-h-[44px] flex items-center text-gray-600 dark:text-gray-400 hover:text-[#0052ff] dark:hover:text-blue-400 font-bold text-sm tracking-wide uppercase transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-[#0052ff] rounded-sm',

      // Input field — 44px tap target for mobile accessibility
      'input-field': 'w-full min-h-[44px] px-6 py-4 rounded-2xl border border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/5 text-gray-900 dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-600 focus:ring-2 focus:ring-[#0052ff] focus:ring-offset-0 outline-none transition-all duration-200'
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
    // Extra xs breakpoint for small devices (iPhone SE)
    breakpoints: {
      xs:  '375px',
      sm:  '640px',
      md:  '768px',
      lg:  '1024px',
      xl:  '1280px',
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

    // Trimmed font weights to reduce payload (~40-50 KB saved → better LCP)
    // Inter: 400 (body), 600 (semibold), 700 (bold)
    // Lexend: 700, 800 (headings only)
    // latin subset only — covers all Latin-script languages
    presetWebFonts({
      provider: 'google',
      fonts: {
        sans: [
          {
            name: 'Inter',
            weights: ['400', '600', '700'],
            display: 'swap',
            subsets: ['latin']
          },
          { name: 'system-ui', provider: 'none' },
          { name: 'sans-serif', provider: 'none' }
        ],
        display: [
          {
            name: 'Lexend',
            weights: ['700', '800'],
            display: 'swap',
            subsets: ['latin']
          },
          { name: 'sans-serif', provider: 'none' }
        ]
      }
    })
  ],

  // ─────────────────────────────────────────────────────────
  // TRANSFORMERS
  // ─────────────────────────────────────────────────────────
  transformers: [
    transformerDirectives(),
    transformerVariantGroup()
  ],

  // ─────────────────────────────────────────────────────────
  // CONTENT SCANNING
  // ─────────────────────────────────────────────────────────
  content: {
    filesystem: ['src/**/*.{svelte,js,ts,html,md}']
  },

  // ─────────────────────────────────────────────────────────
  // SAFELIST — classes used in app.css or added dynamically via JS
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
