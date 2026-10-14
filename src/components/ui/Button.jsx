import { forwardRef, useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn.js';

/* Buttons use a minimum height rather than a fixed one, so a label can never
   spill outside its button. From 640px up labels stay on one line; on small
   phones a long label ("Check Your Document Requirements") wraps onto a second
   line and the button grows, instead of pushing the page wider than the
   screen. max-w-full keeps any button inside its container. */
const base =
  'relative inline-flex max-w-full items-center justify-center gap-2 text-center leading-tight sm:whitespace-nowrap rounded font-semibold cursor-pointer select-none transition-[background-color,border-color,color,box-shadow,transform] duration-200 ease-out disabled:cursor-not-allowed disabled:opacity-55 aria-disabled:pointer-events-none aria-disabled:opacity-55 motion-safe:hover:-translate-y-0.5 motion-safe:hover:scale-[1.04] motion-safe:active:translate-y-0 motion-safe:active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azure-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white';

/* Variant guide (DutyLaunch design system):
     primary    solid brand blue #1D5DB8, white text — the one dominant action
     secondary  white, brand-blue text, pale-blue border — supporting action
     ghost/quiet  low emphasis, glacier fill
   Legacy names (premium, outline, onInk, outlineInk) are kept so existing
   call sites keep working, but they now resolve to the same two looks above
   instead of each carrying its own gradient/glow. */
const PRIMARY =
  'bg-azure text-white shadow-xs hover:bg-ink-600 hover:shadow-raise active:bg-ink-700';
const SECONDARY =
  'border border-glacier-400 bg-white text-azure hover:border-azure-200 hover:bg-glacier-200 hover:text-ink-600 active:bg-glacier-300';

const variants = {
  primary: PRIMARY,
  premium: PRIMARY,
  secondary: SECONDARY,
  outline: SECONDARY,
  quiet: 'border border-glacier-400 bg-glacier-200 text-ink hover:bg-glacier-300',
  ghost: 'bg-glacier-200 text-ink hover:bg-glacier-300',
  onInk: 'bg-white text-ink shadow-xs hover:bg-glacier-100 hover:shadow-raise',
  outlineInk: 'bg-ink-800 text-white shadow-xs hover:bg-ink-700',
  /* Outlined button for use on a navy (card-featured / closing CTA) surface. */
  onInkOutline: 'border border-white/40 bg-transparent text-white hover:border-white hover:bg-white/10 focus-visible:ring-offset-ink-800',
  danger: 'bg-danger text-white shadow-xs hover:bg-red-700 active:bg-red-800',
  link: 'text-azure underline-offset-4 hover:underline px-0 motion-safe:hover:translate-y-0 motion-safe:hover:scale-100 motion-safe:active:scale-100',
};


const sizes = {
  sm: 'min-h-[40px] py-2 px-4 text-[13.5px] rounded',
  md: 'min-h-12 py-2.5 px-5 text-[14.5px]',
  lg: 'min-h-[52px] py-3 px-6 sm:px-7 text-[15.5px]',
};

export const Button = forwardRef(function Button(
  { as, to, href, variant = 'primary', size = 'md', loading = false, fullWidth, magnetic: _magnetic, className, children, ...rest },
  ref
) {
  const classes = cn(base, variants[variant], variant !== 'link' && sizes[size], fullWidth && 'w-full', className);
  const content = (
    <>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </>
  );

  /* Magnetic cursor-follow is retired (the prop is still accepted so existing
     call sites don't break). Kept below as dead-simple no-op handlers. */
  const magnetic = false;
  /* Magnetic interaction — opt-in only (disabled). The element leans a few pixels
     toward the cursor while hovered, and eases back to rest on leave. Plain
     inline transform + CSS transition (no motion library dependency here),
     clamped to a small range so it reads as a subtle premium detail rather
     than the button visibly chasing the pointer. */
  const magneticRef = useRef(null);
  const [magneticOffset, setMagneticOffset] = useState({ x: 0, y: 0 });
  const mergedRef = useCallback(
    (node) => {
      magneticRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) ref.current = node;
    },
    [ref]
  );
  const magneticHandlers = magnetic
    ? {
      onMouseMove: (e) => {
        const rect = magneticRef.current?.getBoundingClientRect();
        if (!rect) return;
        const relX = (e.clientX - rect.left) / rect.width - 0.5;
        const relY = (e.clientY - rect.top) / rect.height - 0.5;
        setMagneticOffset({ x: relX * 10, y: relY * 8 });
      },
      onMouseLeave: () => setMagneticOffset({ x: 0, y: 0 }),
    }
    : {};
  const magneticStyle = magnetic
    ? {
      transform: `translate3d(${magneticOffset.x}px, ${magneticOffset.y}px, 0)`,
      transition: 'transform 0.25s cubic-bezier(.16,.84,.44,1)',
    }
    : undefined;

  if (to) {
    return (
      <Link ref={mergedRef} to={to} className={classes} style={magneticStyle} {...magneticHandlers} {...rest}>
        {content}
      </Link>
    );
  }
  if (href) {
    return (
      <a ref={mergedRef} href={href} className={classes} style={magneticStyle} {...magneticHandlers} {...rest}>
        {content}
      </a>
    );
  }

  const Tag = as || 'button';
  return (
    <Tag
      ref={mergedRef}
      className={classes}
      style={magneticStyle}
      disabled={loading || rest.disabled}
      aria-busy={loading || undefined}
      {...magneticHandlers}
      {...rest}
    >
      {content}
    </Tag>
  );
});