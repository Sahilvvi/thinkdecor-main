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

export interface ExportOptions {
  /** Downscale so the longest edge is at most this (e.g. a small copy for detection). */
  maxDimension?: number;
  type?: 'image/png' | 'image/jpeg';
}

/** Where the mask sits, as fractions (0-1) of the photo's width/height. */
export interface MaskBox { x0: number; y0: number; x1: number; y1: number }

export interface DetectionExport {
  /** The clean photo with the mask drawn see-through, so the object under it stays visible. */
  blob: Blob;
  box: MaskBox;
}

export interface MaskCanvasHandle {
  exportMasked: (options?: ExportOptions) => Promise<Blob | null>;
  /**
   * For naming what's under the mask. The generation copy paints the mask
   * solid red, which hides the very object we want named — so detection gets
   * its own image: same photo, mask at ~40% opacity, plus the mask's bounds.
   */
  exportDetection: (options?: { maxDimension?: number }) => Promise<DetectionExport | null>;
  clear: () => void;
  undo: () => void;
  redo: () => void;
}

export interface Stroke {
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
  /** Strokes to restore on mount — lets the parent keep the mask across a remount ("Edit mask again"). */
  initialStrokes?: Stroke[];
  onStrokesChange?: (strokes: Stroke[]) => void;
  className?: string;
}>(function MaskCanvas({ imageSrc, onStrokeCountChange, initialStrokes, onStrokesChange, className }, ref) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const [ready, setReady] = useState(false);
  // width / height of the loaded photo, so the editor can be capped to the screen's height.
  const [aspect, setAspect] = useState(4 / 3);
  const [brush, setBrush] = useState<(typeof BRUSH_SIZES)[number]>(BRUSH_SIZES[1]);
  const strokesRef = useRef<Stroke[]>(initialStrokes ?? []);
  const loadedSrcRef = useRef<string | null>(null);
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
    // Strokes restored from initialStrokes belong to the first photo; a
    // different photo starts clean. (Idempotent, so StrictMode's double run is fine.)
    if (loadedSrcRef.current !== null && loadedSrcRef.current !== imageSrc) strokesRef.current = [];
    loadedSrcRef.current = imageSrc;
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
      setAspect(img.naturalWidth / img.naturalHeight);
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
    onStrokesChange?.(strokesRef.current);
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
    exportMasked: ({ maxDimension, type = 'image/png' }: ExportOptions = {}) =>
      new Promise((resolve) => {
        const canvas = canvasRef.current;
        if (!canvas) { resolve(null); return; }
        const scale = maxDimension ? Math.min(1, maxDimension / Math.max(canvas.width, canvas.height)) : 1;
        let target = canvas;
        if (scale < 1) {
          target = document.createElement('canvas');
          target.width = Math.round(canvas.width * scale);
          target.height = Math.round(canvas.height * scale);
          target.getContext('2d')?.drawImage(canvas, 0, 0, target.width, target.height);
        }
        target.toBlob((blob) => resolve(blob), type, type === 'image/jpeg' ? 0.85 : undefined);
      }),
    exportDetection: ({ maxDimension = 768 } = {}) =>
      new Promise((resolve) => {
        const canvas = canvasRef.current;
        const img = imgRef.current;
        const strokes = strokesRef.current.filter((st) => st.points.length > 0);
        if (!canvas || !img || strokes.length === 0) { resolve(null); return; }
        const scale = Math.min(1, maxDimension / Math.max(canvas.width, canvas.height));
        const w = Math.round(canvas.width * scale);
        const h = Math.round(canvas.height * scale);

        // The stroke layer on its own, so overlapping strokes tint once, not twice.
        const layer = document.createElement('canvas');
        layer.width = w; layer.height = h;
        const lctx = layer.getContext('2d');
        const out = document.createElement('canvas');
        out.width = w; out.height = h;
        const octx = out.getContext('2d');
        if (!lctx || !octx) { resolve(null); return; }
        lctx.lineCap = 'round'; lctx.lineJoin = 'round';
        lctx.strokeStyle = '#FF0000'; lctx.fillStyle = '#FF0000';

        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        for (const st of strokes) {
          const r = (st.size / 2) * scale;
          for (const p of st.points) {
            x0 = Math.min(x0, p.x * scale - r); y0 = Math.min(y0, p.y * scale - r);
            x1 = Math.max(x1, p.x * scale + r); y1 = Math.max(y1, p.y * scale + r);
          }
          if (st.points.length === 1) {
            lctx.beginPath();
            lctx.arc(st.points[0].x * scale, st.points[0].y * scale, r, 0, Math.PI * 2);
            lctx.fill();
            continue;
          }
          lctx.lineWidth = st.size * scale;
          lctx.beginPath();
          lctx.moveTo(st.points[0].x * scale, st.points[0].y * scale);
          for (const p of st.points.slice(1)) lctx.lineTo(p.x * scale, p.y * scale);
          lctx.stroke();
        }

        octx.drawImage(img, 0, 0, w, h);
        octx.globalAlpha = 0.4;
        octx.drawImage(layer, 0, 0);
        octx.globalAlpha = 1;

        const clamp = (v: number) => Math.max(0, Math.min(1, v));
        const box = { x0: clamp(x0 / w), y0: clamp(y0 / h), x1: clamp(x1 / w), y1: clamp(y1 / h) };
        out.toBlob((blob) => resolve(blob ? { blob, box } : null), 'image/jpeg', 0.85);
      }),
    clear: doClear,
    undo: doUndo,
    redo: doRedo,
  }), [doClear, doUndo, doRedo]);

  return (
    <div className={cn('flex flex-col gap-3', className)}>
      {/* Never taller than ~70% of the screen, however wide the panel is: a 1500px-wide
          canvas is 1100px tall and pushes half the photo below the fold. */}
      <div
        className="relative mx-auto w-full overflow-hidden rounded-[18px] border border-foreground/[0.1] bg-black/5"
        style={{ maxWidth: `min(100%, calc(70vh * ${aspect}))` }}
      >
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
