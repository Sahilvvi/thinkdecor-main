import { motion } from 'framer-motion';

/** Stylized 3D-animated Mantha character (pure code — no model asset needed). */
export function ManthaBot({ className = '' }: { className?: string }) {
  return (
    <div className={`[perspective:600px] pointer-events-none select-none ${className}`} aria-hidden="true">
      <motion.div
        animate={{ y: [0, -10, 0], rotateY: [-14, 14, -14] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        style={{ transformStyle: 'preserve-3d' }}
        className="relative w-28 h-32"
      >
        {/* Antenna */}
        <div className="absolute left-1/2 -translate-x-1/2 top-0 w-0.5 h-4 bg-primary/60" />
        <motion.div
          animate={{ opacity: [0.5, 1, 0.5], scale: [0.9, 1.15, 0.9] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute left-1/2 -translate-x-1/2 -top-1.5 w-2.5 h-2.5 rounded-full bg-success shadow-[0_0_12px_hsl(160_84%_39%/0.9)]"
        />
        {/* Head */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-16 rounded-2xl bg-gradient-to-b from-[hsl(168_30%_95%)] to-[hsl(168_24%_92%)] border border-primary/40 shadow-[0_0_30px_hsl(168_100%_17%/0.45)]">
          {/* Visor */}
          <div className="absolute inset-x-2.5 top-3 h-7 rounded-xl bg-black/38 border border-primary/25 overflow-hidden">
            {/* Eyes */}
            <motion.span
              animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
              transition={{ duration: 3.5, repeat: Infinity, times: [0, 0.45, 0.5, 0.55, 1] }}
              className="absolute left-3 top-1/2 -translate-y-1/2 w-2.5 h-3 rounded-full bg-success shadow-[0_0_8px_hsl(160_84%_39%/0.9)]"
            />
            <motion.span
              animate={{ scaleY: [1, 1, 0.1, 1, 1] }}
              transition={{ duration: 3.5, repeat: Infinity, times: [0, 0.45, 0.5, 0.55, 1] }}
              className="absolute right-3 top-1/2 -translate-y-1/2 w-2.5 h-3 rounded-full bg-success shadow-[0_0_8px_hsl(160_84%_39%/0.9)]"
            />
            {/* Scan sweep */}
            <motion.span
              animate={{ x: ['-100%', '160%'] }}
              transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-0 bottom-0 w-4 bg-gradient-to-r from-transparent via-primary/30 to-transparent"
            />
          </div>
          {/* Smile */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-1.5 w-6 h-1 rounded-full bg-primary/50" />
        </div>
        {/* Body */}
        <div className="absolute top-[76px] left-1/2 -translate-x-1/2 w-14 h-11 rounded-xl bg-gradient-to-b from-[hsl(168_28%_95%)] to-[hsl(168_22%_92%)] border border-primary/30">
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2.4, repeat: Infinity }}
            className="absolute left-1/2 -translate-x-1/2 top-3 w-4 h-4 rounded-full bg-primary/70 shadow-[0_0_14px_hsl(168_100%_25%/0.9)]"
          />
        </div>
        {/* Arms */}
        <motion.div
          animate={{ rotate: [8, -6, 8] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-[80px] left-1 w-2.5 h-8 rounded-full bg-[hsl(168_28%_93%)] border border-primary/25 origin-top"
        />
        <motion.div
          animate={{ rotate: [-8, 6, -8] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          className="absolute top-[80px] right-1 w-2.5 h-8 rounded-full bg-[hsl(168_28%_93%)] border border-primary/25 origin-top"
        />
        {/* Orbit ring */}
        <div className="absolute top-[86px] left-1/2 -translate-x-1/2 w-24 h-6 rounded-[100%] border border-primary/25 animate-spin-slow [transform:rotateX(72deg)]" />
      </motion.div>
      {/* Ground shadow */}
      <motion.div
        animate={{ scaleX: [1, 0.82, 1], opacity: [0.5, 0.3, 0.5] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="mx-auto mt-1 w-20 h-2.5 rounded-[100%] bg-black/42 blur-[3px]"
      />
    </div>
  );
}
