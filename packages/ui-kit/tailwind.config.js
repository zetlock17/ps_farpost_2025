/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-black': '#1C1C1C',
        'primary-blue': '#0F9AEF',
        'primary-orange': '#F97D41',
        'primary-gray': '#D9D9D9',
      },
      fontFamily: {
        montserrat: ['Montserrat', 'sans-serif'],
      },
      fontSize: {
        '20': '20px',
        '16': '16px',
      },
      fontWeight: {
        bold: '700',
        semibold: '600',
      }
    },
  },
  plugins: [],
}
