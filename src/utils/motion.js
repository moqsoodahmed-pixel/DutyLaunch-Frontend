/**
 * Shared motion tokens.
 * Motion is used for two things only: one orchestrated entrance on the hero,
 * and feedback for things the person just did (menus, accordions, dialogs).
 */
export const easing = [0.16, 0.84, 0.44, 1];

export const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: easing } },
};

export const fade = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, ease: easing } },
};

export const stagger = (delay = 0.06) => ({
  hidden: {},
  show: { transition: { staggerChildren: delay, delayChildren: 0.05 } },
});

export const pageTransition = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.28, ease: easing } },
  exit: { opacity: 0, transition: { duration: 0.16 } },
};

/** Reveals content once, when it scrolls into view. */
export const revealOnce = { once: true, amount: 0.25 };
