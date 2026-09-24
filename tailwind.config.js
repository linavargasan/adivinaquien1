/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        pine: '#173226',
        pineDark: '#0f2119',
        paper: '#F6EFDE',
        gold: '#C9A227',
        berry: '#A9333E',
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        body: ['var(--font-work)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
