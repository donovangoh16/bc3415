/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        navy: '#0f172a',
        slate: '#1e293b',
        accent: '#7c3aed',
      },
      animation: {
        'slow-pulse': 'slowPulse 8s ease-in-out infinite',
        'gradient-x': 'gradientX 12s ease infinite',
      },
      keyframes: {
        slowPulse: {
          '0%, 100%': { opacity: 0.5 },
          '50%': { opacity: 1 },
        },
        gradientX: {
          '0%, 100%': { 'background-position': '0% 50%' },
          '50%': { 'background-position': '100% 50%' },
        },
      },
    },
  },
  plugins: [],
}

