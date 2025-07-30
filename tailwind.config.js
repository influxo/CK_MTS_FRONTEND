/** @type {import('tailwindcss').Config} */
//module.exports =
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}", // Include all your React components and TS files
  ],
  darkMode: "class", // Disable automatic dark mode detection
  theme: {
    extend: {
      keyframes: {
        "collapsible-down": {
          from: { height: "0" },
          to: { height: "var(--radix-collapsible-content-height)" },
        },
        "collapsible-up": {
          from: { height: "var(--radix-collapsible-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "collapsible-down": "collapsible-down 150ms ease-out",
        "collapsible-up": "collapsible-up 150ms ease-out",
      },
    },
  },
  plugins: [],
};
