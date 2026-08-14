import { useRef, ReactNode } from 'react';
import { motion, useMotionValue, useSpring } from 'framer-motion';

interface TiltCardProps {
  children: ReactNode;
  /** Max tilt in degrees */
  max?: number;
  className?: string;
}

/** Spring-physics 3D tilt wrapper — card follows the mouse in 3D space. */
export function TiltCard({ children, max = 8, className = '' }: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 180, damping: 18 });
  const sry = useSpring(ry, { stiffness: 180, damping: 18 });

  return (
    <div className={`[perspective:1000px] ${className}`}>
      <motion.div
        ref={ref}
        style={{ rotateX: srx, rotateY: sry, transformStyle: 'preserve-3d' }}
        onMouseMove={(e) => {
          const r = ref.current?.getBoundingClientRect();
          if (!r) return;
          rx.set(((e.clientY - r.top) / r.height - 0.5) * -max);
          ry.set(((e.clientX - r.left) / r.width - 0.5) * max);
        }}
        onMouseLeave={() => {
          rx.set(0);
          ry.set(0);
        }}
      >
        {children}
      </motion.div>
    </div>
  );
}
