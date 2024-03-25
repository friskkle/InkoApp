/** @type {import('tailwindcss').Config} */
module.exports = {
  mode: 'jit',
  content: ["./src/**/*.{html,js,tsx,ts}"],
  purge: ["./src/**/*.{html,js,tsx,ts}"],
  theme: {
    extend: {},
  },
  plugins: [],
  theme: {
    screens: {
      sm: "640px",
      md: "768px",
      lg: "1024px",
      xl: "1280px",
      "2xl": "1536px",
    },
  },
}

