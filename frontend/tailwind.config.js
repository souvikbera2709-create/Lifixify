/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        emerald: {
          50: '#F0F9F4',
          100: '#E6F4ED',
          200: '#C2E7D3',
          300: '#8FD3B0',
          400: '#54B886',
          500: '#10B981',
          600: '#0D5C3A',
          700: '#124F34',
          800: '#0B3A26',
          900: '#062618',
        },
        surface: {
          canvas: '#F4F6F5',
          card: '#FFFFFF',
          border: '#EEF2F0',
          heading: '#111827',
          muted: '#6B7280',
        },
        game: {
          bg: '#F4F6F5',
          card: '#FFFFFF',
          border: '#EEF2F0',
          xp: '#10B981',
          coin: '#F59E0B',
          streak: '#F97316',
          mana: '#124F34',
        }
      },
      boxShadow: {
        'card': '0 4px 20px rgba(0, 0, 0, 0.03)',
        'card-hover': '0 8px 30px rgba(18, 79, 52, 0.08)',
        'emerald': '0 4px 14px rgba(18, 79, 52, 0.25)',
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      }
    },
  },
  plugins: [],
}
