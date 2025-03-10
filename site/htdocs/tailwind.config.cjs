// tailwind.config.cjs - Optimized for Lighthouse and Performance
module.exports = {
  darkMode: 'class',
  content: ['./src/**/*.{html,js,svelte,md,svx}'],
  plugins: [require('@tailwindcss/typography')],
  theme: {
    extend: {
      backgroundImage: {
        'custom-background': "url('/background.jpg')",
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
        '9xl': ['8rem', { lineHeight: '1' }],
      },
    },
    typography: ({ theme }) => ({
      DEFAULT: {
        css: {
          '--tw-prose-body': theme('colors.zinc.600'),
          '--tw-prose-headings': theme('colors.zinc.900'),
          '--tw-prose-links': theme('colors.teal.500'),
          '--tw-prose-bold': theme('colors.zinc.900'),
          '--tw-prose-quote-borders': theme('colors.zinc.200'),
          color: 'var(--tw-prose-body)',
          lineHeight: theme('lineHeight.7'),
          '> *': {
            marginTop: theme('spacing.10'),
            marginBottom: theme('spacing.10'),
          },
          p: {
            marginTop: theme('spacing.7'),
            marginBottom: theme('spacing.7'),
          },
          'h2, h3': {
            color: 'var(--tw-prose-headings)',
            fontWeight: theme('fontWeight.semibold'),
          },
          h2: {
            fontSize: theme('fontSize.xl')[0],
            lineHeight: theme('lineHeight.7'),
          },
          h3: {
            fontSize: theme('fontSize.base')[0],
            lineHeight: theme('lineHeight.7'),
          },
          a: {
            color: 'var(--tw-prose-links)',
            fontWeight: theme('fontWeight.semibold'),
            textDecoration: 'underline',
            textDecorationColor: 'var(--tw-prose-links)',
          },
          'a:hover': {
            color: theme('colors.teal.600'),
          },
          blockquote: {
            paddingLeft: theme('spacing.6'),
            borderLeftWidth: theme('borderWidth.2'),
            fontStyle: 'italic',
          },
        },
      },
      invert: {
        css: {
          '--tw-prose-body': theme('colors.zinc.400'),
          '--tw-prose-headings': theme('colors.zinc.200'),
          '--tw-prose-links': theme('colors.teal.400'),
          '--tw-prose-quote-borders': theme('colors.zinc.500'),
          '--tw-prose-hr': theme('colors.zinc.700 / 0.4'),
        },
      },
    }),
  },
};