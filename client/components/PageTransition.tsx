import { type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

interface PageTransitionProps {
  children: ReactNode;
  locationKey: string;
}

/**
 * Wraps page content in an enter/exit animation.
 * Pages fade in + slide up 20px when entering.
 * Pages fade out quickly when leaving.
 * Use with AnimatePresence in App.tsx and pass location.pathname as locationKey.
 */
export function PageTransition({ children, locationKey }: PageTransitionProps) {
  const prefersReducedMotion = useReducedMotion();

  if (prefersReducedMotion) {
    return <>{children}</>;
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={locationKey}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{ width: "100%" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
