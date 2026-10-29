/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#fb6e90',
          80: '#f99ab0',
          60: '#fbc0cf',
          20: '#3b1a26',
        },
        secondary: '#f4f4f5',
        'on-surface': '#f4f4f5',
        tertiary: '#d4d4d8',
        neutral: '#000000',
        page: '#000000',
        surface: {
          DEFAULT: '#0b0b0d',
          2: '#18181b',
        },
        error: '#ff5a67',
        'border-subtle': 'rgba(255, 255, 255, 0.08)',
        'border-strong': 'rgba(255, 255, 255, 0.18)',
      },
      fontFamily: {
        display: ['"Bricolage Grotesque"', 'system-ui', 'sans-serif'],
        sans: ['-apple-system', 'BlinkMacSystemFont', '"Segoe UI"', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'],
      },
      fontSize: {
        'headline-display': ['clamp(3.75rem, 11vw, 11.625rem)', { lineHeight: '1.08', letterSpacing: '-0.055em' }],
        'headline-lg': ['clamp(2.75rem, 6.5vw, 6.5rem)', { lineHeight: '1.12', letterSpacing: '-0.021em' }],
        'headline-md': ['clamp(2.125rem, 4vw, 3.625rem)', { lineHeight: '1.15', letterSpacing: '-0.005em' }],
        'headline-sm': ['2rem', { lineHeight: '2.375rem', letterSpacing: '-0.01em' }], // 32/38
        'body-lg': ['1.125rem', { lineHeight: '1.625rem', letterSpacing: '-0.27px' }], // 18/26
        'body-md': ['1rem', { lineHeight: '1.5rem', letterSpacing: '-0.2px' }], // 16/24
        'body-sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0' }], // 14/20
        'label-lg': ['1rem', { lineHeight: '1.25rem', letterSpacing: '0' }], // 16/20
        'label-md': ['0.875rem', { lineHeight: '1.125rem', letterSpacing: '0' }], // 14/18
        'label-sm': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0' }], // 12/16
        'caption': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0' }], // 12/16
      },
      borderRadius: {
        sm: '4px',
        md: '8px',
        lg: '16px',
        xl: '34px',
        full: '9999px',
      },
      spacing: {
        xs: '2px',
        sm: '10px',
        md: '18px',
        lg: '28px',
        xl: '44px',
        section: '68px',
        gutter: '24px',
      },
      boxShadow: {
        'halo-pink': '0 0 24px -4px rgba(251, 110, 144, 0.4)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    },
  },
  plugins: [],
}
