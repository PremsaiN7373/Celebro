/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Inter'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        display: ["'Fraunces'", "serif"],
      },
      colors: {
        ink: {
          50: "#f7f7f5",
          100: "#ececea",
          200: "#d8d6d1",
          300: "#b8b4ac",
          400: "#8f8a80",
          500: "#6f6a5f",
          600: "#57534a",
          700: "#46433c",
          800: "#302d28",
          900: "#1c1a17",
        },
        accent: {
          50: "#fdf3f0",
          100: "#fbe4dc",
          200: "#f6c6b3",
          300: "#efa084",
          400: "#e5744f",
          500: "#d8542e",
          600: "#bd4020",
          700: "#9b331c",
          800: "#7c2c1c",
          900: "#66271b",
        },
      },
      boxShadow: {
        soft: "0 1px 2px rgba(28,26,23,0.04), 0 8px 24px -8px rgba(28,26,23,0.10)",
        card: "0 1px 3px rgba(28,26,23,0.06), 0 1px 2px rgba(28,26,23,0.04)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1.25rem",
      },
    },
  },
  plugins: [],
};
