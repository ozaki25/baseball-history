import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        fs: {
          primary: "#006298",
          black: "#010101",
          white: "#ffffff",
          gold: "#b3a369",
          
          blue: {
            50: "#eff6ff",
            100: "#dbeafe", 
            200: "#bfdbfe",
            300: "#93c5fd",
            400: "#60a5fa",
            500: "#006298",
            600: "#006298",
            700: "#005580",
            800: "#004466",
            900: "#003355",
            950: "#002244",
          },
          'gold-scale': {
            50: "#fdfcf7",
            100: "#faf7e8",
            200: "#f4edc4",
            300: "#ede19f",
            400: "#e0d080",
            500: "#b3a369",
            600: "#a0925f",
            700: "#8d7f54",
            800: "#7a6c49",
            900: "#67593e",
            950: "#544633",
          },
          gray: {
            50: "#f9fafb",
            100: "#f3f4f6",
            200: "#e5e7eb",
            300: "#d1d5db",
            400: "#9ca3af",
            500: "#6b7280",
            600: "#4b5563",
            700: "#374151",
            800: "#1f2937",
            900: "#111827",
            950: "#030712",
          },
        },
        result: {
          win: "#10b981",
          lose: "#ef4444",
          draw: "#6b7280",
        },
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      boxShadow: {
        'fighters': '0 4px 6px -1px rgba(0, 98, 152, 0.1), 0 2px 4px -1px rgba(0, 98, 152, 0.06)',
        'fighters-lg': '0 10px 15px -3px rgba(0, 98, 152, 0.1), 0 4px 6px -2px rgba(0, 98, 152, 0.05)',
      },
      borderColor: {
        'fs-blue': '#006298',
        'fs-gold': '#b3a369',
      },
    },
  },
  plugins: [],
} satisfies Config;