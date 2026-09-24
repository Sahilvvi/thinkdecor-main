import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

/**
 * Full-screen intro: the walkthrough video (topp.mp4) covers the entire
 * viewport, paused on its first frame, and is scrubbed by the visitor's own
 * scroll — wheel, touch-drag or arrow/space/page keys — instead of
 * autoplaying. Scroll input is intercepted (not passed through to the page)
 * the whole time, so the visitor is scrubbing the video, not scrolling a
 * page underneath it, until the video reaches its end.
 *
 * Scroll input moves a target position exactly (1:1, same total distance a
 * raw scroll would), but the video's currentTime doesn't jump straight to
 * it — it eases toward that target a little more each frame, so it's
 * always trailing slightly behind. Mapping scroll 1:1 straight onto
 * currentTime is what makes video scrubbing read as disconnected
 * jump-cuts; trailing easing is what turns it into one continuous, gliding
 * motion — the same trick behind Apple-style scroll-driven product videos.
 *
 * Once fully scrubbed, it shrinks into the EXACT on-screen position of the
 * hero's own room photo — measured live via `getTargetRect`, not a guessed
 * percentage — so the video's outline lines up with the photo it's handing
 * off to instead of visibly snapping into place. The hero (and everything
 * else) is already mounted underneath the whole time, just invisible, so
 * its real box is measurable the instant scrubbing completes, on any
 * viewport (desktop or mobile) without this needing to know the hero's own
 * layout.
 *
 * topp.mp4 is encoded for scrubbing: every frame is a keyframe (a seek never
 * has to decode a run of earlier frames first) and the index sits at the
 * front of the file (it can start playing before it has fully downloaded).
 */

// Total px of scroll it takes to play the video through, start to end.
const SCROLL_DISTANCE = 2200;
// Effective px-per-tick for a single arrow-key / space / page-key press.
const KEY_STEP = SCROLL_DISTANCE * 0.12;
// How much of the remaining gap to the target the displayed position
// closes per frame at 60fps — higher = snappier/tighter, lower =
// smoother/more trailing lag behind the raw scroll.
const EASE = 0.32;
// Skip re-seeking the video for sub-frame position changes — topp.mp4 is
// encoded at 24fps, so anything smaller than one frame's duration can't
// produce a different visible frame and is a wasted decode.
const MIN_SEEK_DELTA = 1 / 24;
// After a swipe is released, keep gliding like a native scroll: the
// finger's speed carries on and decays by this factor per 60fps frame.
const TOUCH_FRICTION = 0.94;

/**
 * Phones/tablets scrub exactly like desktop, but load and seek differently:
 * - they stream the video instead of waiting for the whole file to download
 *   first, so the first frame appears (and scrubbing works) almost at once
 *   on a mobile connection;
 * - they only ask for a new frame once the previous seek has finished —
 *   mobile decoders fall behind if seeks are queued faster than they can
 *   serve them, which is what made scrubbing stutter.
 */
function detectMobile() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768 || window.matchMedia('(pointer: coarse) and (max-width: 1024px)').matches;
}

