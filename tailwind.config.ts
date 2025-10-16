import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'card': 'var(--card-bg)',
        'card-elevated': 'var(--card-bg-elevated)',
        'card-border': 'var(--card-border)',
        'card-hover': 'var(--card-hover)',
        'text-primary': 'var(--text-primary)',
        'text-secondary': 'var(--text-secondary)',
        'text-muted': 'var(--text-muted)',
        'input-bg': 'var(--input-bg)',
        'link': 'var(--link)',
        'link-hover': 'var(--link-hover)'
      }
    }
  },
  plugins: [],
} satisfies Config;
