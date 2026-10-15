/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        command: {
          bg: '#050811',
          surface: '#0b1329',
          card: '#0e1838',
          border: 'rgba(0, 242, 254, 0.18)',
          cyan: '#00f2fe',
          teal: '#10b981',
          amber: '#f59e0b',
          red: '#ef4444',
          muted: '#94a3b8',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'cyan-glow': '0 0 20px -3px rgba(0, 242, 254, 0.35)',
        'red-glow': '0 0 20px -3px rgba(239, 68, 68, 0.35)',
        'emerald-glow': '0 0 20px -3px rgba(16, 185, 129, 0.35)',
      }
    },
  },
  plugins: [],
}
