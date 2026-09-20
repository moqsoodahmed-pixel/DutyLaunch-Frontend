import { Link } from 'react-router-dom';
import { cn } from '../../utils/cn.js';

/**
 * The real DutyLaunch wordmark, supplied as a trimmed, transparent PNG in two
 * colourways: navy for light surfaces, white for dark ones (footer, the
 * ink-toned auth panel). The image's own aspect ratio (~4.17:1) sets the
 * width from a single height value so it never looks stretched.
 */
export function Logo({ tone = 'dark', className, height = 32 }) {
  const src = tone === 'light' ? '/logo-white.png' : '/logo.png';
  return (
    <Link to="/" className={cn('inline-flex items-center', className)} aria-label="DutyLaunch — home">
      <img src={src} alt="DutyLaunch" height={height} style={{ height, width: 'auto' }} />
    </Link>
  );
}

/** Shield-only mark, for tight spaces (a compact header state, a loading screen). */
export function LogoMark({ tone = 'dark', className, size = 32 }) {
  const src = tone === 'light' ? '/favicon-192-white.png' : '/favicon-192.png';
  return <img src={src} alt="DutyLaunch" width={size} height={size} className={cn('shrink-0', className)} />;
}
