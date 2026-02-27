/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        dark: {
          bg: '#18181B',      // Lighter dark - zinc-900
          card: '#27272A',    // Lighter card - zinc-800
          hover: '#3F3F46',   // Hover state - zinc-700
        },
        accent: {
          blue: '#60A5FA',    // Brighter blue-400
          blueLight: '#93C5FD', // Even lighter blue-300
          green: '#22C55E',
          amber: '#F59E0B',
          red: '#EF4444',
        },
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
