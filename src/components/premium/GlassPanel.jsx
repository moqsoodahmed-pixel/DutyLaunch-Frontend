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
        light: 'border border-azure-200 bg-white text-ink shadow-[0_14px_36px_-16px_rgba(5,8,14,0.35)]',
        dark: 'border-2 border-night-line bg-night-card text-white shadow-[0_18px_44px_-18px_rgba(0,0,0,0.65)]',
    };

    return (
        <Tag className={cn('relative rounded-xl shadow-frost-inset', tones[tone], className)} {...rest}>
            {children}
        </Tag>
    );
}