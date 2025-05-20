module.exports = {
  content: [
    './src/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'ui-sans-serif', 'system-ui'],
      },
      colors: {
        primary: {
          DEFAULT: '#000000', // Black
        },
        accent: {
          DEFAULT: '#000000', // Black
        },
        background: '#FFFFFF', // White
        card: '#FFFFFF', // White
        border: '#E5E7EB',
      },
    },
  },
  plugins: [],
}; 