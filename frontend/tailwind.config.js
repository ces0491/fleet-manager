/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        uber: {
          black: '#000000',
          white: '#FFFFFF',
          green: '#276EF1',
          gray: {
            100: '#F6F6F6',
            200: '#E2E2E2',
            300: '#C6C6C6',
            400: '#8F8F8F',
            500: '#545454',
          }
        }
      }
    },
  },
  plugins: [],
}
