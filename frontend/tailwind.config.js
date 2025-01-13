/** @type {import('tailwindcss').Config} */

// tailwind.config.js
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#083416", // Verde oscuro
        secondary: "#9AE26E", // Verde claro
        background: "#F4FDF3", // Fondo claro
        accent: "#39AED9",
      },
    },
  },
  plugins: [],
};
