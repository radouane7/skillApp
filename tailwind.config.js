/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    "./public/index.html",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          600: '#2563eb'
        },
        secondary: {
          50: '#f0fdf4',
          500: '#22c55e',
          600: '#16a34a'
        }
      }
    }
  },
  plugins: [require('@tailwindcss/forms')]
}
