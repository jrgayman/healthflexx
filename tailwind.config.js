module.exports = {
  content: ['./src/**/*.{html,js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#78B6BA',
        'primary-dark': '#609295',
        'primary-light': '#9DC9CC',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
  ],
}
