/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["'Inter'", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        display: ["'Playfair Display'", "serif"],
        cinematic: ["'Playfair Display'", "serif"],
      },
      colors: {
        // Celebro Lavender Premium Palette
        purple: {
          50: "#F5F3FF", // Very Light Purple/Lavender
          100: "#EDE9FE", // Light Lavender
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#8B5CF6", // Lavender Accent
          600: "#5B21B6", // Primary Purple
          700: "#4C1D95",
          800: "#3C1577",
          900: "#3B176D", // Deep Purple
        },
        lavender: {
          DEFAULT: "#8B5CF6",
          light: "#EDE9FE",
          verylight: "#F5F3FF",
        },
        accent: {
          50: "#F5F3FF",
          100: "#EDE9FE",
          200: "#DDD6FE",
          300: "#C4B5FD",
          400: "#A78BFA",
          500: "#8B5CF6",
          600: "#5B21B6",
          700: "#4C1D95",
          800: "#3C1577",
          900: "#3B176D",
          950: "#1A0933",
        },
        ink: {
          50: "#F8FAFC",
          100: "#F1F5F9",
          200: "#E2E8F0",
          300: "#CBD5E1",
          400: "#94A3B8",
          500: "#64748B",
          600: "#475569",
          700: "#334155",
          800: "#1E293B",
          900: "#0F172A",
        },
        biz: {
          50: "#FFFDF5",
          100: "#FEF3C7",
          200: "#FDE68A",
          300: "#FCD34D",
          400: "#FBBF24",
          500: "#F59E0B",
          600: "#D97706",
          700: "#B45309",
          800: "#92400E",
          900: "#78350F",
        },
        appbg: {
          DEFAULT: "#FCFAFF",
        },
        txtprimary: {
          DEFAULT: "#17142A",
        },
        txtsecondary: {
          DEFAULT: "#6B6780",
        },
        softborder: {
          DEFAULT: "#E9E4F5",
        },
        status: {
          success: "#3A8D68",
          warning: "#D08A24",
          error: "#C94B63",
        },
        // Backwards compatibility mappings for existing component tokens
        burgundy: {
          50: "#F5F3FF",
          100: "#EDE9FE",
          500: "#5B21B6",
          900: "#3B176D",
        },
        wine: {
          DEFAULT: "#3B176D",
          500: "#3B176D",
          900: "#3B176D",
        },
        champagne: {
          300: "#EDE9FE",
          400: "#8B5CF6",
          500: "#8B5CF6",
          600: "#8B5CF6",
        },
        ivory: {
          DEFAULT: "#FCFAFF",
          50: "#FFFFFF",
          100: "#FCFAFF",
          200: "#FCFAFF",
        },
        charcoal: {
          DEFAULT: "#17142A",
          500: "#17142A",
        },
        warmgray: {
          DEFAULT: "#6B6780",
          500: "#6B6780",
        },
        softbeige: {
          DEFAULT: "#E9E4F5",
          500: "#E9E4F5",
        },
        royal: {
          400: "#8B5CF6",
          500: "#5B21B6",
          600: "#5B21B6",
          700: "#3B176D",
        },
        celebrate: {
          400: "#8B5CF6",
          500: "#8B5CF6",
          600: "#5B21B6",
        },
        noir: {
          DEFAULT: "#3B176D",
          card: "#FFFFFF",
          card2: "#F5F3FF",
        },
      },
      boxShadow: {
        soft: "0 4px 20px rgba(91,33,182,0.06)",
        card: "0 4px 20px rgba(91,33,182,0.06)",
        dropdown: "0 10px 30px -5px rgba(59,23,109,0.12)",
      },
      borderRadius: {
        xl: "0.875rem",
        "2xl": "1rem", // 16px
        button: "0.625rem", // 10px
      },
    },
  },
  plugins: [],
};


