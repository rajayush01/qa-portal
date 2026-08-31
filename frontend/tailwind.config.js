/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        // NOTE: this scale runs light -> dark as the number goes 950 -> 100
        // (the reverse of Tailwind's own convention). That's intentional:
        // every component was written against "ink-950 = page background"
        // and "ink-100 = primary text", so re-pointing those two ends at a
        // light theme here re-themes the whole app without touching markup.
        ink: {
          950: '#FFFFFF', // page background — the "whitish" base
          900: '#F8F4E1', // brand cream — sidebars, panels, secondary surfaces
          800: '#F1E8CC', // card surfaces / hover backgrounds
          700: '#E2D4AE', // card & input borders
          600: '#C8B78C', // deeper borders, dividers, toggle-off state
          500: '#786E54', // muted tertiary text, icons
          400: '#5B6B69', // secondary body text
          300: '#33484A', // darker secondary / regular text
          200: '#1B3234', // near-black teal, alt heading text
          100: '#0A2224', // primary text & headings
        },
        accent: {
          300: '#0F7A82',
          400: '#00767E',
          500: '#007078', // brand primary teal
          600: '#00565D',
        },
        signal: {
          amber: '#FFC600', // brand gold — used sparingly, as an accent/fill only
          green: '#15794F',
          red: '#C93B3B',
        },
      },
      fontFamily: {
        display: ['"Fraunces"', 'ui-serif', 'Georgia', 'serif'],
        sans: ['"Inter"', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"IBM Plex Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 2px rgba(10,34,36,0.06), 0 8px 24px -8px rgba(10,34,36,0.12)',
        popover: '0 12px 40px -12px rgba(10,34,36,0.35)',
      },
      keyframes: {
        pulseRing: {
          '0%': { boxShadow: '0 0 0 0 rgba(201,59,59,0.45)' },
          '100%': { boxShadow: '0 0 0 10px rgba(201,59,59,0)' },
        },
        highlightIn: {
          '0%': { backgroundColor: 'rgba(255,198,0,0.18)' },
          '100%': { backgroundColor: 'rgba(255,198,0,0)' },
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
