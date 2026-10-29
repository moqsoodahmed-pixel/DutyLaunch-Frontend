/**
 * Crisp SVG vector flags for destination hubs in the 3D globe visualization.
 * Ensures consistent rendering across all platforms and operating systems.
 */

export function IndiaFlag({ className = 'h-2.5 w-4' }) {
  return (
    <svg
      viewBox="0 0 30 20"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="India flag"
      style={{ borderRadius: '2px', overflow: 'hidden', flexShrink: 0, width: '100%', height: '100%' }}
    >
      <rect width="30" height="6.67" fill="#FF9933" />
      <rect y="6.67" width="30" height="6.67" fill="#FFFFFF" />
      <rect y="13.33" width="30" height="6.67" fill="#138808" />
      <circle cx="15" cy="10" r="2.3" fill="none" stroke="#000080" strokeWidth="0.5" />
      <circle cx="15" cy="10" r="0.6" fill="#000080" />
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
        <line
          key={deg}
          x1="15"
          y1="10"
          x2={15 + 2.1 * Math.cos((deg * Math.PI) / 180)}
          y2={10 + 2.1 * Math.sin((deg * Math.PI) / 180)}
          stroke="#000080"
          strokeWidth="0.25"
        />
      ))}
    </svg>
  );
}

export function UaeFlag({ className = 'h-2.5 w-4' }) {
  return (
    <svg
      viewBox="0 0 30 20"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="UAE flag"
      style={{ borderRadius: '2px', overflow: 'hidden', flexShrink: 0, width: '100%', height: '100%' }}
    >
      <rect width="30" height="6.67" fill="#00732F" />
      <rect y="6.67" width="30" height="6.67" fill="#FFFFFF" />
      <rect y="13.33" width="30" height="6.67" fill="#000000" />
      <rect width="8" height="20" fill="#FF0000" />
    </svg>
  );
}

export function SaudiFlag({ className = 'h-2.5 w-4' }) {
  return (
    <svg
      viewBox="0 0 30 20"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Saudi Arabia flag"
      style={{ borderRadius: '2px', overflow: 'hidden', flexShrink: 0, width: '100%', height: '100%' }}
    >
      <rect width="30" height="20" fill="#006C35" />
      <path
        d="M7 6.5 h16 c0.5 0 0.8 0.3 0.8 0.8 v2.4 c0 0.5 -0.3 0.8 -0.8 0.8 h-16 c-0.5 0 -0.8 -0.3 -0.8 -0.8 v-2.4 c0 -0.5 0.3 -0.8 0.8 -0.8 z"
        fill="#FFFFFF"
        opacity="0.95"
      />
      <rect x="8" y="7.5" width="14" height="1.6" fill="#006C35" rx="0.5" />
      <circle cx="11" cy="8.3" r="0.5" fill="#FFFFFF" />
      <circle cx="15" cy="8.3" r="0.5" fill="#FFFFFF" />
      <circle cx="19" cy="8.3" r="0.5" fill="#FFFFFF" />
      <path d="M7 13.5 h14 v1.2 h-14 z M7 13.5 l-1.5 0.6 l1.5 0.6 z M20.5 12.8 v2.6 h1 v-2.6 z" fill="#FFFFFF" />
    </svg>
  );
}

export function QatarFlag({ className = 'h-2.5 w-4' }) {
  return (
    <svg
      viewBox="0 0 30 20"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      aria-label="Qatar flag"
      style={{ borderRadius: '2px', overflow: 'hidden', flexShrink: 0, width: '100%', height: '100%' }}
    >
      <rect width="30" height="20" fill="#8D1B3D" />
      <path
        d="M0 0 h8.5 l3 1.11 l-3 1.11 l3 1.11 l-3 1.11 l3 1.11 l-3 1.11 l3 1.11 l-3 1.11 l3 1.11 l-3 1.11 l3 1.11 l-3 1.11 l3 1.11 l-3 1.11 h-8.5 z"
        fill="#FFFFFF"
      />
    </svg>
  );
}
