/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#1a1a1a',
          card: '#2d2d2d',
          text: '#e5e5e5',
          border: '#404040',
          input: '#333333',
          chart: {
            bg: '#2d2d2d',
            grid: '#404040',
            text: '#e5e5e5',
            line: '#4a9eff',
            area: 'rgba(74, 158, 255, 0.2)',
            bar: '#4a9eff',
            tooltip: {
              bg: '#333333',
              text: '#ffffff',
              border: '#404040'
            }
          }
        },
        light: {
          bg: '#ffffff',
          card: '#f8f9fa',
          text: '#333333',
          border: '#e5e7eb',
          input: '#ffffff',
          chart: {
            bg: '#ffffff',
            grid: '#e5e7eb',
            text: '#333333',
            line: '#3b82f6',
            area: 'rgba(59, 130, 246, 0.2)',
            bar: '#3b82f6',
            tooltip: {
              bg: '#ffffff',
              text: '#333333',
              border: '#e5e7eb'
            }
          }
        }
      },
    },
  },
  plugins: [],
}

