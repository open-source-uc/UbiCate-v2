/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      screens: {
        tablet: '768px',
        desktop: '1154px',
      },
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
        'sidebar-color': 'rgb(35, 55, 75, 90%)',
        'blue-location': '#015FFF',
        'brown-dark': '#150A04',
        'brown-medium': '#39302B',
        'brown-light': '#8A817C',
        'white-ubi': '#F9F8F3',
        'pink-option': '#E86A92',
        'red-option': '#EF233C',
        'green-option': '#98CE00',
        'cyan-option': '#03B5AA',
        'orange-option': '#F58A07'
      },
      fontSize: {
  			'4xl': [
  				'3.25rem',
  				{
  					lineHeight: '1.1'
  				}
  			],
  			'3xl': [
  				'3rem',
  				{
  					lineHeight: '1.2'
  				}
  			],
  			'2xl': [
  				'2.5rem',
  				{
  					lineHeight: '1.2'
  				}
  			],
  			xl: [
  				'1.5rem',
  				{
  					lineHeight: '1.3'
  				}
  			],
  			lg: [
  				'1.25rem',
  				{
  					lineHeight: '1.4'
  				}
  			],
  			md: [
  				'1rem',
  				{
  					lineHeight: '1.5'
  				}
  			]
  		},
  		fontFamily: {
  			'instrument-sans': [
  				'Instrument Sans',
  				'sans-serif'
  			]
  		},
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic':
          'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
      },
      borderRadius: {
        'menu': '2.1rem',
      }
    },
  },
  plugins: [],
}
