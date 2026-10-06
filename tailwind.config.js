/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      screens: {
        xs: '480px',
      },
      colors: {
        brand: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
        bits: {
          azure: '#124294',     // Royal Azure (Hero Foundation)
          horizon: '#1B55C6',   // Horizon Deep Blue (Authority / Headings)
          electric: '#2563EB',  // Electric Blue (Operational Action)
          cyan: '#38BDF8',      // Cloud Sky Cyan (Infinity Glow)
          vapor: '#E0F2FE',     // Stratosphere Vapor (Glass Shell)
          cirrus: '#F8FAFC',    // Cirrus Cloud White (Surface)
          amber: '#F59E0B',     // Horizon Sunrise Amber (Metric Focus)
          navy: '#060c1c',      // Midnight Canvas
          midnight: '#0a142c',  // Deep Enterprise Surface
          deep: '#0f1f42',      // Elevated Layer Surface
        },
        accent: {
          purple: '#8b5cf6',
          indigo: '#6366f1',
          emerald: '#10b981',
          amber: '#f59e0b',
          rose: '#f43f5e',
        },
        dark: {
          bg: '#060c1c',
          card: '#0a142c',
          cardSubtle: '#0f1f42',
          border: '#1b2d55',
          borderHover: '#25417e',
        }
      },
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Inter', 'system-ui', 'sans-serif'],
        jakarta: ['Plus Jakarta Sans', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        display: ['Outfit', 'Plus Jakarta Sans', 'sans-serif'],
        script: ['Caveat', 'cursive'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'ripple': 'ripple 2s linear infinite',
        'float': 'float 4s ease-in-out infinite',
        'gradient-x': 'gradient-x 6s ease infinite',
        'card-shine': 'shine 4s ease-in-out infinite',
      },
      keyframes: {
        ripple: {
          '0%': { transform: 'scale(0.8)', opacity: '1' },
          '100%': { transform: 'scale(2.4)', opacity: '0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'gradient-x': {
          '0%, 100%': { 'background-size': '200% 200%', 'background-position': 'left center' },
          '50%': { 'background-size': '200% 200%', 'background-position': 'right center' },
        },
        shine: {
          '0%': { backgroundPosition: '200% 0' },
          '100%': { backgroundPosition: '-200% 0' },
        }
      },
      boxShadow: {
        'glow-cyan': '0 0 25px -4px rgba(56, 189, 248, 0.4)',
        'glow-blue': '0 0 25px -4px rgba(37, 99, 235, 0.45)',
        'glow-azure': '0 0 35px -5px rgba(18, 66, 148, 0.55)',
        'glow-amber': '0 0 25px -4px rgba(245, 158, 11, 0.4)',
        'glow-purple': '0 0 25px -5px rgba(139, 92, 246, 0.35)',
        'glow-emerald': '0 0 25px -5px rgba(16, 185, 129, 0.35)',
        'card-dark': '0 10px 30px -10px rgba(0, 0, 0, 0.6), 0 0 1px 1px rgba(224, 242, 254, 0.08)',
        'card-glass': '0 8px 32px 0 rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(224, 242, 254, 0.08)',
        'card-bits': '0 12px 36px -10px rgba(6, 12, 28, 0.8), 0 0 0 1px rgba(56, 189, 248, 0.15)',
      },
    },
  },
  plugins: [],
}
