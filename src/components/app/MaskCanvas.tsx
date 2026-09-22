import {
  forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState,
} from 'react';
import { Redo2, Undo2, Eraser } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Paint-a-red-mask editor, shared by Cleanup and Replace.
 *
 * The redesign model (supabase/functions/generate-redesign) has no separate
 * mask channel — it takes one image and a text prompt. So, exactly like the
 * Android app (MaskUtils / MaskEditorWidgets), the mask is baked straight
 * into the photo as a solid red overlay: whatever's under the red gets
 * erased (Cleanup) or swapped (Replace) by the model, per the prompt built
 * server-side. `exportMasked()` on the ref returns that composited photo —
 * there's no separate "export" step, the canvas the user paints on already
 * *is* the image to send.
 */

export interface MaskCanvasHandle {
  exportMasked: () => Promise<Blob | null>;
  clear: () => void;
  undo: () => void;
  redo: () => void;
}

interface Stroke {
  points: { x: number; y: number }[];
  size: number;
}

const BRUSH_SIZES = [
  { key: 'small', label: 'Small', px: 24 },
  { key: 'medium', label: 'Medium', px: 44 },
  { key: 'large', label: 'Large', px: 72 },
] as const;

/** Longest edge a painted photo is downscaled to before sending — keeps uploads/exports fast without visibly softening the mask. */
const MAX_DIMENSION = 1440;

export const MaskCanvas = forwardRef<MaskCanvasHandle, {
  imageSrc: string;
  onStrokeCountChange?: (count: number) => void;
  className?: string;
}>(function MaskCanvas({ imageSrc, onStrokeCountChange, className }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [ready, setReady] = useState(false);
  const [brush, setBrush] = useState<(typeof BRUSH_SIZES)[number]>(BRUSH_SIZES[1]);
  const strokesRef = useRef<Stroke[]>([]);
  const redoRef = useRef<Stroke[]>([]);
  const drawingRef = useRef<Stroke | null>(null);
  const [, forceRender] = useState(0);

  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imgRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#FF0000';
    ctx.fillStyle = '#FF0000';
    const all = drawingRef.current ? [...strokesRef.current, drawingRef.current] : strokesRef.current;
    for (const stroke of all) {
      if (stroke.points.length === 0) continue;
      if (stroke.points.length === 1) {
        const p = stroke.points[0];
        ctx.beginPath();
        ctx.arc(p.x, p.y, stroke.size / 2, 0, Math.PI * 2);
        ctx.fill();
        continue;
      }
      ctx.lineWidth = stroke.size;
      ctx.beginPath();
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (const p of stroke.points.slice(1)) ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }
  }, []);

  // Load the source photo once and size the canvas to it (capped for upload speed).
  useEffect(() => {
    setReady(false);
    strokesRef.current = [];
    redoRef.current = [];
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const scale = Math.min(1, MAX_DIMENSION / Math.max(img.naturalWidth, img.naturalHeight));
      const canvas = canvasRef.current;
      if (canvas) {
        canvas.width = Math.round(img.naturalWidth * scale);
        canvas.height = Math.round(img.naturalHeight * scale);
      }
      imgRef.current = img;
      setReady(true);
    };
    img.src = imageSrc;
  }, [imageSrc]);

  useEffect(() => { if (ready) redraw(); }, [ready, redraw]);
  useEffect(() => { onStrokeCountChange?.(strokesRef.current.length); }, [onStrokeCountChange]);

  const pointFromEvent = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((e.clientX - rect.left) / rect.width) * canvas.width,
      y: ((e.clientY - rect.top) / rect.height) * canvas.height,
    };
  };

  const notify = () => {
    onStrokeCountChange?.(strokesRef.current.length);
    forceRender((n) => n + 1);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!ready) return;
    (e.target as HTMLCanvasElement).setPointerCapture(e.pointerId);
    drawingRef.current = { points: [pointFromEvent(e)], size: brush.px };
    redoRef.current = [];
    redraw();
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawingRef.current) return;
    drawingRef.current.points.push(pointFromEvent(e));
    redraw();
  };

  const endStroke = () => {
    if (!drawingRef.current) return;
    strokesRef.current = [...strokesRef.current, drawingRef.current];
    drawingRef.current = null;
    redraw();
    notify();
  };

  const doClear = useCallback(() => {
    redoRef.current = [];
    strokesRef.current = [];
    drawingRef.current = null;
    redraw();
    notify();
  }, [redraw]);

  const doUndo = useCallback(() => {
    if (strokesRef.current.length === 0) return;
    const last = strokesRef.current[strokesRef.current.length - 1];
    strokesRef.current = strokesRef.current.slice(0, -1);
    redoRef.current = [...redoRef.current, last];
    redraw();
    notify();
  }, [redraw]);

  const doRedo = useCallback(() => {
    if (redoRef.current.length === 0) return;
    const next = redoRef.current[redoRef.current.length - 1];
    redoRef.current = redoRef.current.slice(0, -1);
    strokesRef.current = [...strokesRef.current, next];
    redraw();
    notify();
  }, [redraw]);

  useImperativeHandle(ref, () => ({
    exportMasked: () =>
      new Promise((resolve) => {
        const canvas = canvasRef.current;
        if (!canvas) { resolve(null); return; }
        canvas.toBlob((blob) => resolve(blob), 'image/png');
      }),
    clear: doClear,
    undo: doUndo,
    redo: doRedo,
  }), [doClear, doUndo, doRedo]);

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      <div className="relative overflow-hidden rounded-[18px] border border-foreground/[0.1] bg-black/5">
        <canvas
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endStroke}
          onPointerLeave={endStroke}
          className="block w-full touch-none"
          style={{ aspectRatio: canvasRef.current ? `${canvasRef.current.width} / ${canvasRef.current.height}` : '4 / 3' }}
        />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/60 text-[13px] text-muted-foreground">
            Loading photo…
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-1.5">
          {BRUSH_SIZES.map((b) => (
            <button
              key={b.key}
              type="button"
              onClick={() => setBrush(b)}
              aria-pressed={brush.key === b.key}
              className={cn(
                'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-medium transition-colors',
                brush.key === b.key
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-foreground/[0.12] text-foreground/60 hover:text-foreground',
              )}
            >
              <span className="rounded-full bg-current" style={{ width: 6 + BRUSH_SIZES.indexOf(b) * 3, height: 6 + BRUSH_SIZES.indexOf(b) * 3 }} />
              {b.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={doUndo}
            disabled={strokesRef.current.length === 0}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-foreground/[0.12] text-foreground/60 transition-colors hover:text-foreground disabled:opacity-30"
            aria-label="Undo"
          >
            <Undo2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={doRedo}
            disabled={redoRef.current.length === 0}
            className="flex h-8 w-8 items-center justify-center rounded-full border border-foreground/[0.12] text-foreground/60 transition-colors hover:text-foreground disabled:opacity-30"
            aria-label="Redo"
          >
            <Redo2 className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            onClick={doClear}
            className="flex items-center gap-1.5 rounded-full border border-foreground/[0.12] px-3 py-1.5 text-[12.5px] font-medium text-foreground/60 transition-colors hover:text-destructive"
          >
            <Eraser className="h-3.5 w-3.5" /> Clear
          </button>
        </div>
      </div>
    </div>
  );
});
