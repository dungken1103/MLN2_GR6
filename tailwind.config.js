/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        outfit: ['Outfit', 'system-ui', 'sans-serif'],
        inter: ['Inter', 'system-ui', 'sans-serif'],
      },
      colors: {
        magazine: {
          ink: '#0a0a0b',
          paper: '#141416',
          accent: '#dc2626',
          accentMuted: '#991b1b',
        },
      },
      boxShadow: {
        'magazine': '0 25px 50px -12px rgba(0, 0, 0, 0.65), 0 0 0 1px rgba(220, 38, 38, 0.08)',
        'magazine-inner': 'inset 0 1px 0 0 rgba(255,255,255,0.04)',
      },
    },
  },
  plugins: [],
}