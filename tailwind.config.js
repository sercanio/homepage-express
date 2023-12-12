/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['views/**/*.pug'],
  purge: {
    enabled: true,
    content: ['views/**/*.pug'],
  },
  theme: {
    extend: {},
  },
  corePlugins: {
    // preflight: false,
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: [
      {
        light: {
          primary: '#214145',
          secondary: '#c7e7df',
          accent: '#2138fe',
          neutral: '#f7cedc',
          'base-100': '#fffefd',
          'base-200': '#f4f2f1',
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
