/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#fdf8f0',
          100: '#f9edd6',
          200: '#f2d8a8',
          300: '#e9bd70',
          400: '#e0a03e',
          500: '#d48826',
          600: '#b86a1e',
          700: '#964e1b',
          800: '#7a3f1c',
          900: '#66361a',
          950: '#3a1a0b',
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
