import { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

// ── Particle shape types ────────────────────────────────────────────
type ParticleShape = "circle" | "diamond" | "star" | "stitch";

const SHAPES: ParticleShape[] = ["circle", "diamond", "star", "stitch"];
const SHAPE_CHARS: Record<ParticleShape, string> = {
  circle:  "●",
  diamond: "◆",
  star:    "✦",
  stitch:  "+",
};

// Warm, subtle colours — very low opacity so they don't distract
const COLORS = [
  "rgba(255, 255, 255, 0.25)",
  "rgba(255, 215, 0, 0.20)",
  "rgba(210, 130, 90, 0.18)",
  "rgba(255, 255, 255, 0.15)",
];

interface Particle {
  id: number;
  x: number;   // % across the container
  shape: ParticleShape;
  color: string;
  size: number; // rem
  duration: number; // seconds
  delay: number;    // seconds
}

function makeParticles(count: number): Particle[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    shape: SHAPES[i % SHAPES.length],
    color: COLORS[i % COLORS.length],
    size: 0.55 + Math.random() * 0.65,
    duration: 4 + Math.random() * 5,
    delay: Math.random() * 5,
  }));
}

/**
 * FloatingParticles — renders artisan-themed floating shapes
 * (beads, gems, sparkles, stitches) inside the hero section.
 *
 * The container is position:absolute, pointer-events:none so
 * all hero clicks/touches pass straight through.
 * On mobile we reduce count to 10 for performance.
 */
export function FloatingParticles() {
  const prefersReducedMotion = useReducedMotion();

  // Detect mobile via window width at mount time
  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;
  const count = isMobile ? 10 : 22;

  // Stable list — memoised so it doesn't re-randomise on every render
  const particles = useMemo(() => makeParticles(count), [count]);

  // Skip entirely for reduced-motion users
  if (prefersReducedMotion) return null;

  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none overflow-hidden"
      style={{ zIndex: 1 }}
    >
      {particles.map((p) => (
        <motion.span
          key={p.id}
          style={{
            position: "absolute",
            left: `${p.x}%`,
            bottom: "5%",
            fontSize: `${p.size}rem`,
            color: p.color,
            willChange: "transform, opacity",
          }}
          animate={{
            y: [-10, -90],         // float upward
            opacity: [0, 0.7, 0],  // fade in then out
          }}
          transition={{
            duration: p.duration,
            delay: p.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {SHAPE_CHARS[p.shape]}
        </motion.span>
      ))}
    </div>
  );
}
