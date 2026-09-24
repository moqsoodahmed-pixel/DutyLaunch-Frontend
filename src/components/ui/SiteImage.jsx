import { cn } from '../../utils/cn.js';

/**
 * Responsive photo with the layout-shift and quality guards the site needs:
 *   - width/height + aspect-ratio reserve space before the file loads
 *   - max-width is capped at the file's native width, so a small source is
 *     never stretched (and blurred) to fill a wide column
 *   - above-the-fold images load eagerly; everything else lazy-loads
 *   - decorative={true} renders an empty alt so screen readers skip it
 *
 * image: an entry from src/data/images.js
 */
export function SiteImage({ image, priority = false, decorative = false, className, imgClassName, rounded = 'rounded-xl' }) {
  if (!image) return null;
  const { src, srcSet, sizes, width, height, alt, position } = image;
  return (
    <div
      className={cn('relative w-full overflow-hidden bg-slate-100 shadow-lift', rounded, className)}
      style={{ maxWidth: width, aspectRatio: `${width} / ${height}` }}
    >
      <img
        src={src}
        srcSet={srcSet}
        sizes={sizes}
        width={width}
        height={height}
        alt={decorative ? '' : alt}
        loading={priority ? 'eager' : 'lazy'}
        // lowercase: React 18 warns on the camelCase prop (only known from v19)
        fetchpriority={priority ? 'high' : undefined}
        decoding="async"
        className={cn('h-full w-full object-cover', imgClassName)}
        style={position ? { objectPosition: position } : undefined}
      />
    </div>
  );
}