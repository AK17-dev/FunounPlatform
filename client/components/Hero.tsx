import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "./ui/button";
import { TypewriterText } from "./TypewriterText";
import { FloatingParticles } from "./FloatingParticles";

// —— Framer Motion variants for staggered hero entrance ———————————
const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.15, delayChildren: 0.2 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" as const } },
};

export function Hero() {
  const prefersReducedMotion = useReducedMotion();

  const MotionDiv = prefersReducedMotion
    ? ({ children, className }: { children: React.ReactNode; className?: string }) => (
      <div className={className}>{children}</div>
    )
    : motion.div;

  return (
    <section
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: "url('/assets/hero-bg.jpg')" }}
    >
      {/* Dark overlay — 55% opacity */}
      <div className="absolute inset-0 bg-black/55" style={{ zIndex: 0 }} />

      {/* —— Floating artisan particles (z-index 1, pointer-events-none) */}
      <FloatingParticles />

      {/* —— Hero content — z-index 10, above overlay and particles —— */}
      <motion.div
        className="relative z-10 container mx-auto px-4 sm:px-6 lg:px-8 text-center py-16 sm:py-24 lg:py-32"
        variants={prefersReducedMotion ? undefined : containerVariants}
        initial={prefersReducedMotion ? undefined : "hidden"}
        animate={prefersReducedMotion ? undefined : "visible"}
      >
        <div className="max-w-4xl mx-auto">

          {/* —— Animation 1 — Animated logo draw + Typewriter headline —— */}
          <motion.h1
            className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-4"
            variants={prefersReducedMotion ? undefined : itemVariants}
          >
            {/* Static part of headline */}
            <span className="block mb-2 text-white/90 text-2xl sm:text-3xl font-medium tracking-wide">
              Funoun / فنون
            </span>
            {/* Typewriter cycling phrase */}
            <TypewriterText className="text-yellow-300 drop-shadow-lg" />
          </motion.h1>

          <motion.p
            className="text-lg sm:text-xl text-white/80 mb-8 max-w-2xl mx-auto leading-relaxed"
            variants={prefersReducedMotion ? undefined : itemVariants}
          >
            Discover our collection of unique, handmade products crafted with
            love and attention to detail. Each piece tells a story of
            traditional craftsmanship and modern design.
          </motion.p>

          <motion.div
            className="mb-8 flex flex-col sm:flex-row gap-3 justify-center items-center"
            variants={prefersReducedMotion ? undefined : itemVariants}
          >
            <Button asChild size="lg" className="hover:bg-white/10 hover:text-white">
              <Link to="/custom-order">Request Custom Design</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/60 text-black hover:bg-white/10 hover:text-white"
            >
              <Link to="/track">Track Your Order</Link>
            </Button>
          </motion.div>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            variants={prefersReducedMotion ? undefined : itemVariants}
          >
            {[
              "Made to order",
              "Eco-friendly materials",
              "Since 2019",
            ].map((label) => (
              <div key={label} className="flex items-center space-x-2 text-sm text-white/70">
                <div className="w-2 h-2 bg-yellow-300 rounded-full" />
                <span>{label}</span>
              </div>
            ))}
          </motion.div>

        </div>
      </motion.div>
    </section>
  );
}
