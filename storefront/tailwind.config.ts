import colors from 'tailwindcss/colors';
import type { Config } from 'tailwindcss';
import forms from '@tailwindcss/forms';

export default {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  plugins: [forms],

  theme: {
    extend: {
      fontFamily: {
        sans: ['Quattrocento', 'sans-serif'],
      },
      colors: {
        primary: {
          50: '#fff6ef',
          100: '#ffe9d6',
          200: '#ffd1ad',
          300: '#ffb274',
          400: '#ff9543',
          500: '#f7791d',
          600: '#df6510',
          700: '#b84e0f',
          800: '#943f12',
          900: '#783713',
        },
        secondary: colors.emerald,
        brand: '#2f241f',
      },
      animation: {
        dropIn: 'dropIn 0.2s ease-out',
      },
      keyframes: {
        dropIn: {
          '0%': { transform: 'translateY(-100px)' },
          '100%': { transform: 'translateY(0)' },
        },
      },
    },
  },
} satisfies Config;
