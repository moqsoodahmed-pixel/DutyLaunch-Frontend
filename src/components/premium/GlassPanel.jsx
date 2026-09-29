import { cn } from '../../utils/cn.js';

/**
 * A frosted-glass panel: translucent surface, soft cool-toned "crystal"
 * shadow, and an inset highlight that reads as glass thickness. Used for
 * elevated cards on a Glacier-treated section.
 *
 * `tone="light"` — frosted white, for use on a glacier/paper background.
 * `tone="dark"` — frosted ink, for use on a dark/ink background (this is
 * what the hero's HeroComposite panel now uses instead of a flat bg-ink-800).
 */
export function GlassPanel({ as: Tag = 'div', tone = 'light', className, children, ...rest }) {
    const tones = {
        light: 'border border-white/60 bg-white/70 text-ink shadow-crystal backdrop-blur-xl',
        dark: 'border border-white/10 bg-ink-800/70 text-white shadow-crystal-lg backdrop-blur-xl',
    };

    return (
        <Tag className={cn('relative rounded-xl shadow-frost-inset', tones[tone], className)} {...rest}>
            {children}
        </Tag>
    );
}