export function IntroTakeover({
  onShrinkStart, onDone, getTargetRect,
}: {
  onShrinkStart: () => void;
  onDone: () => void;
  /** Reads the hero photo's current viewport rect. Called the instant scrubbing completes, so it's never stale. */
  getTargetRect: () => DOMRect | null;
}) {
  const [shrinking, setShrinking] = useState(false);
  const [target, setTarget] = useState<{ top: number; left: number; width: number; height: number } | null>(null);
  const [hasStarted, setHasStarted] = useState(false);
  const [ready, setReady] = useState(false);
  const [isMobile] = useState(detectMobile);

  const videoRef = useRef<HTMLVideoElement>(null);
  const targetProgressRef = useRef(0); // 0..1 — exact position raw scroll input has accumulated to
  const displayProgressRef = useRef(0); // 0..1 — smoothed value actually applied to the video, trails target
  const rafRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number | null>(null);
  const doneRef = useRef(false); // guards finish() firing more than once
  const touchYRef = useRef<number | null>(null);
  const touchTimeRef = useRef(0);
  const velocityRef = useRef(0); // px per 60fps frame, for post-swipe glide

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prevOverflow; };
  }, []);

  // Desktop: fetch the whole clip into memory up front so every scrub seek is
  // a local, instant memory read instead of a network round-trip.
  // Mobile: stream it — waiting on the full download first is what made the
  // intro slow to appear on a phone connection. The file's index is at the
  // front, so the browser shows the first frame and knows the duration as
  // soon as the first few KB arrive, and buffers the rest ahead of the scrub.
  useEffect(() => {
    if (isMobile) {
      if (videoRef.current) {
        videoRef.current.src = '/topp.mp4';
        videoRef.current.load();
      }
      return;
    }
    let cancelled = false;
    let objectUrl: string | null = null;
    fetch('/topp.mp4')
      .then((res) => res.blob())
      .then((blob) => {
        if (cancelled) return;
        objectUrl = URL.createObjectURL(blob);
        if (videoRef.current) videoRef.current.src = objectUrl;
        setReady(true);
      })
      .catch(() => {
        // Fall back to a normal networked src rather than staying blank forever.
        if (!cancelled && videoRef.current) {
          videoRef.current.src = '/topp.mp4';
          setReady(true);
        }
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [isMobile]);

  const finish = () => {
    if (doneRef.current) return;
    doneRef.current = true;
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

  const addDelta = (delta: number) => {
    if (doneRef.current) return;
    targetProgressRef.current = Math.min(1, Math.max(0, targetProgressRef.current + delta / SCROLL_DISTANCE));
    if (targetProgressRef.current > 0.001) setHasStarted(true);
  };

  useEffect(() => {
    const loop = (time: number) => {
      rafRef.current = requestAnimationFrame(loop);
      if (doneRef.current) return;

      const last = lastFrameRef.current ?? time;
      // Normalized to "60fps steps" so the ease reads the same regardless of
      // the display's actual refresh rate; clamp huge gaps (tab was hidden).
      const dt = Math.min(48, time - last) / 16.67;
      lastFrameRef.current = time;

      // Post-swipe glide (touch only — wheel input already has OS momentum).
      if (touchYRef.current == null && Math.abs(velocityRef.current) > 0.05) {
        addDelta(velocityRef.current * dt);
        velocityRef.current *= TOUCH_FRICTION ** dt;
      }

      displayProgressRef.current += (targetProgressRef.current - displayProgressRef.current) * Math.min(1, EASE * dt);

      const v = videoRef.current;
      if (v && Number.isFinite(v.duration) && v.duration > 0 && !(isMobile && v.seeking)) {
        const wantTime = displayProgressRef.current * v.duration;
        if (Math.abs(wantTime - v.currentTime) > MIN_SEEK_DELTA) v.currentTime = wantTime;
      }

      if (targetProgressRef.current >= 1 && displayProgressRef.current > 0.995) finish();
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current != null) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => { e.preventDefault(); addDelta(e.deltaY); };
    const onTouchStart = (e: TouchEvent) => {
      touchYRef.current = e.touches[0]?.clientY ?? null;
      touchTimeRef.current = performance.now();
      velocityRef.current = 0;
    };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const y = e.touches[0]?.clientY;
      if (y == null || touchYRef.current == null) return;
      const delta = touchYRef.current - y;
      const now = performance.now();
      const frames = Math.max(1, (now - touchTimeRef.current) / 16.67);
      // Smoothed so one jittery sample doesn't fling the video.
      velocityRef.current = velocityRef.current * 0.6 + (delta / frames) * 0.4;
      touchTimeRef.current = now;
      addDelta(delta);
      touchYRef.current = y;
    };
    const onTouchEnd = () => {
      // A finger that paused before lifting shouldn't glide.
      if (performance.now() - touchTimeRef.current > 80) velocityRef.current = 0;
      touchYRef.current = null;
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        e.preventDefault();
        addDelta(KEY_STEP);
      } else if (e.key === 'ArrowUp' || e.key === 'PageUp') {
        e.preventDefault();
        addDelta(-KEY_STEP);
      }
    };

    window.addEventListener('wheel', onWheel, { passive: false });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: false });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('touchcancel', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('touchcancel', onTouchEnd);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, []);

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
        ref={videoRef}
        muted
        playsInline
        preload="auto"
        className="h-full w-full object-cover"
        onLoadedData={() => setReady(true)}
      />

      {!ready && !shrinking && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white/80" />
        </div>
      )}

      {ready && !hasStarted && !shrinking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="pointer-events-none absolute inset-x-0 bottom-10 flex flex-col items-center gap-2 text-white/80"
        >
          <span className="text-[11px] font-medium uppercase tracking-[0.18em]">{isMobile ? 'Swipe up to begin' : 'Scroll to begin'}</span>
          <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}>
            <ChevronDown className="h-5 w-5" />
          </motion.span>
        </motion.div>
      )}
    </motion.div>
  );
}
