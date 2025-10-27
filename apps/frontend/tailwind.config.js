import uiKitConfig from 'ui-kit/tailwind.config.js';

const uiKitSafelist = Array.isArray(uiKitConfig?.safelist) ? uiKitConfig.safelist : [];

/** @type {import('tailwindcss').Config} */
export default {
  presets: [uiKitConfig],
  safelist: [
    ...uiKitSafelist,
    "bg-orange-100",
    "hover:bg-slate-100",
    "text-orange-500",
    "text-slate-500",
    "hover:bg-[#e47036]",
    "disabled:cursor-not-allowed",
    "disabled:opacity-60",
  ],
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
