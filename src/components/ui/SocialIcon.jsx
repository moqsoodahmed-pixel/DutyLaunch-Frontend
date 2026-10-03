import { useState } from 'react';

/**
 * Official brand metadata and SVG glyphs for social media.
 * By default, all icons display their authentic official brand colors
 * (Instagram signature gradient, Facebook blue, X black, YouTube red, LinkedIn blue, WhatsApp green).
 * When hovered/focused (cursor moves), the icon pops up with an energetic spring curve
 * and emits a vibrant brand-colored glow.
 */
const BRAND_DATA = {
  Instagram: {
    color: '#E1306C',
    bg: 'linear-gradient(135deg, #833AB4 0%, #FD1D1D 50%, #FCAF45 100%)',
    shadow: '0 4px 12px rgba(225, 48, 108, 0.35)',
    glow: '0 10px 24px -2px rgba(225, 48, 108, 0.65), 0 0 16px rgba(253, 29, 29, 0.45)',
    renderIcon: (size) => (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
        <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
        <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
      </svg>
    ),
  },
  Facebook: {
    color: '#1877F2',
    bg: '#1877F2',
    shadow: '0 4px 12px rgba(24, 119, 242, 0.35)',
    glow: '0 10px 24px -2px rgba(24, 119, 242, 0.65), 0 0 16px rgba(24, 119, 242, 0.45)',
    renderIcon: (size) => (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.52-.14-2.89-.14-2.87 0-4.61 1.74-4.61 4.79v2.71H7v4h3v9.5h4v-9.5z" />
      </svg>
    ),
  },
  'X (Twitter)': {
    color: '#0F1419',
    bg: '#0F1419',
    shadow: '0 4px 12px rgba(15, 20, 25, 0.35)',
    glow: '0 10px 24px -2px rgba(15, 20, 25, 0.6), 0 0 16px rgba(15, 20, 25, 0.35)',
    renderIcon: (size) => (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
  },
  YouTube: {
    color: '#FF0000',
    bg: '#FF0000',
    shadow: '0 4px 12px rgba(255, 0, 0, 0.35)',
    glow: '0 10px 24px -2px rgba(255, 0, 0, 0.7), 0 0 18px rgba(255, 0, 0, 0.5)',
    renderIcon: (size) => (
      <svg
        viewBox="0 0 24 24"
        width={size + 2}
        height={size + 2}
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
  },
  LinkedIn: {
    color: '#0A66C2',
    bg: '#0A66C2',
    shadow: '0 4px 12px rgba(10, 102, 194, 0.35)',
    glow: '0 10px 24px -2px rgba(10, 102, 194, 0.65), 0 0 16px rgba(10, 102, 194, 0.45)',
    renderIcon: (size) => (
      <svg
        viewBox="0 0 24 24"
        width={size}
        height={size}
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z" />
      </svg>
    ),
  },
  WhatsApp: {
    color: '#25D366',
    bg: '#25D366',
    shadow: '0 4px 12px rgba(37, 211, 102, 0.35)',
    glow: '0 10px 24px -2px rgba(37, 211, 102, 0.65), 0 0 16px rgba(37, 211, 102, 0.45)',
    renderIcon: (size) => (
      <svg
        viewBox="0 0 32 32"
        width={size}
        height={size}
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M16 2C8.268 2 2 8.268 2 16c0 2.434.658 4.714 1.806 6.68L2 30l7.52-1.774A13.93 13.93 0 0 0 16 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.5a11.43 11.43 0 0 1-5.834-1.598l-.418-.248-4.333 1.022 1.044-4.224-.272-.434A11.46 11.46 0 0 1 4.5 16C4.5 9.648 9.648 4.5 16 4.5S27.5 9.648 27.5 16 22.352 27.5 16 27.5zm6.29-8.574c-.345-.172-2.04-1.006-2.355-1.12-.316-.115-.546-.172-.776.172-.23.345-.89 1.12-1.09 1.35-.2.23-.4.258-.746.086-.345-.172-1.458-.537-2.776-1.712-1.026-.916-1.719-2.047-1.92-2.392-.2-.345-.02-.532.15-.703.155-.155.345-.4.518-.603.172-.2.23-.345.345-.574.115-.23.058-.432-.029-.603-.086-.172-.776-1.87-1.063-2.56-.28-.673-.563-.581-.776-.592l-.66-.012c-.23 0-.603.086-.918.432s-1.205 1.178-1.205 2.873 1.233 3.333 1.405 3.563c.172.23 2.427 3.706 5.878 5.196.822.355 1.463.567 1.963.726.824.263 1.574.226 2.167.137.661-.099 2.04-.834 2.327-1.638.287-.805.287-1.494.2-1.638-.086-.144-.316-.23-.66-.4z" />
      </svg>
    ),
  },
};

export function SocialIcon({
  social,
  size = 'md',
  rounded = 'full',
  className = '',
  style = {},
}) {
  const [hovered, setHovered] = useState(false);
  const brand = BRAND_DATA[social.label] ?? {
    color: '#0A66C2',
    bg: '#0A66C2',
    shadow: '0 4px 12px rgba(10,102,194,0.35)',
    glow: '0 10px 24px -2px rgba(10,102,194,0.65), 0 0 16px rgba(10,102,194,0.4)',
    renderIcon: (s) => (
      <svg viewBox="0 0 24 24" width={s} height={s} fill="currentColor">
        <circle cx="12" cy="12" r="10" />
      </svg>
    ),
  };

  const isSmall = size === 'sm';
  const isLarge = size === 'lg';
  const boxDim = isSmall ? 40 : isLarge ? 52 : 46;
  const iconDim = isSmall ? 19 : isLarge ? 26 : 22;
  const radius = rounded === 'full' ? '9999px' : rounded === 'lg' ? '12px' : '10px';

  return (
    <a
      href={social.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={social.label}
      title={social.label}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: boxDim,
        height: boxDim,
        borderRadius: radius,
        background: brand.bg,
        backgroundColor: brand.color,
        color: '#FFFFFF',
        boxShadow: hovered ? brand.glow : brand.shadow,
        transform: hovered ? 'translateY(-4px) scale(1.08)' : 'translateY(0) scale(1)',
        filter: hovered ? 'brightness(1.08)' : 'brightness(1)',
        transition: 'transform 0.24s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.24s cubic-bezier(0.34, 1.56, 0.64, 1), filter 0.2s ease',
        textDecoration: 'none',
        flexShrink: 0,
        cursor: 'pointer',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        ...style,
      }}
      className={`dl-social-icon focus-visible:outline focus-visible:outline-2 focus-visible:outline-azure ${className}`}
    >
      {brand.renderIcon(iconDim)}
    </a>
  );
}
