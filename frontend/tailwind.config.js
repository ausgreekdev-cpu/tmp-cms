/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        sidebar: { DEFAULT: '#0f172a', hover: '#1e293b', text: '#94a3b8', active: '#fff' },
      }
    },
  },
  plugins: [],
}
