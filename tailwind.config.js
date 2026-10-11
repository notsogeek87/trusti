// Palette « Ciel & encre bleue » : indigo = bleu nuit (principale), purple/blue/pink = bleu franc (accent),
// slate = neutres bleutés ; fond uni #E9F0F6 (voir src/styles/index.css). Les notes A à E gardent leurs couleurs.
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Nunito', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        lg: '0.875rem',
        xl: '1.25rem',
        '2xl': '1.5rem',
        '3xl': '2.5rem',
      },
      boxShadow: {
        sm: '0 2px 12px rgba(31, 58, 95, 0.08)',
        DEFAULT: '0 2px 12px rgba(31, 58, 95, 0.10)',
      },
      colors: {
        white: '#FFFFFF',
        indigo: { 50: '#EEF3F9', 100: '#DCE7F3', 200: '#B9CFE6', 300: '#8EAED2', 400: '#5E86B5', 500: '#3B6498', 600: '#1F3A5F', 700: '#162B47', 800: '#0F1F35', 900: '#0A1526', 950: '#060D18' },
        purple: { 50: '#EBF3FA', 100: '#D3E5F4', 200: '#A8CBE8', 300: '#7BAEDB', 400: '#5595CF', 500: '#3B82C4', 600: '#2F6BA5', 700: '#265786', 800: '#1E4468', 900: '#17334E', 950: '#0E2033' },
        blue: { 50: '#EBF3FA', 100: '#D3E5F4', 200: '#A8CBE8', 300: '#7BAEDB', 400: '#5595CF', 500: '#3B82C4', 600: '#2F6BA5', 700: '#265786', 800: '#1E4468', 900: '#17334E', 950: '#0E2033' },
        pink: { 50: '#EBF3FA', 100: '#D3E5F4', 200: '#A8CBE8', 300: '#7BAEDB', 400: '#5595CF', 500: '#3B82C4', 600: '#2F6BA5', 700: '#265786', 800: '#1E4468', 900: '#17334E', 950: '#0E2033' },
        slate: { 50: '#F4F8FB', 100: '#E9F0F5', 200: '#DCE8EF', 300: '#B8C8D5', 400: '#6B7C8D', 500: '#5B6B7D', 600: '#44546A', 700: '#34445A', 800: '#1B2A3A', 900: '#121C27', 950: '#0A1119' },
        nuit: '#1F3A5F',
        azur: '#3B82C4',
      },
    },
  },
  plugins: [],
}
