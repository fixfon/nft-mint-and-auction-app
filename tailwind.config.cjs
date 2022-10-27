/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        highlight: '#a80f78',
        'highlight-300': '#c257a1',
        neutral: '#f5f5f5',
        complementary: 'rgb(31, 41, 55)',
      },
      backgroundColor: {
        primary: 'rgb(31, 41, 55)',
        secondary: '#a80f78',
      },
      boxShadow: {
        neutral: 'inset 0 0 0 0 #f5f5f5',
        hover: 'inset 0 0 0 150px #f5f5f5',
      },
    },
  },
  plugins: [],
};
