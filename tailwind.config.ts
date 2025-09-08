import type { Config } from 'tailwindcss'
import typography from '@tailwindcss/typography'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './config/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        fg: 'var(--fg)',
        muted: 'var(--muted)',
        primary: {
          DEFAULT: 'var(--primary)',
          fg: 'var(--primary-fg)'
        },
        secondary: {
          DEFAULT: 'var(--secondary)',
          fg: 'var(--secondary-fg)'
        },
        danger: {
          DEFAULT: 'var(--danger)',
          fg: 'var(--danger-fg)'
        }
      },
      borderRadius: {
        DEFAULT: '0.6rem',
        lg: '0.9rem',
        xl: '1.2rem'
      }
    },
  },
  plugins: [typography],
}

export default config
