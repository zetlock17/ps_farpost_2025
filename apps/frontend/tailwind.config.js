import uiKitConfig from 'ui-kit/tailwind.config.js';

/** @type {import('tailwindcss').Config} */
export default {
  presets: [uiKitConfig],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "../../packages/ui-kit/src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
