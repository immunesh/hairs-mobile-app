module.exports = {
  content: ["./App.tsx", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: {
          purple: {
            DEFAULT: "#5B21B6",
            dark: "#2B0A45",
            light: "#8B5CF6",
          },
          white: "#F5F3FF",
        },
      },
    },
  },
  plugins: [],
};
