## run the server

```bash
node ./bin/app
```

## build and minify css
### to build run

```bash
npx tailwindcss -i src/styles/input.css -o src/styles/tailwind-output.css --watch
```
this will watch src directory and continuously build tailwindCSS input to an output file named tailwind-output.css.

### to minify run

```bash
npx cleancss -o public/styles/styles.css src/styles/tailwind-output.css
```
this will minify tailwindCSS output named tailwind-output.css to a css file in public/styles named styles.css