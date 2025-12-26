module.exports = {
  content: [
    './src/pages/**/*.{js,jsx,ts,tsx,mdx}',
    './src/components/**/*.{js,jsx,ts,tsx,mdx}',
    './pages/**/*.{js,jsx,ts,tsx,mdx}',
    './components/**/*.{js,jsx,ts,tsx,mdx}',
    './src/**/*.{js,jsx,ts,tsx,mdx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f8f6ff',
          100: '#f3efff',
          200: '#eadcff',
          300: '#d7bffb',
          400: '#b794f6',
          500: '#7c3aed',
          600: '#6d28d9',
          700: '#5b21b6',
          800: '#4c1d95',
          900: '#38106b'
        },
        accent: {
          500: '#ec4899'
        }
      },
      boxShadow: {
        'primary-lg': '0 10px 28px rgba(99, 102, 241, 0.12)'
      }
    }
  },
  plugins: [],
}
