/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    container: false,
    extend: {
      colors: {
        /* Brand blue scale — ported 1:1 from the LauncherDesk design system
           (DutyLaunch Solutions' own sister product) so every DutyLaunch
           surface now shares one family palette. */
        ink: {
          DEFAULT: '#0F1C2E', // --text
          900: '#0B1F48', // brand-900
          800: '#132952', // brand-800 — dark-section background
          700: '#1A3665', // brand-700
          600: '#1E4080', // brand-600 — blue-dark
          500: '#1D5DB8', // brand-500 — primary action blue
        },
        slate: {
          700: '#374151', // --text-2
          600: '#4B5768',
          500: '#6B7280', // --text-3
          400: '#9CA3AF', // --text-4
          300: '#C6CCD6',
          200: '#E2E5EA',
          100: '#F1F5F9', // --bg-2
        },
        /* Primary action colour, aliased to the same brand-blue scale. */
        azure: {
          DEFAULT: '#1D5DB8',
          700: '#132952',
          600: '#1E4080',
          500: '#1D5DB8',
          400: '#2B72D4',
          300: '#4A8FE8',
          200: '#93C5FD',
          100: '#DBEAFE',
          50: '#EFF6FF',
        },
        /* Warm neutral, reserved for global-mobility and documentation surfaces. */
        sand: {
          DEFAULT: '#E9E2D6',
          200: '#F3EFE7',
          300: '#E9E2D6',
          400: '#D9CEBB',
        },
        amber: {
          DEFAULT: '#D97706',
          600: '#B45309',
          500: '#D97706',
          200: '#FDE9C8',
          50: '#FFFBEB',
        },
        paper: '#F8FAFC', // --bg
        line: 'rgba(15,28,46,0.09)',
        success: '#059669',
        danger: '#DC2626',
        /* Second accent — used only for the ATS/product glow, so it reads as
           a deliberate highlight rather than a second theme. */
        violet: {
          DEFAULT: '#6D4AE8',
          600: '#5A38D6',
          500: '#6D4AE8',
          400: '#8C6DFB',
          200: '#DCD2FC',
        },
      },
      fontFamily: {
        sans: ['Manrope', 'system-ui', '-apple-system', 'Segoe UI', 'sans-serif'],
        display: ['Manrope', 'system-ui', '-apple-system', 'sans-serif'],
      },
      fontSize: {
        caption: ['0.75rem', { lineHeight: '1.1rem', letterSpacing: '0.02em' }],
        small: ['0.875rem', { lineHeight: '1.4rem' }],
        body: ['1rem', { lineHeight: '1.7rem' }],
        lead: ['1.125rem', { lineHeight: '1.85rem' }],
        h3: ['1.375rem', { lineHeight: '1.85rem', letterSpacing: '-0.015em' }],
        h2: ['clamp(1.85rem, 1.2rem + 2vw, 2.75rem)', { lineHeight: '1.12', letterSpacing: '-0.03em' }],
        h1: ['clamp(2.3rem, 1.3rem + 3.6vw, 3.75rem)', { lineHeight: '1.05', letterSpacing: '-0.035em' }],
        display: ['clamp(2.85rem, 1.3rem + 5.8vw, 5.5rem)', { lineHeight: '0.98', letterSpacing: '-0.04em' }],
      },
      spacing: {
        section: 'clamp(4rem, 2rem + 6vw, 7.5rem)',
        gutter: 'clamp(1.25rem, 0.5rem + 2vw, 2.5rem)',
      },
      maxWidth: {
        shell: '82.5rem',
        prose: '68ch',
      },
      borderRadius: {
        xs: '6px', // r1 — badges, tags
        sm: '10px', // r2 — buttons, inputs
        DEFAULT: '10px',
        lg: '14px', // r3 — cards
        xl: '20px', // r4 — panels
      },
      boxShadow: {
        xs: '0 1px 3px rgba(15,28,46,.06), 0 1px 2px rgba(15,28,46,.04)',
        raise: '0 2px 8px rgba(15,28,46,.06), 0 1px 3px rgba(15,28,46,.04)',
        panel: '0 32px 64px rgba(15,28,46,.16), 0 8px 24px rgba(15,28,46,.08)',
        lift: '0 8px 24px rgba(15,28,46,.08), 0 2px 8px rgba(15,28,46,.04)',
        hover: '0 12px 32px rgba(15,28,46,.10), 0 2px 8px rgba(15,28,46,.04)',
        blue: '0 8px 24px rgba(29,93,184,.24)',
        'blue-lg': '0 14px 32px rgba(29,93,184,.36)',
        glow: '0 0 0 1px rgba(255,255,255,.06), 0 30px 80px -30px rgba(109,74,232,.45)',
        focus: '0 0 0 3px rgba(74,143,232,.35)',
      },
      backgroundImage: {
        'grid-fade':
          'linear-gradient(to right, rgba(15,28,46,.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,28,46,.06) 1px, transparent 1px)',
        'ink-glow':
          'radial-gradient(60% 55% at 18% 12%, rgba(29,93,184,.35), transparent 60%), radial-gradient(50% 45% at 88% 82%, rgba(43,114,212,.28), transparent 60%)',
        'brand-grad': 'linear-gradient(118deg, #1A3665 0%, #1D5DB8 52%, #2B72D4 100%)',
        'brand-grad-hover': 'linear-gradient(118deg, #132952 0%, #1A3665 52%, #1D5DB8 100%)',
        'btn-grad': 'linear-gradient(180deg, #2B72D4 0%, #1D5DB8 60%, #1E4080 100%)',
      },
      transitionTimingFunction: {
        entrance: 'cubic-bezier(.16,.84,.44,1)',
      },
      keyframes: {
        'meter-fill': { from: { width: '0%' }, to: { width: 'var(--meter)' } },
        'rise': { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'none' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        'glow-pan': { from: { transform: 'translate3d(0,0,0) scale(1)' }, to: { transform: 'translate3d(-1.8%,1.8%,0) scale(1.04)' } },
      },
      animation: {
        'meter-fill': 'meter-fill 1.1s cubic-bezier(.16,.84,.44,1) both',
        rise: 'rise .6s cubic-bezier(.16,.84,.44,1) both',
        float: 'float 6s ease-in-out infinite',
        'glow-pan': 'glow-pan 20s ease-in-out infinite alternate',
      },
    },
  },
  plugins: [],
};
