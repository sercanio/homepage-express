/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['views/**/*.pug'],
  theme: {
    extend: {},
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        light: {
          primary: '#0151ff',
          secondary: '#9c4bfe',
          accent: '#2138fe',
          neutral: '#f7cedc',
          'base-100': '#faebff',
          info: '#00a9e0',
          success: '#188044',
          warning: '#ffa908',
          error: '#567d14',
        },
      },
    ], // false: only light + dark | true: all themes | array: specific themes like this ["light", "dark", "synthwave"]
    // darkTheme: 'dark', // name of one of the included themes for dark mode
    base: true, // applies background color and foreground color for root element by default
    styled: true, // include daisyUI colors and design decisions for all components
    utils: true, // adds responsive and modifier utility classes
    prefix: '', // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
    logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
    themeRoot: ':root', // The element that receives theme color CSS variables
  },
};
