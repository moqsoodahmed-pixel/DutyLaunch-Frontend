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
        /* ================================================================
         * GLACIER DESIGN SYSTEM — additive premium layer.
         * Nothing above this line changes meaning or gets removed; every
         * existing className in the app keeps rendering exactly as before.
         * These are new tokens for the premium visual pass, used only where
         * a page is explicitly upgraded to the Glacier treatment.
         * ================================================================ */

        /* Backgrounds: Crystal White → a soft frosty blue-grey. Named per
           the brief (crystal/ice/glacier/snow) but implemented as one
           graduated scale so they read as one coherent surface family. */
        glacier: {
          50: '#FDFEFF', // Crystal White — near-pure white, the base canvas
          100: '#F8FBFE', // Ice White
          200: '#F1F6FC', // Glacier White — the default premium section bg
          300: '#E7EFF9', // Snow White (slightly more presence, for panels)
          400: '#D7E4F3', // Very Light Silver Blue — borders/dividers on glacier bg
        },
        /* Frozen Blue — a cooler, lighter blue than `azure` (which stays the
           primary brand/action colour everywhere it's already used). Frost
           is for icy highlights, glows and the crystal 3D material only. */
        frost: {
          200: '#D6F0FA',
          300: '#AEE3F5',
          400: '#7DD3EF',
          500: '#4FC1E6', // Frozen Blue
          600: '#2FA3CC',
        },
        /* Aurora Purple / Light Lavender — ambient background lighting only
           (mesh glows, aurora blobs). Deliberately softer/lower-saturation
           than `violet`, which stays reserved for solid AI-feature UI (the
           assistant orb, its badges) per that existing precedent. Same hue
           family, different job: aurora = atmosphere, violet = a specific
           product's accent. */
        aurora: {
          200: '#EDE6FB',
          300: '#DCD0F7',
          400: '#C4AEF2', // Light Lavender
          500: '#A98CEA', // Aurora Purple
        },
        /* Soft Cream — a warm ambient glow layer, distinct from `sand`
           (which stays reserved for global-mobility/documentation sections
           specifically). Cream is for the general atmospheric background. */
        cream: {
          100: '#FFFBF3',
          200: '#FDF3E2', // Soft Cream
          300: '#FBE8C8',
        },
        /* Tiny Cyan Tint — the smallest, most restrained glow accent. */
        cyantint: {
          300: '#CFF7F1',
          400: '#A9EEE3',
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
        4.5: '1.125rem', // 18px — used by h-4.5 / w-4.5 icon sizing across the app
        // Vertical padding of every <Section>. Was clamp(4rem, 2rem + 6vw, 7.5rem) —
        // up to 120px top AND bottom, which left large empty bands between sections.
        section: 'clamp(3.25rem, 1.75rem + 4vw, 5.5rem)',
        // Dark sections fade in from (and out to) the light page colour over
        // 7rem. This padding = normal section padding + 4rem, so content
        // always starts below the fade and white text never sits on a
        // half-light background.
        'section-dark': 'calc(clamp(3.25rem, 1.75rem + 4vw, 5.5rem) + 4rem)',
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
        /* Glacier additions — cool-toned, diffused "floating glass" shadows,
           distinct from the warm ink-based shadows above. */
        crystal: '0 24px 70px -24px rgba(93,146,214,.38), 0 8px 24px -8px rgba(93,146,214,.22)',
        'crystal-lg': '0 40px 100px -30px rgba(93,146,214,.42), 0 12px 32px -10px rgba(93,146,214,.24)',
        // Inner top highlight + bottom shade, simulating glass thickness on a frosted panel.
        'frost-inset': 'inset 0 1px 0 rgba(255,255,255,.65), inset 0 -1px 0 rgba(15,28,46,.04)',
      },
      backgroundImage: {
        'grid-fade':
          'linear-gradient(to right, rgba(15,28,46,.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(15,28,46,.06) 1px, transparent 1px)',
        'ink-glow':
          'radial-gradient(60% 55% at 18% 12%, rgba(29,93,184,.35), transparent 60%), radial-gradient(50% 45% at 88% 82%, rgba(43,114,212,.28), transparent 60%)',
        'brand-grad': 'linear-gradient(118deg, #1A3665 0%, #1D5DB8 52%, #2B72D4 100%)',
        'brand-grad-hover': 'linear-gradient(118deg, #132952 0%, #1A3665 52%, #1D5DB8 100%)',
        'btn-grad': 'linear-gradient(180deg, #2B72D4 0%, #1D5DB8 60%, #1E4080 100%)',
        /* Glacier mesh — the signature premium background: layered radial
           glows (frost blue, aurora purple, soft cream, a touch of cyan)
           over the glacier-white base. One deliberate combination, reused
           everywhere the Glacier treatment is applied, rather than each
           section inventing its own gradient. */
        'glacier-mesh':
          'radial-gradient(38% 42% at 14% 10%, rgba(79,193,230,.22), transparent 65%), radial-gradient(42% 46% at 86% 14%, rgba(169,140,234,.18), transparent 68%), radial-gradient(46% 50% at 78% 92%, rgba(253,243,226,.55), transparent 70%), radial-gradient(30% 34% at 8% 86%, rgba(169,238,227,.16), transparent 65%)',
        // Same glow palette, tuned to glow rather than tint against the dark ink surface.
        'glacier-mesh-dark':
          'radial-gradient(42% 46% at 16% 14%, rgba(79,193,230,.28), transparent 65%), radial-gradient(46% 50% at 88% 20%, rgba(169,140,234,.30), transparent 68%), radial-gradient(34% 38% at 70% 90%, rgba(169,238,227,.14), transparent 65%)',
        'aurora-blob': 'radial-gradient(circle, rgba(169,140,234,.55), transparent 70%)',
        'frost-blob': 'radial-gradient(circle, rgba(79,193,230,.55), transparent 70%)',
        'cream-blob': 'radial-gradient(circle, rgba(253,232,200,.65), transparent 70%)',
      },
      transitionTimingFunction: {
        entrance: 'cubic-bezier(.16,.84,.44,1)',
      },
      keyframes: {
        'meter-fill': { from: { width: '0%' }, to: { width: 'var(--meter)' } },
        'rise': { from: { opacity: 0, transform: 'translateY(12px)' }, to: { opacity: 1, transform: 'none' } },
        float: { '0%, 100%': { transform: 'translateY(0)' }, '50%': { transform: 'translateY(-10px)' } },
        'glow-pan': { from: { transform: 'translate3d(0,0,0) scale(1)' }, to: { transform: 'translate3d(-1.8%,1.8%,0) scale(1.04)' } },
        /* Slow, multi-directional aurora drift — used on the mesh background
           layers so the glow feels alive without ever looking busy. */
        'aurora-drift': {
          '0%, 100%': { transform: 'translate3d(0,0,0) scale(1)' },
          '33%': { transform: 'translate3d(2.4%,-1.6%,0) scale(1.05)' },
          '66%': { transform: 'translate3d(-1.8%,2%,0) scale(0.98)' },
        },
        shimmer: { from: { backgroundPosition: '200% 0' }, to: { backgroundPosition: '-200% 0' } },
      },
      animation: {
        'meter-fill': 'meter-fill 1.1s cubic-bezier(.16,.84,.44,1) both',
        rise: 'rise .6s cubic-bezier(.16,.84,.44,1) both',
        float: 'float 6s ease-in-out infinite',
        'glow-pan': 'glow-pan 20s ease-in-out infinite alternate',
        'aurora-drift': 'aurora-drift 24s ease-in-out infinite',
        shimmer: 'shimmer 2.4s linear infinite',
      },
    },
  },
  plugins: [],
};