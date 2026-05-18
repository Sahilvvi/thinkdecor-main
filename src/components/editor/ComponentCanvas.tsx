import { useEffect, useRef, useCallback, useState, forwardRef, useImperativeHandle } from 'react';

export interface ImageComponent {
  id: string;
  name: string;
  color: string; // For visual identification
  // Polygon points as percentage of image dimensions (0-100)
  polygon: { x: number; y: number }[];
  // Customization applied to this component
  texture_url: string | null;
  tint_color: string | null;
  opacity: number;
  blend_mode: string;
  scale: number;
  tile: boolean;
}

export interface ComponentCanvasProps {
  baseImageUrl: string | null;
  components: ImageComponent[];
  selectedComponentId: string | null;
  width: number;
  height: number;
  zoom: number;
  showBefore: boolean;
  panOffset: { x: number; y: number };
  onPanChange: (offset: { x: number; y: number }) => void;
  onComponentClick: (componentId: string | null) => void;
  isSelectMode: boolean;
}

export interface ComponentCanvasHandle {
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

// Check if point is inside polygon using ray casting
function isPointInPolygon(x: number, y: number, polygon: { x: number; y: number }[]): boolean {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    
    if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
      inside = !inside;
    }
  }
  return inside;
}

export const ComponentCanvas = forwardRef<ComponentCanvasHandle, ComponentCanvasProps>(({
  baseImageUrl,
  components,
  selectedComponentId,
  width,
  height,
  zoom,
  showBefore,
  panOffset,
  onPanChange,
  onComponentClick,
  isSelectMode,
}, ref) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [hoveredComponentId, setHoveredComponentId] = useState<string | null>(null);
  const [imageDrawInfo, setImageDrawInfo] = useState<{
    drawX: number;
    drawY: number;
    drawWidth: number;
    drawHeight: number;
  } | null>(null);

  // Render function for main canvas
  const render = useCallback(async (
    ctx: CanvasRenderingContext2D,
    canvasWidth: number,
    canvasHeight: number,
    renderComponents: boolean = true
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
    if (!baseImageUrl) return;
    
    let baseImg: HTMLImageElement;
    try {
      baseImg = await loadImage(baseImageUrl);
    } catch (error) {
      console.error('Failed to load base image:', error);
      return;
    }
    
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
    
    // Store draw info for click detection
    setImageDrawInfo({ drawX, drawY, drawWidth, drawHeight });
    
    // Draw base image
    ctx.drawImage(baseImg, drawX, drawY, drawWidth, drawHeight);

    // Draw component customizations
    if (renderComponents) {
      for (const component of components) {
        if (!component.texture_url && !component.tint_color) continue;
        
        ctx.save();
        
        // Create clipping path from polygon
        ctx.beginPath();
        const firstPoint = component.polygon[0];
        const startX = drawX + (firstPoint.x / 100) * drawWidth;
        const startY = drawY + (firstPoint.y / 100) * drawHeight;
        ctx.moveTo(startX, startY);
        
        for (let i = 1; i < component.polygon.length; i++) {
          const point = component.polygon[i];
          const px = drawX + (point.x / 100) * drawWidth;
          const py = drawY + (point.y / 100) * drawHeight;
          ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.clip();
        
        // Set blend mode and opacity
        ctx.globalCompositeOperation = blendModeMap[component.blend_mode] || 'source-over';
        ctx.globalAlpha = component.opacity;
        
        if (component.texture_url) {
          try {
            const textureImg = await loadImage(component.texture_url);
            
            if (component.tile) {
              // Create tiling pattern
              const pattern = ctx.createPattern(textureImg, 'repeat');
              if (pattern) {
                // Apply scale transform to pattern
                const matrix = new DOMMatrix();
                matrix.scaleSelf(component.scale, component.scale);
                pattern.setTransform(matrix);
                ctx.fillStyle = pattern;
                ctx.fillRect(drawX, drawY, drawWidth, drawHeight);
              }
            } else {
              // Draw single texture scaled to component bounds
              const bounds = getPolygonBounds(component.polygon, drawX, drawY, drawWidth, drawHeight);
              ctx.drawImage(
                textureImg,
                bounds.x,
                bounds.y,
                bounds.width * component.scale,
                bounds.height * component.scale
              );
            }
          } catch (error) {
            console.error('Failed to load texture:', error);
          }
        }
        
        if (component.tint_color) {
          ctx.globalCompositeOperation = 'multiply';
          ctx.fillStyle = component.tint_color;
          ctx.fillRect(drawX, drawY, drawWidth, drawHeight);
        }
        
        ctx.restore();
      }
    }
  }, [baseImageUrl, components]);

  // Get polygon bounds
  function getPolygonBounds(
    polygon: { x: number; y: number }[],
    drawX: number,
    drawY: number,
    drawWidth: number,
    drawHeight: number
  ) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    
    for (const point of polygon) {
      const px = drawX + (point.x / 100) * drawWidth;
      const py = drawY + (point.y / 100) * drawHeight;
      minX = Math.min(minX, px);
      minY = Math.min(minY, py);
      maxX = Math.max(maxX, px);
      maxY = Math.max(maxY, py);
    }
    
    return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
  }

  // Render overlay (selection highlights and component outlines)
  const renderOverlay = useCallback(() => {
    const canvas = overlayCanvasRef.current;
    if (!canvas || !imageDrawInfo) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const { drawX, drawY, drawWidth, drawHeight } = imageDrawInfo;
    
    ctx.clearRect(0, 0, width, height);
    
    // In select mode, always show all component outlines with labels
    if (isSelectMode) {
      // Draw all component boundaries with subtle outlines
      for (const component of components) {
        const isSelected = component.id === selectedComponentId;
        const isHovered = component.id === hoveredComponentId;
        
        ctx.save();
        ctx.beginPath();
        
        const firstPoint = component.polygon[0];
        const startX = drawX + (firstPoint.x / 100) * drawWidth;
        const startY = drawY + (firstPoint.y / 100) * drawHeight;
        ctx.moveTo(startX, startY);
        
        for (let i = 1; i < component.polygon.length; i++) {
          const point = component.polygon[i];
          const px = drawX + (point.x / 100) * drawWidth;
          const py = drawY + (point.y / 100) * drawHeight;
          ctx.lineTo(px, py);
        }
        ctx.closePath();
        
        if (isSelected) {
          // Selected component - bright cyan outline and fill
          ctx.strokeStyle = 'hsl(187, 100%, 50%)';
          ctx.lineWidth = 3;
          ctx.setLineDash([]);
          ctx.fillStyle = 'hsla(187, 100%, 50%, 0.15)';
          ctx.fill();
        } else if (isHovered) {
          // Hovered component - dashed outline
          ctx.strokeStyle = 'hsla(187, 100%, 50%, 0.8)';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.fillStyle = 'hsla(187, 100%, 50%, 0.08)';
          ctx.fill();
        } else {
          // Show subtle boundaries for all components in select mode
          ctx.strokeStyle = 'hsla(0, 0%, 100%, 0.25)';
          ctx.lineWidth = 1;
          ctx.setLineDash([3, 3]);
        }
        
        ctx.stroke();
        
        // Draw component label at center
        const bounds = getPolygonBounds(component.polygon, drawX, drawY, drawWidth, drawHeight);
        const centerX = bounds.x + bounds.width / 2;
        const centerY = bounds.y + bounds.height / 2;
        
        // Only show labels for selected/hovered or when area is large enough
        const showLabel = isSelected || isHovered || (bounds.width > 60 && bounds.height > 30);
        
        if (showLabel) {
          ctx.font = isSelected || isHovered ? 'bold 11px system-ui' : '10px system-ui';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          
          // Background for label
          const textWidth = ctx.measureText(component.name).width;
          const padding = 4;
          ctx.fillStyle = isSelected ? 'hsla(187, 100%, 50%, 0.9)' : isHovered ? 'hsla(187, 100%, 40%, 0.8)' : 'hsla(0, 0%, 0%, 0.6)';
          ctx.fillRect(
            centerX - textWidth / 2 - padding,
            centerY - 7,
            textWidth + padding * 2,
            14
          );
          
          // Label text
          ctx.fillStyle = isSelected || isHovered ? 'hsl(222, 20%, 10%)' : 'white';
          ctx.fillText(component.name, centerX, centerY);
        }
        
        ctx.restore();
      }
    } else {
      // Not in select mode - only show selected component
      if (selectedComponentId) {
        const component = components.find(c => c.id === selectedComponentId);
        if (component) {
          ctx.save();
          ctx.beginPath();
          
          const firstPoint = component.polygon[0];
          const startX = drawX + (firstPoint.x / 100) * drawWidth;
          const startY = drawY + (firstPoint.y / 100) * drawHeight;
          ctx.moveTo(startX, startY);
          
          for (let i = 1; i < component.polygon.length; i++) {
            const point = component.polygon[i];
            const px = drawX + (point.x / 100) * drawWidth;
            const py = drawY + (point.y / 100) * drawHeight;
            ctx.lineTo(px, py);
          }
          ctx.closePath();
          
          ctx.strokeStyle = 'hsl(187, 100%, 50%)';
          ctx.lineWidth = 3;
          ctx.setLineDash([]);
          ctx.fillStyle = 'hsla(187, 100%, 50%, 0.1)';
          ctx.fill();
          ctx.stroke();
          
          ctx.restore();
        }
      }
    }
  }, [components, selectedComponentId, hoveredComponentId, imageDrawInfo, width, height, isSelectMode]);

  // Main render effect
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    render(ctx, width, height, !showBefore);
  }, [render, width, height, showBefore]);

  // Overlay render effect
  useEffect(() => {
    renderOverlay();
  }, [renderOverlay]);

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
    
    ctx.scale(resolution, resolution);
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

  // Get component at position
  const getComponentAtPosition = useCallback((clientX: number, clientY: number): string | null => {
    if (!containerRef.current || !imageDrawInfo) return null;
    
    const rect = containerRef.current.getBoundingClientRect();
    const containerCenterX = rect.width / 2;
    const containerCenterY = rect.height / 2;
    
    // Account for zoom and pan
    const scale = zoom / 100;
    const canvasCenterX = width / 2;
    const canvasCenterY = height / 2;
    
    // Calculate click position relative to canvas
    const relX = clientX - rect.left;
    const relY = clientY - rect.top;
    
    // Transform to canvas coordinates
    const canvasX = (relX - containerCenterX - panOffset.x) / scale + canvasCenterX;
    const canvasY = (relY - containerCenterY - panOffset.y) / scale + canvasCenterY;
    
    const { drawX, drawY, drawWidth, drawHeight } = imageDrawInfo;
    
    // Convert to percentage of image
    const imgX = ((canvasX - drawX) / drawWidth) * 100;
    const imgY = ((canvasY - drawY) / drawHeight) * 100;
    
    // Check each component (in reverse order for top-most first)
    for (let i = components.length - 1; i >= 0; i--) {
      const component = components[i];
      if (isPointInPolygon(imgX, imgY, component.polygon)) {
        return component.id;
      }
    }
    
    return null;
  }, [components, imageDrawInfo, zoom, panOffset, width, height]);

  // Mouse handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      e.preventDefault();
    } else if (e.button === 0 && isSelectMode) {
      const componentId = getComponentAtPosition(e.clientX, e.clientY);
      onComponentClick(componentId);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      onPanChange({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    } else if (isSelectMode) {
      const componentId = getComponentAtPosition(e.clientX, e.clientY);
      setHoveredComponentId(componentId);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleMouseLeave = () => {
    setIsDragging(false);
    setHoveredComponentId(null);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full overflow-hidden flex items-center justify-center bg-background"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      style={{ 
        cursor: isDragging 
          ? 'grabbing' 
          : isSelectMode 
            ? (hoveredComponentId ? 'pointer' : 'crosshair')
            : 'default' 
      }}
    >
      <div
        style={{
          transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom / 100})`,
          transformOrigin: 'center center',
          transition: isDragging ? 'none' : 'transform 0.1s ease-out',
          position: 'relative',
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
        <canvas
          ref={overlayCanvasRef}
          width={width}
          height={height}
          className="absolute top-0 left-0 pointer-events-none"
          style={{
            imageRendering: zoom > 200 ? 'pixelated' : 'auto',
          }}
        />
      </div>
      
      {/* Selection mode indicator */}
      {isSelectMode && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-primary/90 text-primary-foreground px-4 py-2 rounded-full text-sm font-medium shadow-lg">
          Click on a component to select it
        </div>
      )}
    </div>
  );
});

ComponentCanvas.displayName = 'ComponentCanvas';