/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        playFair: ["Playfair Display", "serif"],
        notoSans: ["Noto Sans TC", "serif"],
        notoSerif: ["Noto Serif TC", "serif"],
        freeman: ["Freeman", "serif"],
        roboto: ["Roboto", "serif"],
      },
      colors: {
        white: "#f0f0f0",
        black: "#141414",
        primary: "#F13127",
      },
    },
  },
  plugins: [],
};
