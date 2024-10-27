import daisyui from 'daisyui';

/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{html,js,svelte}"],
  theme: {
    extend: {},
  },
  plugins: [daisyui],
  daisyui: {
    themes: [
      {
        mytheme: {
          "primary": "#e685b5",
          "secondary": "#22d3ee",
          "accent": "#f0abfc",
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