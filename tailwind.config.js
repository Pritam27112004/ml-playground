/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pen: {
          blue: '#2563EB',
          red: '#DC2626',
          green: '#16A34A',
          purple: '#7C3AED',
          orange: '#EA580C',
        },
        paper: {
          bg: '#FCFCFA',
          grid: '#E5E7EB',
          margin: '#F87171',
        },
        highlighter: {
          yellow: '#FACC15',
        }
      },
      fontFamily: {
        handwritten: ['"Architects Daughter"', 'Caveat', 'cursive'],
        sans: ['Outfit', 'Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
