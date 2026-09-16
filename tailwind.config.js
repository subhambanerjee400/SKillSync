/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        mint: {
          50: '#f2fcf0',
          100: '#e5f9e2',
          200: '#d4f5d0', // requested mint
          300: '#b6eeb0',
          400: '#8edd84',
          500: '#64c459',
        },
        forest: {
          900: '#0f2e1c', // requested dark green
          950: '#081c11',
          800: '#154128',
          700: '#1b5435',
        },
      },
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      letterSpacing: {
        tighter: '-0.04em',
        tight: '-0.02em',
      }
    },
  },
  plugins: [],
}
