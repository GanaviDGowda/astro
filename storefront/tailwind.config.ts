import defaultTheme from 'tailwindcss/defaultTheme';
import type { Config } from 'tailwindcss';
import {
  themeColors,
  themeGradients,
  themePalette,
  themeShadows,
} from './app/theme/tokens';

export default {
  content: ['./app/**/*.{js,ts,jsx,tsx}'],
  plugins: [require('@tailwindcss/forms')],
  important: '#app',

  theme: {
    extend: {
      fontFamily: {
        sans: ['"Cormorant Garamond"', ...defaultTheme.fontFamily.sans],
        serif: ['Cinzel', ...defaultTheme.fontFamily.serif],
        display: ['"Yatra One"', ...defaultTheme.fontFamily.serif],
      },
      colors: {
        brand: themeColors.ink,
        surface: themeColors.surface,
        'surface-muted': themeColors.surfaceMuted,
        'surface-soft': themeColors.surfaceSoft,
        'surface-cool': themeColors.surfaceCool,
        'surface-cool-deep': themeColors.surfaceCoolDeep,
        ink: themeColors.ink,
        accent: themeColors.accent,
        selection: themeColors.selection,
        'hero-pack': themeColors.surfaceSoft,
        'hero-pack-border': themeColors.heroPackBorder,
        'razorpay-theme': themeColors.razorpayTheme,
        primary: themePalette.primary,
        secondary: themePalette.secondary,
        saffron: themePalette.saffron,
        sandalwood: themePalette.sandalwood,
        'temple-brown': themePalette.templeBrown,
      },
      backgroundImage: {
        'checkout-radial': themeGradients.checkoutRadial,
        'hero-spotlight': themeGradients.heroSpotlight,
      },
      boxShadow: {
        divider: themeShadows.divider,
        'hero-pack': themeShadows.heroPack,
      },
      borderRadius: {
        'hero-pack': '14px',
      },
      animation: {
        dropIn: 'dropIn 0.2s ease-out',
        'spin-slow': 'spin 60s linear infinite',
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
