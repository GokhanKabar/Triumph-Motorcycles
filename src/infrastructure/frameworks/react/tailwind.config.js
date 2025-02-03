/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'triumph-red': '#D4002A',
        'triumph-black': '#1E1E1E',
      },
    },
  },
  plugins: [],
}
