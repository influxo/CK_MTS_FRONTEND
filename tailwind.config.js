/** @type {import('tailwindcss').Config} */
//module.exports =
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Include all your React components and TS files
  ],
  darkMode: 'class', // Disable automatic dark mode detection
  theme: {
    extend: {},
  },
  plugins: [],
};
