/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "rgb(var(--ep-primary) / <alpha-value>)",
          hover: "rgb(var(--ep-primary-hover) / <alpha-value>)",
        },
        accent: "rgb(var(--ep-accent) / <alpha-value>)",
        main: "rgb(var(--ep-main) / <alpha-value>)",
        surface: "rgb(var(--ep-surface) / <alpha-value>)",
        ink: {
          DEFAULT: "rgb(var(--ep-ink) / <alpha-value>)",
          muted: "rgb(var(--ep-muted) / <alpha-value>)",
        },
        line: "rgb(var(--ep-line) / <alpha-value>)",
        success: "rgb(var(--ep-success) / <alpha-value>)",
        danger: "rgb(var(--ep-danger) / <alpha-value>)",
        cream: "rgb(var(--ep-soft) / <alpha-value>)",
        sand: "rgb(var(--ep-sand) / <alpha-value>)",
        blush: "rgb(var(--ep-blush) / <alpha-value>)",
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', "system-ui", "sans-serif"],
        sans: ['"Public Sans"', "system-ui", "sans-serif"],
      },
      borderRadius: {
        card: "18px",
        btn: "999px",
      },
      boxShadow: {
        sm2: "0 1px 3px rgba(16,27,58,0.08)",
      },
    },
  },
  plugins: [],
};

