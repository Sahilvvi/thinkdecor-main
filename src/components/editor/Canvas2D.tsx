import { useEffect, useRef, useCallback, useState, forwardRef, useImperativeHandle } from 'react';
import type { Layer } from '@/hooks/useLayers';

interface Canvas2DProps {
  baseImageUrl: string | null;
  layers: Layer[];
  width: number;
  height: number;
  zoom: number;
  showBefore: boolean;
  panOffset: { x: number; y: number };
  onPanChange: (offset: { x: number; y: number }) => void;
}

export interface Canvas2DHandle {
  exportCanvas: (resolution: number, format: 'png' | 'jpg') => Promise<Blob>;
  generateThumbnail: () => Promise<Blob>;
}

// Map CSS blend modes to Canvas globalCompositeOperation
const blendModeMap: Record<string, GlobalCompositeOperation> = {
  'normal': 'source-over',
  'multiply': 'multiply',
  'overlay': 'overlay',
  'screen': 'screen',
  'soft-light': 'soft-light',
  'hard-light': 'hard-light',
  'difference': 'difference',
  'exclusion': 'exclusion',
  'color-dodge': 'color-dodge',
  'color-burn': 'color-burn',
  'darken': 'darken',
  'lighten': 'lighten',
  'hue': 'hue',
  'saturation': 'saturation',
  'color': 'color',
  'luminosity': 'luminosity',
};

// Image cache for better performance
const imageCache = new Map<string, HTMLImageElement>();

async function loadImage(src: string): Promise<HTMLImageElement> {
  const cached = imageCache.get(src);
  if (cached && cached.complete) {
    return cached;
  }
  
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      imageCache.set(src, img);
      resolve(img);
    };
    img.onerror = reject;
    img.src = src;
  });
}

