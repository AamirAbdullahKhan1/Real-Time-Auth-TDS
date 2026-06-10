/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#f8fafc', // Slate 50
        surface: '#ffffff',
        primary: {
          DEFAULT: '#2563eb', // Blue 600
          hover: '#1d4ed8',   // Blue 700
        },
        dark: {
          bg: '#0f172a',      // Slate 900
          surface: '#1e293b', // Slate 800
        },
        text: {
          main: '#0f172a',
          muted: '#64748b',   // Slate 500
          inverse: '#f8fafc',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      }
    },
  },
  plugins: [],
}