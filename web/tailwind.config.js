/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Forêt Écho-Verdant
        verdant: {
          50: "#f0f9f0",
          100: "#dcf0dc",
          200: "#bce0bc",
          300: "#8ec98e",
          400: "#5fab5f",
          500: "#3d8b3d",
          600: "#2d6f2d",
          700: "#265926",
          800: "#1f471f",
          900: "#0f1f0f",
          950: "#080f08",
        },
        // Néon de l'épée / gateway
        soul: {
          cyan: "#82ffd9",
          magenta: "#ff6bb4",
          gold: "#f0c674",
          lime: "#d4ff8a",
        },
        // Cyber / glitch
        glitch: {
          red: "#ff2850",
          purple: "#b41ec8",
        },
        parchment: "#f5ecd7",
        ink: "#1a1410",
      },
      fontFamily: {
        display: ['"Cinzel"', "serif"],
        body: ['"Inter"', "system-ui", "sans-serif"],
        rune: ['"JetBrains Mono"', "monospace"],
      },
      animation: {
        "pulse-slow": "pulse 4s ease-in-out infinite",
        "float": "float 6s ease-in-out infinite",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "shimmer": "shimmer 2.5s linear infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.6" },
          "50%": { opacity: "1" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
