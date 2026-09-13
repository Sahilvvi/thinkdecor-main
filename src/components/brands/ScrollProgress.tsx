import { motion, useScroll, useSpring } from 'framer-motion';

/** Thin gradient bar at the very top showing scroll progress. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[3px] z-[60] origin-left bg-gradient-to-r from-primary via-accent to-primary shadow-[0_0_12px_hsl(var(--primary)/0.6)]"
      style={{ scaleX }}
    />
  );
}
