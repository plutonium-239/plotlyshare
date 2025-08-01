import tailwindTypography from '@tailwindcss/typography'
import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,svelte}"],
  theme: {
    extend: {},
  },
  plugins: [tailwindTypography, daisyui],
  daisyui: {
    themes: [
      {
        mytheme: {
          "primary": "#e685b5",
          "secondary": "#22d3ee",
          // "secondary": "#7fe2e7",
          "accent": "#f0abfc",
          // "accent": "#9381FF",
          "neutral": "#ffe4e6",
          "base-100": "#212529",
          "surface": "#212529",
          "info": "#00abff",
          "success": "#22c55e",
          "warning": "#ffbd00",
          "error": "#f43f5e",
        },
      },
    ],
  },
}