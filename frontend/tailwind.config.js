/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#0B0F17',
          900: '#0F141D',
          800: '#161C28',
          700: '#1E2635',
          600: '#2A3346',
          500: '#3C475D',
          400: '#5A6478',
          300: '#8891A3',
          200: '#B7BECC',
          100: '#E4E7ED',
        },
        accent: {
          600: '#4C5FE0',
          500: '#5B6EF5',
          400: '#7C8CF8',
          300: '#A6B1FA',
        },
        signal: {
          amber: '#E8A33D',
          green: '#3FBF80',
          red: '#E1554E',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(11,15,23,0.06), 0 8px 24px -8px rgba(11,15,23,0.12)',
        popover: '0 12px 40px -12px rgba(11,15,23,0.45)',
      },
      keyframes: {
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(91,110,245,0.45)' },
          '100%': { boxShadow: '0 0 0 10px rgba(91,110,245,0)' },
        },
        highlightIn: {
          '0%': { backgroundColor: 'rgba(91,110,245,0.16)' },
          '100%': { backgroundColor: 'rgba(91,110,245,0)' },
        },
      },
      animation: {
        pulseRing: 'pulseRing 1.6s ease-out infinite',
        highlightIn: 'highlightIn 2.2s ease-out',
      },
    },
  },
  plugins: [],
};
