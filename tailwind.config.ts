import type { Config } from 'tailwindcss';

export default {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        fs: {
          header: '#016298',
          background: '#FFFFFF',
          altBackground: '#E5E5E5',
          text: '#000000',
          link: '#959595',
        },
        background: 'var(--background)',
        foreground: 'var(--foreground)',
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        mono: ['var(--font-geist-mono)', 'monospace'],
      },
      boxShadow: {
        fs: '0 4px 6px -1px rgba(0, 98, 152, 0.1), 0 2px 4px -1px rgba(0, 98, 152, 0.06)',
        'fs-lg': '0 10px 15px -3px rgba(0, 98, 152, 0.1), 0 4px 6px -2px rgba(0, 98, 152, 0.05)',
      },
      borderColor: {
        // ボーダー用には公式パレットのヘッダー色や交互背景を参照してください
        header: '#016298',
        altBackground: '#E5E5E5',
      },
    },
  },
  plugins: [],
} satisfies Config;
