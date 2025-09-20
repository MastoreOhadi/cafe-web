import type { Config } from "tailwindcss";
import animatePlugin from 'tailwindcss-animate';

export default {
  content: [
    "./src/**/*.{html,ts}",
    './src/app/shared/ui/button/**/*.{ts,html}',
  ],
  darkMode: 'class',
   plugins: [
      animatePlugin,
   ],
} satisfies Config;
