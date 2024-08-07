/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'selector',
  theme: {
    screens: {
      'map-sm': '760px',
    },
    extend: {
      colors: {

        error: '#be6069',
        info: '#5d81ac',
        success: '#a4c18b',
        warning: '#ebca89',
        'dark-1': '#4d576a',
        'dark-2': '#444d5f',
        'dark-3': '#3c4353',
        'dark-4': '#2f3541',
        'light-1': '#f2f4f8',
        'light-2': '#e5e9f0',
        'light-3': '#d8dee9',
        'light-4': '#c1c8d7',
        'sidebar-color': 'rgb(35, 55, 75, 90%)'
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
}
