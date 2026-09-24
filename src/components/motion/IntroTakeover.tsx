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

/**
 * Phones and tablets get a plain autoplay-through instead of the
 * scroll-scrubbed version: seeking a video's currentTime every animation
 * frame is cheap on a desktop GPU decoder but visibly stutters on mobile
 * hardware, and touch-scrubbing needs the same per-frame seeks. Detected
 * once up front (not on every render) via viewport width plus a coarse
 * pointer, so a touch laptop with a big screen still gets the desktop cut.
 */
function detectMobile() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768 || window.matchMedia('(pointer: coarse) and (max-width: 900px)').matches;
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

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prevOverflow; };
  }, []);

  // Desktop: fetch the whole clip into memory up front so every scrub seek is
  // a local, instant memory read instead of a network round-trip — on a real
  // connection, seeking straight off a network `src` stalls mid-scrub
  // waiting on range requests, which reads as the same stutter/lag no matter
  // how good the easing math is.
  //
  // Mobile plays the video through once instead of scrubbing it (see
  // detectMobile above), so it never needs the whole clip in memory before
  // starting — waiting on a ~8MB blob download first is exactly the "takes
  // time to load" delay mobile visitors were hitting. It just streams the
  // network `src` and starts as soon as the browser has enough buffered.
  useEffect(() => {
    if (isMobile) {
      if (videoRef.current) videoRef.current.src = '/topp.mp4';
      setReady(true);
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
    if (!hasStarted && targetProgressRef.current > 0.001) setHasStarted(true);
  };

  // Mobile never scrubs, so it has no use for the per-frame seek loop below.
  useEffect(() => {
    if (isMobile) return;

    const loop = (time: number) => {
      rafRef.current = requestAnimationFrame(loop);
      if (doneRef.current) return;

      const last = lastFrameRef.current ?? time;
      // Normalized to "60fps steps" so the ease reads the same regardless of
      // the display's actual refresh rate; clamp huge gaps (tab was hidden).
      const dt = Math.min(48, time - last) / 16.67;
      lastFrameRef.current = time;

      displayProgressRef.current += (targetProgressRef.current - displayProgressRef.current) * Math.min(1, EASE * dt);

      const v = videoRef.current;
      if (v && Number.isFinite(v.duration) && v.duration > 0) {
        const wantTime = displayProgressRef.current * v.duration;
        if (Math.abs(wantTime - v.currentTime) > MIN_SEEK_DELTA) v.currentTime = wantTime;
      }

      if (targetProgressRef.current >= 1 && displayProgressRef.current > 0.995) finish();
    };

    rafRef.current = requestAnimationFrame(loop);
    return () => { if (rafRef.current != null) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasStarted, isMobile]);

  // Desktop only: scroll/touch-drag/keys scrub the video (see the rAF loop
  // above). Mobile instead autoplays the video straight through — see the
  // <video> element's onEnded handler — and skips this listener setup
  // entirely so a normal touch-scroll never gets hijacked or preventDefault'd.
  useEffect(() => {
    if (isMobile) return;

    const onWheel = (e: WheelEvent) => { e.preventDefault(); addDelta(e.deltaY); };
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
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [isMobile]);

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
        autoPlay={isMobile}
        preload="auto"
        className="h-full w-full object-cover"
        onPlaying={() => setHasStarted(true)}
        onEnded={finish}
      />

      {!ready && !shrinking && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="h-6 w-6 animate-spin rounded-full border-2 border-white/30 border-t-white/80" />
        </div>
      )}

      {!isMobile && ready && !hasStarted && !shrinking && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="pointer-events-none absolute inset-x-0 bottom-10 flex flex-col items-center gap-2 text-white/80"
        >
          <span className="text-[11px] font-medium uppercase tracking-[0.18em]">Scroll to begin</span>
          <motion.span animate={{ y: [0, 6, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}>
            <ChevronDown className="h-5 w-5" />
          </motion.span>
        </motion.div>
      )}

      {isMobile && !shrinking && (
        <motion.button
          type="button"
          onClick={finish}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="absolute right-4 top-[max(1rem,env(safe-area-inset-top))] rounded-full bg-white/10 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] text-white/80 backdrop-blur-sm"
        >
          Skip
        </motion.button>
      )}
    </motion.div>
  );
}
