/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: {
          950: "#241C15",
          900: "#2B2119",
          800: "#3A2E23",
          700: "#4E4033",
          600: "#6B5B4A",
          500: "#8A7A67"
        },
        paper: {
          50: "#FDFBF6",
          100: "#F7F2E7",
          200: "#EFE7D4"
        },
        signal: {
          600: "#C1613F",
          500: "#D97757",
          400: "#E2946F",
          100: "#FBEAE1"
        },
        unlock: {
          600: "#5C7A44",
          500: "#74915A",
          100: "#E7EEDC"
        },
        pending: {
          600: "#B27A1F",
          500: "#D6A143",
          100: "#FBF0DC"
        },
        line: "#E7DFCE"
      },
      fontFamily: {
        display: ["'Fraunces'", "serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'IBM Plex Mono'", "monospace"]
      },
      fontSize: {
        "page-title": ["1.75rem", { lineHeight: "2.25rem", letterSpacing: "-0.01em", fontWeight: "600" }],
        "section-title": ["1.125rem", { lineHeight: "1.5rem", fontWeight: "600" }],
        "amount-lg": ["2.5rem", { lineHeight: "1", letterSpacing: "-0.02em", fontWeight: "600" }],
        "amount-md": ["1.5rem", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "600" }]
      },
      boxShadow: {
        card: "0 1px 2px rgba(36, 28, 21, 0.04), 0 8px 24px -12px rgba(36, 28, 21, 0.14)",
        panel: "0 20px 60px -20px rgba(36, 28, 21, 0.28)"
      },
      borderRadius: {
        xl2: "1.5rem"
      },
      backgroundImage: {
        ledger:
          "radial-gradient(circle at 1px 1px, rgba(36,28,21,0.08) 1px, transparent 0)"
      }
    }
  },
  plugins: []
};
