import { motion } from 'framer-motion';
import { fadeUp, stagger as staggerTokens, revealOnce } from '../../utils/motion.js';

function motionTag(as) {
  if (!as || typeof as !== 'string') return as || motion.div;
  return motion[as] || motion.div;
}

/**
 * Scroll-triggered fade + rise, once. This is the one reusable primitive for
 * "section enters as you scroll to it" — used instead of hand-rolling
 * initial/whileInView props on every page. Pass `as="ol"` / `as="section"` /
 * etc. (any valid HTML tag name) to render that element instead of a div.
 */
export function Reveal({ as, className, delay = 0, children, ...rest }) {
  const Tag = motionTag(as);
  return (
    <Tag
      variants={fadeUp}
      initial="hidden"
      whileInView="show"
      viewport={revealOnce}
      transition={{ delay }}
      className={className}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/** Wrap a list/grid with this, then each child in <RevealItem>, for a
    staggered entrance instead of everything fading in at once. */
export function RevealGroup({ as, className, staggerDelay = 0.08, children, ...rest }) {
  const Tag = motionTag(as);
  return (
    <Tag
      variants={staggerTokens(staggerDelay)}
      initial="hidden"
      whileInView="show"
      viewport={revealOnce}
      className={className}
      {...rest}
    >
      {children}
    </Tag>
  );
}

export function RevealItem({ as, className, children, ...rest }) {
  const Tag = motionTag(as);
  return (
    <Tag variants={fadeUp} className={className} {...rest}>
      {children}
    </Tag>
  );
}
