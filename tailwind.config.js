/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        teal: {
          950: "#07211f",
          900: "#0d2f2c",
          800: "#123c3c",
          700: "#1a4d4a",
        },
        rust: {
          400: "#e0975a",
          500: "#d97b3f",
          600: "#c9622a",
          700: "#a94f21",
        },
        cream: {
          50: "#faf3e6",
          100: "#f2e6d0",
          200: "#e8d6b3",
        },
        gold: {
          400: "#f0c675",
          500: "#e8b34d",
          600: "#cf9a35",
        },
        navy: {
          900: "#0e1830",
          800: "#16213f",
        },
      },
      fontFamily: {
        display: [
          "var(--font-display)",
          "Poppins",
          "Segoe UI",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
        body: [
          "var(--font-body)",
          "Inter",
          "Segoe UI",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      backgroundImage: {
        "hero-gradient":
          "radial-gradient(120% 120% at 15% 0%, #1a4d4a 0%, #0d2f2c 38%, #16213f 68%, #3a1f14 100%)",
      },
    },
  },
  plugins: [],
};
