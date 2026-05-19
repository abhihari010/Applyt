import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx,js,jsx}"],
  theme: {
    extend: {
      // Brand Typography System
      fontFamily: {
        display: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"], // Headlines
        sans: ['"Plus Jakarta Sans"', "system-ui", "sans-serif"], // Body text
        mono: ['"IBM Plex Mono"', "ui-monospace", "monospace"],
      },

      // Brand Color System
      colors: {
        brand: {
          // Primary - tempered evergreen
          50: "#edf7f4",
          100: "#d5ebe4",
          200: "#add8cc",
          300: "#7cbeae",
          400: "#4e9e8f",
          500: "#2f7e72",
          600: "#1f5f56",
          700: "#1c4f49",
          800: "#193f3b",
          900: "#163431",
          950: "#0a211f",
        },
        accent: {
          // Accent - muted copper
          50: "#fbf1ea",
          100: "#f5dfcf",
          200: "#eab995",
          300: "#dd9666",
          400: "#c97745",
          500: "#b15d35",
          600: "#944629",
          700: "#793623",
          800: "#622e21",
          900: "#512820",
        },
        neutral: {
          // Neutral with paper/ink character
          50: "#fbfaf6",
          100: "#f7f6f2",
          200: "#eeece4",
          300: "#ded9cb",
          400: "#b9b19f",
          500: "#8c8373",
          600: "#686154",
          700: "#4f493f",
          800: "#35322c",
          900: "#20201d",
          950: "#121210",
        },
        success: {
          light: "#d1fae5",
          DEFAULT: "#10b981",
          dark: "#059669",
        },
        warning: {
          light: "#fef3c7",
          DEFAULT: "#f59e0b",
          dark: "#d97706",
        },
        error: {
          light: "#fee2e2",
          DEFAULT: "#ef4444",
          dark: "#dc2626",
        },
      },

      // Spacing Scale (extended)
      spacing: {
        "18": "4.5rem",
        "88": "22rem",
        "100": "25rem",
        "112": "28rem",
        "128": "32rem",
      },

      // Border Radius System
      borderRadius: {
        sm: "0.25rem", // 4px
        DEFAULT: "0.5rem", // 8px
        md: "0.75rem", // 12px
        lg: "1rem", // 16px
        xl: "1.5rem", // 24px
        "2xl": "2rem", // 32px
        "3xl": "3rem", // 48px
      },

      // Shadow Depth System
      boxShadow: {
        soft: "0 2px 10px rgba(44, 40, 32, 0.05)",
        "soft-lg": "0 12px 32px rgba(44, 40, 32, 0.08)",
        "soft-xl": "0 24px 70px rgba(44, 40, 32, 0.11)",
        "elevation-1":
          "0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)",
        "elevation-2":
          "0 4px 6px rgba(0, 0, 0, 0.07), 0 2px 4px rgba(0, 0, 0, 0.05)",
        "elevation-3":
          "0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)",
        "elevation-4":
          "0 20px 25px rgba(0, 0, 0, 0.1), 0 10px 10px rgba(0, 0, 0, 0.04)",
        glow: "0 16px 36px rgba(31, 95, 86, 0.16)",
        "glow-accent": "0 16px 36px rgba(177, 93, 53, 0.16)",
      },

      // Animation System
      animation: {
        "fade-in": "fadeIn 0.5s ease-out",
        "fade-in-up": "fadeInUp 0.6s ease-out",
        "slide-in-right": "slideInRight 0.5s ease-out",
        "slide-in-left": "slideInLeft 0.5s ease-out",
        "scale-in": "scaleIn 0.3s ease-out",
        float: "float 3s ease-in-out infinite",
        "pulse-soft": "pulseSoft 2s ease-in-out infinite",
      },

      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(-20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(20px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.9)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        pulseSoft: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.8" },
        },
      },

      // Typography Scale
      fontSize: {
        xs: ["0.75rem", { lineHeight: "1rem" }],
        sm: ["0.875rem", { lineHeight: "1.25rem" }],
        base: ["1rem", { lineHeight: "1.5rem" }],
        lg: ["1.125rem", { lineHeight: "1.75rem" }],
        xl: ["1.25rem", { lineHeight: "1.75rem" }],
        "2xl": ["1.5rem", { lineHeight: "2rem" }],
        "3xl": ["1.875rem", { lineHeight: "2.25rem" }],
        "4xl": ["2.25rem", { lineHeight: "2.5rem" }],
        "5xl": ["3rem", { lineHeight: "1" }],
        "6xl": ["3.75rem", { lineHeight: "1" }],
        "7xl": ["4.5rem", { lineHeight: "1" }],
        "8xl": ["6rem", { lineHeight: "1" }],
      },

      // Backdrop Blur
      backdropBlur: {
        xs: "2px",
      },
    },
  },
  plugins: [],
};

export default config;
