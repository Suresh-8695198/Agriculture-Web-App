/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary Agriculture Green
        primary: {
          50: '#f0f9f4',
          100: '#dcf3e4',
          200: '#bae6cd',
          300: '#87d4ab',
          400: '#4fba83',
          500: '#2d5016', // Main primary green
          600: '#1d3a0f',
          700: '#16290b',
          800: '#0f1c08',
          900: '#0a1205',
        },
        // Supplier Brown/Tan
        supplier: {
          50: '#FDF8F3',
          100: '#F8EFE6',
          200: '#EDD9C7',
          300: '#D9BFA0',
          400: '#C4A579',
          500: '#8B6F47', // Main supplier brown
          600: '#5D4A30',
          700: '#4A3B26',
          800: '#372C1D',
          900: '#241D13',
        },
        // Accent colors
        accent: {
          orange: '#f97316',
          blue: '#3b82f6',
          yellow: '#fbbf24',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'soft': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
        'hover': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '16px',
      },
      animation: {
        'fade-in': 'fadeIn 0.4s ease-out forwards',
        'slide-in': 'slideInRight 0.3s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(20px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
    },
  },
  plugins: [],
}
