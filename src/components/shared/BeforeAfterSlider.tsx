import { useRef, useState, useCallback } from 'react';

interface BeforeAfterSliderProps {
  beforeSrc: string;
  afterSrc: string;
  beforeAlt?: string;
  afterAlt?: string;
  aspectRatio?: string;
}

export function BeforeAfterSlider({
  beforeSrc,
  afterSrc,
  beforeAlt = "Before",
  afterAlt = "After",
  aspectRatio = "aspect-[16/9]",
}: BeforeAfterSliderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const [containerWidth, setContainerWidth] = useState(0);
  const isDragging = useRef(false);

  const updatePosition = useCallback((clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
    setContainerWidth(rect.width);
  }, []);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    isDragging.current = true;
    containerRef.current?.setPointerCapture(e.pointerId);
    updatePosition(e.clientX);
  }, [updatePosition]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    e.preventDefault();
    updatePosition(e.clientX);
  }, [updatePosition]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    isDragging.current = false;
    containerRef.current?.releasePointerCapture(e.pointerId);
  }, []);

  const measureRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      containerRef.current = node;
      setContainerWidth(node.getBoundingClientRect().width);
    }
  }, []);

  return (
    <div
      ref={measureRef}
      className={`relative ${aspectRatio} w-full cursor-col-resize select-none touch-none`}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* After (full background) */}
      <img
        src={afterSrc}
        alt={afterAlt}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        draggable={false}
      />
      <div className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full bg-primary/80 backdrop-blur-sm text-primary-foreground text-xs font-medium z-10 pointer-events-none">
        After
      </div>

      {/* Before (clipped) */}
      <div
        className="absolute inset-0 overflow-hidden pointer-events-none"
        style={{ width: `${sliderPos}%` }}
      >
        <img
          src={beforeSrc}
          alt={beforeAlt}
          className="absolute inset-0 h-full object-cover"
          style={{ width: containerWidth > 0 ? `${containerWidth}px` : '100vw', maxWidth: 'none' }}
          draggable={false}
        />
        <div className="absolute bottom-3 left-3 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-sm text-white text-xs font-medium">
          Before
        </div>
      </div>

      {/* Slider handle */}
      <div
        className="absolute top-0 bottom-0 z-20 pointer-events-none"
        style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
      >
        <div className="w-0.5 h-full bg-white/80" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
            <path d="M7 4L3 10L7 16" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M13 4L17 10L13 16" stroke="hsl(var(--primary))" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
