/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{js,ts,html}", "./public/index.html"],
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
        // Keep gray for neutral UI elements
        gray: {
          50: "#f9fafb",
          100: "#f3f4f6",
          200: "#e5e7eb",
          300: "#d1d5db",
          400: "#9ca3af",
          500: "#6b7280",
          600: "#4b5563",
          700: "#374151",
          800: "#1f2937",
          900: "#111827",
          950: "#030712",
        },
      },
    },
  },
  plugins: [],
  // Ensure these important TailwindCSS classes aren't purged
  safelist: [
    "bg-edoc-100",
    "bg-edoc-700",
    "border-edoc-200",
    "text-edoc-800",
    "text-green-700",
    "text-red-600",
    "text-gray-600",
    "hover:bg-edoc-800",
    "text-white",
    "bg-white",
  ],
};
