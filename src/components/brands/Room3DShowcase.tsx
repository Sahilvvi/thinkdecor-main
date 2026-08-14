import { useRef, useState, useCallback } from 'react';
import { Sparkles, MoveHorizontal, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

/**
 * Interactive 3D showcase: mouse-tilt card with a draggable
 * before/after slider showing an AI-styled room.
 */
export function Room3DShowcase() {
  const { ref, isVisible } = useScrollAnimation();
  const cardRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [split, setSplit] = useState(55);
  const dragging = useRef(false);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const el = cardRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setTilt({ x: py * -8, y: px * 10 });
    if (dragging.current) {
      setSplit(Math.min(96, Math.max(4, ((e.clientX - r.left) / r.width) * 100)));
    }
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const el = cardRef.current;
    if (!el || !dragging.current) return;
    const r = el.getBoundingClientRect();
    setSplit(Math.min(96, Math.max(4, ((e.touches[0].clientX - r.left) / r.width) * 100)));
  }, []);

  return (
    <div className="relative overflow-hidden">
      <div className="absolute inset-0 bg-card/40" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full bg-primary/[0.08] blur-[160px]" />
      <div
        ref={ref}
        className={`relative z-10 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 mb-6">
            <MoveHorizontal className="h-4 w-4" />
            Try It Yourself
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            This Is What Your Customers{' '}
            <span className="text-gradient-primary">Will Experience</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Drag the handle. One empty room, instantly styled with real products — scale-accurate, light-accurate.
          </p>
        </div>

        {/* Tilt stage */}
        <div className="[perspective:1400px] select-none">
          <div
            ref={cardRef}
            onMouseMove={onMouseMove}
            onMouseLeave={() => { setTilt({ x: 0, y: 0 }); dragging.current = false; }}
            onMouseUp={() => { dragging.current = false; }}
            onTouchMove={onTouchMove}
            onTouchEnd={() => { dragging.current = false; }}
            className="relative rounded-3xl overflow-hidden border border-border/40 shadow-2xl transition-transform duration-200 ease-out will-change-transform [transform-style:preserve-3d]"
            style={{ transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` }}
          >
            {/* After (base layer) */}
            <img
              src="/assets/samples/styled_room.png"
              alt="AI-styled room"
              draggable={false}
              className="w-full aspect-[16/9] object-cover pointer-events-none"
            />
            {/* Before (clipped layer) */}
            <img
              src="/assets/samples/empty_room.png"
              alt="Empty room"
              draggable={false}
              className="absolute inset-0 w-full h-full object-cover pointer-events-none"
              style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
            />

            {/* Labels */}
            <span
              className="absolute top-5 left-5 glass px-3.5 py-1.5 rounded-full text-xs font-semibold text-foreground transition-opacity duration-300"
              style={{ opacity: split > 15 ? 1 : 0, transform: 'translateZ(40px)' }}
            >
              Before
            </span>
            <span
              className="absolute top-5 right-5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-primary text-primary-foreground shadow-glow flex items-center gap-1.5 transition-opacity duration-300"
              style={{ opacity: split < 85 ? 1 : 0, transform: 'translateZ(40px)' }}
            >
              <Sparkles className="h-3 w-3" />
              AI Styled
            </span>
            <span
              className="absolute bottom-5 left-5 glass px-3.5 py-1.5 rounded-full text-[11px] text-muted-foreground hidden sm:block"
              style={{ transform: 'translateZ(30px)' }}
            >
              Rendered from a single customer photo
            </span>

            {/* Divider + handle */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-white/80 shadow-[0_0_20px_rgba(255,255,255,0.5)]"
              style={{ left: `${split}%` }}
            />
            <button
              aria-label="Drag to compare before and after"
              onMouseDown={(e) => { e.preventDefault(); dragging.current = true; }}
              onTouchStart={() => { dragging.current = true; }}
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-primary border-4 border-white/90 shadow-glow flex items-center justify-center cursor-ew-resize hover:scale-110 active:scale-95 transition-transform"
              style={{ left: `${split}%`, transform: undefined }}
            >
              <MoveHorizontal className="h-5 w-5 text-primary-foreground" />
            </button>

            {/* Glare */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                background: `radial-gradient(600px circle at ${50 + tilt.y * 4}% ${50 + tilt.x * -4}%, rgba(255,255,255,0.08), transparent 60%)`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
