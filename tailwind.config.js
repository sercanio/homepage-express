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
          primary: '#0284c7',
          secondary: '#c026d3',
          accent: '#a5b4fc',
          neutral: '#ffe4e6',
          'base-100': '#fae8ff',
          info: '#06b6d4',
          success: '#15803d',
          warning: '#eab308',
          error: '#4d7c0f',
        },
        dark: {
          primary: '#9ca3ef',
          secondary: '#e18cc8',
          accent: '#a5b4fc',
          neutral: '#1f2937',
          'base-100': '#152231',
          info: '#06b6d4',
          success: '#15803d',
          warning: '#eab308',
          error: '#ff0705',
        },
      },
    ], // false: only light + dark | true: all themes | array: specific themes like this ["light", "dark", "synthwave"]
    darkTheme: 'dark', // name of one of the included themes for dark mode
    base: true, // applies background color and foreground color for root element by default
    styled: true, // include daisyUI colors and design decisions for all components
    utils: true, // adds responsive and modifier utility classes
    prefix: '', // prefix for daisyUI classnames (components, modifiers and responsive class names. Not colors)
    logs: true, // Shows info about daisyUI version and used config in the console when building your CSS
    themeRoot: ':root', // The element that receives theme color CSS variables
  },
};
