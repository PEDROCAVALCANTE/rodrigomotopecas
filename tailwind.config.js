/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        moto: {
          50: '#fff7ed',   // Orange 50
          100: '#ffedd5',  // Orange 100
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',  // Orange 500 (Primary)
          600: '#ea580c',  // Orange 600 (Hover)
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',  // Orange 900
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Impact', 'Arial Black', 'sans-serif'],
      }
    },
  },
  plugins: [],
}