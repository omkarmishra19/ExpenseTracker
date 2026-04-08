/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#111827",
        mist: "#eef2ff",
        coral: "#f97316",
        sand: "#fff7ed",
        pine: "#14532d"
      },
      boxShadow: {
        float: "0 30px 80px rgba(15, 23, 42, 0.16)"
      },
      fontFamily: {
        display: ["Poppins", "ui-sans-serif", "system-ui", "sans-serif"],
        body: ["Manrope", "ui-sans-serif", "system-ui", "sans-serif"]
      },
      backgroundImage: {
        "auth-grid":
          "linear-gradient(rgba(255,255,255,0.55) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.55) 1px, transparent 1px)"
      }
    }
  },
  plugins: []
};
