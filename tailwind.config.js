/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,html}", "./public/**/*.html"],
  theme: {
    extend: {
      colors: {
        edoc: {
          50: "#f6fffa",
          100: "#ecfdf5",
          200: "#d1fae5",
          300: "#a7f3d0",
          400: "#6ee7b7",
          500: "#34d399",
          600: "#10b981",
          700: "#059669",
          800: "#065f46",
          900: "#064e3b",
          950: "#022c22",
        },
      },
    },
  },
  plugins: [],
};
