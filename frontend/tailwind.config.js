/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: "#1DA1F2",
          dark: "#0d8bd9",
        },
        surface: {
          0: "#000000",
          1: "#0a0a0a",
          2: "#111111",
          3: "#1a1a1a",
          4: "#222222",
        },
        ink: {
          primary: "#e7e9ea",
          secondary: "#71767b",
          muted: "#3e4144",
        },
      },
      fontFamily: {
        sans: ['"DM Sans"', "sans-serif"],
        mono: ['"JetBrains Mono"', "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.2s ease-out",
        "slide-up": "slideUp 0.25s ease-out",
        "pulse-like": "pulseLike 0.35s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(8px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseLike: {
          "0%": { transform: "scale(1)" },
          "50%": { transform: "scale(1.35)" },
          "100%": { transform: "scale(1)" },
        },
      },
    },
  },
  plugins: [],
};