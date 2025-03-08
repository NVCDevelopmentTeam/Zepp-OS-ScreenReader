// tailwind.config.cjs
module.exports = {
  // Specifies the content files where Tailwind should look for class names
  content: [
    "./src/**/*.{html,js,ts,jsx,tsx}", // Modify the paths as needed for your project
  ],
  theme: {
    extend: {
      // Extend Tailwind's default theme here
      colors: {
        primary: '#1D4ED8', // Example custom color
        secondary: '#9333EA', // Example custom color
      },
      fontFamily: {
        sans: ['Graphik', 'sans-serif'], // Example custom font
      },
      spacing: {
        128: '32rem', // Example custom spacing
      },
    },
  },
  plugins: [
    // Add any plugins you want to use here
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
}
