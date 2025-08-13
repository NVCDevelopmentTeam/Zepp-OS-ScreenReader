/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{html,js,svelte,md,svx}'],
  plugins: [require('@tailwindcss/typography')],
  theme: {
    extend: {},
    backgroundImage: {
      'custom-background': "url('/background.jpg')"
      // Add other custom wallpapers here
    },
    fontSize: {
      xs: ['0.8125rem', { lineHeight: '1.5rem' }],
      sm: ['0.875rem', { lineHeight: '1.5rem' }],
      base: ['1rem', { lineHeight: '1.75rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '2rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '3.5rem' }],
      '6xl': ['3.75rem', { lineHeight: '1' }],
      '7xl': ['4.5rem', { lineHeight: '1' }],
      '8xl': ['6rem', { lineHeight: '1' }],
      '9xl': ['8rem', { lineHeight: '1' }]
    },
    typography: (theme) => ({
      invert: {
        css: {
          '--tw-prose-invert-body': 'var(--tw-prose-invert-body)',
          '--tw-prose-invert-headings': 'var(--tw-prose-invert-headings)',
          '--tw-prose-invert-links': 'var(--tw-prose-invert-links)',
          '--tw-prose-invert-links-hover': 'var(--tw-prose-invert-links-hover)',
          '--tw-prose-invert-underline': 'var(--tw-prose-invert-underline)',
          '--tw-prose-invert-underline-hover': 'var(--tw-prose-invert-underline-hover)',
          '--tw-prose-invert-bold': 'var(--tw-prose-invert-bold)',
          '--tw-prose-invert-counters': 'var(--tw-prose-invert-counters)',
          '--tw-prose-invert-bullets': 'var(--tw-prose-invert-bullets)',
          '--tw-prose-invert-hr': 'var(--tw-prose-invert-hr)',
          '--tw-prose-invert-quote-borders': 'var(--tw-prose-invert-quote-borders)',
          '--tw-prose-invert-captions': 'var(--tw-prose-invert-captions)',
          '--tw-prose-invert-code': 'var(--tw-prose-invert-code)',
          '--tw-prose-invert-code-bg': 'var(--tw-prose-invert-code-bg)',
          '--tw-prose-invert-pre-code': 'var(--tw-prose-invert-pre-code)',
          '--tw-prose-invert-pre-bg': 'var(--tw-prose-invert-pre-bg)',
          '--tw-prose-invert-pre-border': 'var(--tw-prose-invert-pre-border)',
          '--tw-prose-invert-th-borders': 'var(--tw-prose-invert-th-borders)',
          '--tw-prose-invert-td-borders': 'var(--tw-prose-invert-td-borders)'
        }
      },
      DEFAULT: {
        css: {
          '--tw-prose-body': theme('colors.zinc.600'),
          '--tw-prose-headings': theme('colors.zinc.900'),
          '--tw-prose-links': theme('colors.teal.500'),
          '--tw-prose-links-hover': theme('colors.teal.600'),
          '--tw-prose-underline': theme('colors.teal.500 / 0.2'),
          '--tw-prose-underline-hover': theme('colors.teal.500'),
          '--tw-prose-bold': theme('colors.zinc.900'),
          '--tw-prose-counters': theme('colors.zinc.900'),
          '--tw-prose-bullets': theme('colors.zinc.900'),
          '--tw-prose-hr': theme('colors.zinc.100'),
          '--tw-prose-quote-borders': theme('colors.zinc.200'),
          '--tw-prose-captions': theme('colors.zinc.400'),
          '--tw-prose-code': theme('colors.zinc.700'),
          '--tw-prose-code-bg': theme('colors.zinc.300 / 0.2'),
          '--tw-prose-pre-code': theme('colors.zinc.100'),
          '--tw-prose-pre-bg': theme('colors.zinc.900'),
          '--tw-prose-pre-border': 'transparent',
          '--tw-prose-th-borders': theme('colors.zinc.200'),
          '--tw-prose-td-borders': theme('colors.zinc.100'),
          '--tw-prose-invert-body': theme('colors.zinc.400'),
          '--tw-prose-invert-headings': theme('colors.zinc.200'),
          '--tw-prose-invert-links': theme('colors.teal.400'),
          '--tw-prose-invert-links-hover': theme('colors.teal.400'),
          '--tw-prose-invert-underline': theme('colors.teal.400 / 0.3'),
          '--tw-prose-invert-underline-hover': theme('colors.teal.400'),
          '--tw-prose-invert-bold': theme('colors.zinc.200'),
          '--tw-prose-invert-counters': theme('colors.zinc.200'),
          '--tw-prose-invert-bullets': theme('colors.zinc.200'),
          '--tw-prose-invert-hr': theme('colors.zinc.700 / 0.4'),
          '--tw-prose-invert-quote-borders': theme('colors.zinc.500'),
          '--tw-prose-invert-captions': theme('colors.zinc.500'),
          '--tw-prose-invert-code': theme('colors.zinc.300'),
          '--tw-prose-invert-code-bg': theme('colors.zinc.200 / 0.05'),
          '--tw-prose-invert-pre-code': theme('colors.zinc.100'),
          '--tw-prose-invert-pre-bg': 'rgb(0 0 0 / 0.4)',
          '--tw-prose-invert-pre-border': theme('colors.zinc.200 / 0.1'),
          '--tw-prose-invert-th-borders': theme('colors.zinc.700'),
          '--tw-prose-invert-td-borders': theme('colors.zinc.800'),
          color: 'var(--tw-prose-body)',
          'line-height': theme('lineHeight.7'),
          '> *': {
            'margin-top': theme('spacing.10'),
            'margin-bottom': theme('spacing.10')
          },
          p: {
            'margin-top': theme('spacing.7'),
            'margin-bottom': theme('spacing.7')
          },
          'h2, h3': {
            color: 'var(--tw-prose-headings)',
            'font-weight': 'semibold'
          },
          h2: {
            'font-size': theme('fontSize.xl')[0],
            'line-height': theme('lineHeight.7'),
            'margin-top': theme('spacing.20'),
            'margin-bottom': theme('spacing.4')
          },
          h3: {
            'font-size': theme('fontSize.base')[0],
            'line-height': theme('lineHeight.7'),
            'margin-top': theme('spacing.16'),
            'margin-bottom': theme('spacing.4')
          },
          ':is(h2, h3) + *': {
            'margin-top': 0
          },
          img: {
            'border-radius': theme('borderRadius.3xl')
          },
          video: {
            'border-radius': theme('borderRadius.3xl')
          },
          a: {
            color: 'var(--tw-prose-links)',
            'font-weight': 'semibold',
            'text-decoration': 'underline',
            'text-decoration-color': 'var(--tw-prose-underline)',
            'transition-property': 'color, text-decoration-color',
            'transition-duration': theme('transitionDuration.150'),
            'transition-timing-function': theme('transitionTimingFunction.in-out')
          },
          'a:hover': {
            color: 'var(--tw-prose-links-hover)',
            'text-decoration-color': 'var(--tw-prose-underline-hover)'
          },
          ':is(h1,h2,h3,h4,h5,h6) a': {
            color: 'var(--tw-prose-headings)',
            'text-decoration': 'none',
            'font-weight': 'inherit'
          },
          strong: {
            color: 'var(--tw-prose-bold)',
            'font-weight': 'semibold'
          },
          code: {
            display: 'inline-block',
            color: 'var(--tw-prose-code)',
            'font-size': theme('fontSize.sm')[0],
            'font-weight': 'semibold',
            'background-color': 'var(--tw-prose-code-bg)',
            'border-radius': theme('borderRadius.lg'),
            'padding-left': theme('spacing.1'),
            'padding-right': theme('spacing.1')
          },
          'a code': {
            color: 'inherit'
          },
          ':is(h2, h3) code': {
            'font-weight': 'bold'
          },
          blockquote: {
            'padding-left': theme('spacing.6'),
            'border-left-width': theme('borderWidth.2'),
            'border-left-color': 'var(--tw-prose-quote-borders)',
            'font-style': 'italic'
          },
          figcaption: {
            color: 'var(--tw-prose-captions)',
            'font-size': theme('fontSize.sm')[0],
            'line-height': theme('lineHeight.6'),
            'margin-top': theme('spacing.3')
          },
          'figcaption > p': {
            margin: 0
          },
          ul: {
            'list-style-type': 'disc'
          },
          ol: {
            'list-style-type': 'decimal'
          },
          'ul, ol': {
            'padding-left': theme('spacing.6')
          },
          li: {
            'margin-top': theme('spacing.6'),
            'margin-bottom': theme('spacing.6'),
            'padding-left': theme('spacing[3.5]')
          },
          'li::marker': {
            'font-size': theme('fontSize.sm')[0],
            'font-weight': 'semibold'
          },
          'ol > li::marker': {
            color: 'var(--tw-prose-counters)'
          },
          'ul > li::marker': {
            color: 'var(--tw-prose-bullets)'
          },
          'li :is(ol, ul)': {
            'margin-top': theme('spacing.4'),
            'margin-bottom': theme('spacing.4')
          },
          'li :is(li, p)': {
            'margin-top': theme('spacing.3'),
            'margin-bottom': theme('spacing.3')
          },
          pre: {
            color: 'var(--tw-prose-pre-code)',
            'font-size': theme('fontSize.sm')[0],
            'font-weight': 'medium',
            'background-color': 'var(--tw-prose-pre-bg)',
            'border-radius': theme('borderRadius.3xl'),
            padding: theme('spacing.8'),
            'overflow-x': 'auto',
            border: '1px solid',
            'border-color': 'var(--tw-prose-pre-border)'
          },
          'pre code': {
            display: 'inline',
            color: 'inherit',
            'font-size': 'inherit',
            'font-weight': 'inherit',
            'background-color': 'transparent',
            'border-radius': 0,
            padding: 0
          },
          hr: {
            'margin-top': theme('spacing.20'),
            'margin-bottom': theme('spacing.20'),
            'border-top-width': '1px',
            'border-color': 'var(--tw-prose-hr)'
          },
          '@media (min-width: 1024px)': {
            hr: {
              'margin-left': `calc(${theme('spacing.12')} * -1)`,
              'margin-right': `calc(${theme('spacing.12')} * -1)`
            }
          },
          table: {
            width: '100%',
            'table-layout': 'auto',
            'text-align': 'left',
            'font-size': theme('fontSize.sm')[0]
          },
          thead: {
            'border-bottom-width': '1px',
            'border-bottom-color': 'var(--tw-prose-th-borders)'
          },
          'thead th': {
            color: 'var(--tw-prose-headings)',
            'font-weight': 'semibold',
            'vertical-align': 'bottom',
            'padding-bottom': theme('spacing.2')
          },
          'thead th:not(:first-child)': {
            'padding-left': theme('spacing.2')
          },
          'thead th:not(:last-child)': {
            'padding-right': theme('spacing.2')
          },
          'tbody tr': {
            'border-bottom-width': '1px',
            'border-bottom-color': 'var(--tw-prose-td-borders)'
          },
          'tbody tr:last-child': {
            'border-bottom-width': 0
          },
          'tbody td': {
            'vertical-align': 'baseline'
          },
          tfoot: {
            'border-top-width': '1px',
            'border-top-color': 'var(--tw-prose-th-borders)'
          },
          'tfoot td': {
            'vertical-align': 'top'
          },
          ':is(tbody, tfoot) td': {
            'padding-top': theme('spacing.2'),
            'padding-bottom': theme('spacing.2')
          },
          ':is(tbody, tfoot) td:not(:first-child)': {
            'padding-left': theme('spacing.2')
          },
          ':is(tbody, tfoot) td:not(:last-child)': {
            'padding-right': theme('spacing.2')
          }
        }
      }
    })
  }
}
