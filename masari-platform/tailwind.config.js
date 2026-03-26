/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        masari: {
          deep: '#1e1e1e',
          primary: '#7c3aed',
          secondary: '#06b6d4',
          light: '#f8fafc',
          accent: '#a855f7',
        },
        emerald: {
          50: '#1e1e1e',
          100: '#111827',
          200: '#1f2937',
          300: '#7c3aed',
          400: '#8b5cf6',
          500: '#a855f7',
          600: '#9333ea',
          700: '#7e22ce',
          800: '#6d28d9',
          900: '#e5e7eb',
        },
        teal: {
          50: '#0f172a',
          100: '#0d1020',
          200: '#0b1228',
          300: '#06b6d4',
          400: '#22d3ee',
          500: '#14b8a6',
          600: '#0d9488',
          700: '#0f766e',
          800: '#115e59',
          900: '#bef264',
        },
      },
      fontFamily: {
        display: ['Sora', 'system-ui', 'sans-serif'],
        body: ['Inter', 'Manrope', 'system-ui', 'sans-serif'],
      },
      keyframes: {
        floaty: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        floaty: 'floaty 6s ease-in-out infinite',
        fadeUp: 'fadeUp 700ms ease-out both',
      },
    },
  },
  plugins: [],
}

