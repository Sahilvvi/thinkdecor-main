import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * Full-screen intro: the walkthrough video (topp.mp4) covers the entire
 * viewport on load, then shrinks into the EXACT on-screen position of the
 * hero's own room photo — measured live via `getTargetRect`, not a guessed
 * percentage — so the video's outline lines up with the photo it's handing
 * off to instead of visibly snapping into place. The hero (and everything
 * else) is already mounted underneath the whole time, just invisible, so
 * its real box is measurable the instant the video ends, on any viewport
 * (desktop or mobile) without this needing to know the hero's own layout.
 *
 * By explicit product decision this plays in full on every single page
 * load, unconditionally — no skip control and no reduced-motion bypass.
 */
export function IntroTakeover({
  onShrinkStart, onDone, getTargetRect,
}: {
  onShrinkStart: () => void;
  onDone: () => void;
  /** Reads the hero photo's current viewport rect. Called at the moment the video ends, so it's never stale. */
  getTargetRect: () => DOMRect | null;
}) {
  const [shrinking, setShrinking] = useState(false);
  const [target, setTarget] = useState<{ top: number; left: number; width: number; height: number } | null>(null);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prevOverflow; };
  }, []);

  const handleEnded = () => {
    const rect = getTargetRect();
    // Fallback only for the near-impossible case the hero photo isn't in the
    // DOM yet — an approximate slot rather than a full-screen freeze forever.
    setTarget(
      rect
        ? { top: rect.top, left: rect.left, width: rect.width, height: rect.height }
        : { top: 116, left: window.innerWidth * 0.54, width: window.innerWidth * 0.43, height: Math.min(window.innerHeight * 0.58, 600) },
    );
    setShrinking(true);
    onShrinkStart();
  };

  const full = { top: 0, left: 0, width: window.innerWidth, height: window.innerHeight, borderRadius: 0 };

  return (
    <motion.div
      className="fixed left-0 top-0 z-[999] overflow-hidden bg-[#00332C]"
      initial={full}
      animate={
        shrinking && target
          ? { top: target.top, left: target.left, width: target.width, height: target.height, borderRadius: 20 }
          : full
      }
      transition={{ duration: 0.95, ease: [0.22, 1, 0.36, 1] }}
      onAnimationComplete={() => { if (shrinking) onDone(); }}
    >
      <video
        src="/topp.mp4"
        autoPlay
        muted
        playsInline
        onEnded={handleEnded}
        className="h-full w-full object-cover"
      />
    </motion.div>
  );
}
