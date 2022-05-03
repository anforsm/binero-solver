module.exports = {
  content: [
      "./src/**/*.{js,jsx,ts,tsx}"
   ],
  theme: {
    extend: {
      gridTemplateRows: {
        "9": "repeat(9, minmax(0, 1fr))",
        "10": "repeat(10, minmax(0, 1fr))"
      }
    },
  },
  plugins: [],
}
