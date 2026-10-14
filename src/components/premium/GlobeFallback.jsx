import { Plane } from 'lucide-react';
import { cn } from '../../utils/cn.js';

/**
 * Static stand-in for the 3D globe. Shown
 *   - while the three.js chunk and the Earth texture are still loading,
 *   - when WebGL is unavailable, the texture fails to load, or the GPU context is lost.
 * Pure CSS/SVG (no three.js), in the DutyLaunch navy / blue / cyan palette, so the
 * section never has an empty hole where the globe should be.
 */
export function GlobeFallback({ className, style }) {
  return (
    <div className={cn('grid place-items-center', className)} style={style} aria-hidden>
      <div
        className="relative aspect-square w-[86%] rounded-full"
        style={{
          background: 'radial-gradient(circle at 32% 26%, #2B72D4 0%, #1E4080 40%, #0F1C2E 100%)',
          boxShadow:
            '0 0 0 1px rgba(79,193,230,0.22), 0 0 56px 4px rgba(79,193,230,0.22), inset -22px -28px 56px rgba(5,10,20,0.45)',
        }}
      >
        {/* Latitude / longitude hairlines */}
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="0.35">
          <ellipse cx="50" cy="50" rx="49.5" ry="49.5" />
          <ellipse cx="50" cy="50" rx="34" ry="49.5" />
          <ellipse cx="50" cy="50" rx="16" ry="49.5" />
          <line x1="50" y1="0.5" x2="50" y2="99.5" />
          <ellipse cx="50" cy="50" rx="49.5" ry="34" />
          <ellipse cx="50" cy="50" rx="49.5" ry="16" />
          <line x1="0.5" y1="50" x2="99.5" y2="50" />
        </svg>
        {/* A few destination dots */}
        {[
          ['58%', '44%'],
          ['44%', '34%'],
          ['70%', '60%'],
          ['30%', '52%'],
        ].map(([left, top]) => (
          <span key={`${left}-${top}`} className="absolute h-2 w-2 rounded-full bg-frost-500 shadow-[0_0_10px_2px_rgba(79,193,230,0.7)]" style={{ left, top }} />
        ))}
        <Plane className="absolute left-[46%] top-[38%] h-9 w-9 rotate-[20deg] text-white drop-shadow" strokeWidth={1.75} />
      </div>
    </div>
  );
}