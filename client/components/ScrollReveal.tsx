import { type ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Direction = "up" | "left" | "right" | "fade";

interface ScrollRevealProps {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  className?: string;
}

// Map direction to initial translate values
const DIRECTION_VARIANTS: Record<Direction, { x?: number; y?: number }> = {
  up:    { y: 40 },
  left:  { x: -40 },
  right: { x: 40 },
  fade:  {},
};

/**
 * Wraps children in a scroll-triggered reveal animation.
 * Plays once when the element scrolls into view.
 * Respects prefers-reduced-motion — passes children through unchanged.
 */
export function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  className,
}: ScrollRevealProps) {
  const prefersReducedMotion = useReducedMotion();

  // Skip animation entirely for accessibility
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  const initial = { opacity: 0, ...DIRECTION_VARIANTS[direction] };
  const animate = { opacity: 1, x: 0, y: 0 };

  return (
    <motion.div
      className={className}
      initial={initial}
      whileInView={animate}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: "easeOut", delay }}
    >
      {children}
    </motion.div>
  );
}
