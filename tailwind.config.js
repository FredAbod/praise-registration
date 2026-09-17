/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#1a120c",
          900: "#241810",
          800: "#3a281c",
          700: "#4f3828",
        },
        bark: {
          400: "#a67c52",
          500: "#8b5e3c",
          600: "#6f4a2f",
          700: "#5a3b26",
        },
        parchment: {
          50: "#f7f0e4",
          100: "#efe4d0",
          200: "#e2d0b0",
          300: "#d4bc94",
        },
        ember: {
          400: "#c4844a",
          500: "#b56e35",
          600: "#9a5a28",
        },
      },
      fontFamily: {
        display: [
          "var(--font-display)",
          "Libre Baskerville",
          "Georgia",
          "serif",
        ],
        body: [
          "var(--font-body)",
          "Source Sans 3",
          "Segoe UI",
          "system-ui",
          "sans-serif",
        ],
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(120% 100% at 50% 0%, #4f3828 0%, #241810 45%, #1a120c 100%)",
        "parchment-wash":
          "linear-gradient(165deg, #efe4d0 0%, #e2d0b0 40%, #d4bc94 100%)",
      },
    },
  },
  plugins: [],
};