export const Canvas2D = forwardRef<Canvas2DHandle, Canvas2DProps>(({
  baseImageUrl,
  layers,
  width,
  height,
  zoom,
  showBefore,
  panOffset,
  onPanChange,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imagesLoaded, setImagesLoaded] = useState(false);

  // Render function
  const render = useCallback(async (
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
    renderLayers: boolean = true
  ) => {
    // Clear canvas
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // Draw checkerboard pattern as background
    const patternSize = 10;
    for (let y = 0; y < canvasHeight; y += patternSize) {
      for (let x = 0; x < canvasWidth; x += patternSize) {
        ctx.fillStyle = (x / patternSize + y / patternSize) % 2 === 0 
          ? 'hsl(222, 20%, 15%)' 
          : 'hsl(222, 20%, 12%)';
        ctx.fillRect(x, y, patternSize, patternSize);
      }
    }

    // Draw base image
    if (baseImageUrl) {
      try {
        const baseImg = await loadImage(baseImageUrl);
        
        // Calculate aspect-fit dimensions
        const imgAspect = baseImg.width / baseImg.height;
        const canvasAspect = canvasWidth / canvasHeight;
        
        let drawWidth: number, drawHeight: number, drawX: number, drawY: number;
        
        if (imgAspect > canvasAspect) {
          drawWidth = canvasWidth;
          drawHeight = canvasWidth / imgAspect;
          drawX = 0;
          drawY = (canvasHeight - drawHeight) / 2;
        } else {
          drawHeight = canvasHeight;
          drawWidth = canvasHeight * imgAspect;
          drawX = (canvasWidth - drawWidth) / 2;
          drawY = 0;
        }
        
        ctx.drawImage(baseImg, drawX, drawY, drawWidth, drawHeight);
      } catch (error) {
        console.error('Failed to load base image:', error);
      }
    }

    // Draw layers
    if (renderLayers) {
      const visibleLayers = layers.filter(l => l.visible && l.texture_url);
      
      for (const layer of visibleLayers) {
        if (!layer.texture_url) continue;
        
        try {
          const textureImg = await loadImage(layer.texture_url);
          
          ctx.save();
          
          // Set blend mode
          ctx.globalCompositeOperation = blendModeMap[layer.blend_mode] || 'source-over';
          
          // Set opacity
          ctx.globalAlpha = layer.opacity;
          
          // Calculate center of canvas
          const centerX = canvasWidth / 2;
          const centerY = canvasHeight / 2;
          
          // Apply transforms
          ctx.translate(centerX + layer.offset_x, centerY + layer.offset_y);
          ctx.rotate((layer.rotation * Math.PI) / 180);
          ctx.scale(
            layer.scale * (layer.flip_x ? -1 : 1),
            layer.scale * (layer.flip_y ? -1 : 1)
          );
          
          if (layer.tile) {
            // Create tiling pattern
            const pattern = ctx.createPattern(textureImg, 'repeat');
            if (pattern) {
              // Draw a large rectangle with the pattern, centered
              const tileSize = Math.max(canvasWidth, canvasHeight) * 2;
              ctx.fillStyle = pattern;
              ctx.fillRect(-tileSize / 2, -tileSize / 2, tileSize, tileSize);
            }
          } else {
            // Draw single texture centered
            const drawWidth = textureImg.width;
            const drawHeight = textureImg.height;
            ctx.drawImage(
              textureImg,
              -drawWidth / 2,
              -drawHeight / 2,
              drawWidth,
              drawHeight
            );
          }
          
          ctx.restore();
        } catch (error) {
          console.error('Failed to load texture:', error);
        }
      }
    }
    
    setImagesLoaded(true);
  }, [baseImageUrl, layers]);

  // Main render effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    render(ctx, width, height, !showBefore);
  }, [render, width, height, showBefore]);

  // Export handler
  const exportCanvas = useCallback(async (
    resolution: number,
    format: 'png' | 'jpg'
  ): Promise<Blob> => {
    const exportWidth = width * resolution;
    const exportHeight = height * resolution;
    
    const offscreen = document.createElement('canvas');
    offscreen.width = exportWidth;
    offscreen.height = exportHeight;
    
    const ctx = offscreen.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');
    
    // Scale for higher resolution
    ctx.scale(resolution, resolution);
    
    // Render at full resolution
    await render(ctx, width, height, true);
    
    return new Promise((resolve, reject) => {
      offscreen.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to export canvas'));
        },
        format === 'jpg' ? 'image/jpeg' : 'image/png',
        0.95
      );
    });
  }, [render, width, height]);

  // Thumbnail generator
  const generateThumbnail = useCallback(async (): Promise<Blob> => {
    const thumbSize = 256;
    const aspect = width / height;
    const thumbWidth = aspect > 1 ? thumbSize : thumbSize * aspect;
    const thumbHeight = aspect > 1 ? thumbSize / aspect : thumbSize;
    
    const offscreen = document.createElement('canvas');
    offscreen.width = thumbWidth;
    offscreen.height = thumbHeight;
    
    const ctx = offscreen.getContext('2d');
    if (!ctx) throw new Error('Failed to get canvas context');
    
    ctx.scale(thumbWidth / width, thumbHeight / height);
    await render(ctx, width, height, true);
    
    return new Promise((resolve, reject) => {
      offscreen.toBlob(
        (blob) => {
          if (blob) resolve(blob);
          else reject(new Error('Failed to generate thumbnail'));
        },
        'image/png',
        0.8
      );
    });
  }, [render, width, height]);

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    exportCanvas,
    generateThumbnail,
  }), [exportCanvas, generateThumbnail]);

  // Pan handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      e.preventDefault();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      onPanChange({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      // Zoom is handled by parent
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden flex items-center justify-center bg-background"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      onWheel={handleWheel}
      style={{ cursor: isDragging ? 'grabbing' : 'default' }}
    >
      <div
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom / 100})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
        }}
      >
        <canvas
          ref={canvasRef}
          width={width}
          height={height}
          className="shadow-2xl rounded-lg"
          style={{
            imageRendering: zoom > 200 ? 'pixelated' : 'auto',
          }}
        />
      </div>
      
      {/* Loading indicator */}
      {!imagesLoaded && (baseImageUrl || layers.some(l => l.texture_url)) && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/50">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}
    </div>
  );
});

Canvas2D.displayName = 'Canvas2D';
