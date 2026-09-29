/**
 * Shared motion tokens and global motion presets.
 * Used across DutyLaunch for GPU-accelerated micro-interactions, page transitions,
 * and elegant Glacier ambient movement.
 */
export const easing = [0.16, 0.84, 0.44, 1];
export const springSmooth = { type: 'spring', stiffness: 260, damping: 20 };
export const springGentle = { type: 'spring', stiffness: 170, damping: 24, mass: 0.9 };

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

/* ------------------------------------------------------------------ *
 * Reusable Global Motion Presets
 * ------------------------------------------------------------------ */

export const buttonHover = {
  rest: { scale: 1, y: 0, transition: { duration: 0.25, ease: easing } },
  hover: { scale: 1.02, y: -2, transition: { duration: 0.25, ease: easing } },
  tap: { scale: 0.98, y: 0, transition: { duration: 0.1 } },
};

export const cardHover = {
  rest: {
    y: 0,
    scale: 1,
    boxShadow: '0 8px 24px rgba(15,28,46,.08), 0 2px 8px rgba(15,28,46,.04)',
    transition: { duration: 0.35, ease: easing },
  },
  hover: {
    y: -5,
    scale: 1.015,
    boxShadow: '0 24px 60px -20px rgba(47,163,204,.35), 0 0 0 1px rgba(125,211,239,.4)',
    transition: { duration: 0.35, ease: easing },
  },
};

export const glassGlow = {
  rest: {
    boxShadow: '0 8px 24px -8px rgba(93,146,214,.22), inset 0 1px 0 rgba(255,255,255,.7)',
    borderColor: 'rgba(255, 255, 255, 0.65)',
    transition: { duration: 0.3 },
  },
  glow: {
    boxShadow: '0 25px 65px -15px rgba(79,193,230,.45), 0 0 25px -4px rgba(169,140,234,.35), inset 0 1px 0 rgba(255,255,255,.95)',
    borderColor: 'rgba(125, 211, 239, 0.85)',
    transition: { duration: 0.3 },
  },
};

export const floatingCard = {
  animate: {
    y: [0, -8, 0],
    rotate: [0, 0.5, 0],
    transition: {
      duration: 6,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const navbarGlow = {
  rest: {
    boxShadow: '0 8px 24px -8px rgba(93,146,214,.18)',
    borderColor: 'rgba(255, 255, 255, 0.7)',
  },
  active: {
    boxShadow: '0 16px 40px -10px rgba(79,193,230,.32), 0 0 20px -5px rgba(169,140,234,.22)',
    borderColor: 'rgba(125, 211, 239, 0.75)',
  },
};

export const heroFloat = {
  animate: {
    y: [0, -10, 0],
    rotateZ: [0, 1, 0],
    transition: {
      duration: 7,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};

export const templateHover = {
  rest: {
    scale: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.35, ease: easing },
  },
  hover: {
    scale: 1.04,
    y: -6,
    filter: 'blur(0px)',
    transition: { duration: 0.35, ease: easing },
  },
};

export const templateCarousel = {
  animate: {
    x: ['0%', '-50%'],
    transition: {
      x: {
        repeat: Infinity,
        repeatType: 'loop',
        duration: 35,
        ease: 'linear',
      },
    },
  },
};

export const pageFade = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.45, ease: easing } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const sectionReveal = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: easing },
  },
};

