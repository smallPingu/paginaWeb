/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fff0f3',
          100: '#ffe0e8',
          200: '#ffc0d0',
          300: '#ff8097',
          400: '#ff4063',
          500: '#FF0037',
          600: '#d6002e',
          700: '#ad0025',
          800: '#85001c',
          900: '#5c0013',
          950: '#33000b',
        },
        complementary: {
          50: '#f2f5ff',
          100: '#e0eaff',
          200: '#c0d5ff',
          300: '#a0bfff',
          400: '#8cb1ff',
          500: '#79A4FF',
          600: '#5a8ae6',
          700: '#3b70cc',
          800: '#1c55b3',
          900: '#003b99',
          950: '#001d4d',
        },
        accent: {
          50: '#fff8e6',
          100: '#fff0cc',
          200: '#ffe199',
          300: '#ffd166',
          400: '#ffc833',
          500: '#FFB800',
          600: '#d99a00',
          700: '#b37d00',
          800: '#8c5f00',
          900: '#664200',
          950: '#402600',
        },
        paper: {
          light: '#faf7f2',
          DEFAULT: '#f5f0e8',
          dark: '#e8e0d0',
        },
        ink: {
          light: '#4a4a4a',
          DEFAULT: '#2d2d2d',
          dark: '#1a1a1a',
        },
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
      },
      animation: {
        'fade-in': 'fadeIn 0.8s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(30px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
};
