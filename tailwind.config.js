/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        midnight: "#090909",
        velvet: "#15110b",
        gold: "#f5c451",
        amber: "#ffdd7a",
        ember: "#2a1e10",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(245,196,81,0.18), 0 16px 60px rgba(0,0,0,0.45)",
      },
      backgroundImage: {
        spotlight:
          "radial-gradient(circle at top, rgba(245,196,81,0.18), transparent 35%), radial-gradient(circle at bottom, rgba(255,221,122,0.12), transparent 25%)",
      },
    },
  },
  plugins: [],
};
