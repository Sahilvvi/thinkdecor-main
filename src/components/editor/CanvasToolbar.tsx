import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ZoomIn, ZoomOut, Maximize, Move, RotateCcw } from 'lucide-react';

interface CanvasToolbarProps {
  zoom: number;
  showBefore: boolean;
  isPanMode: boolean;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitToScreen: () => void;
  onResetView: () => void;
  onTogglePanMode: () => void;
  onShowBeforeChange: (show: boolean) => void;
}

export function CanvasToolbar({
  zoom,
  showBefore,
  isPanMode,
  onZoomIn,
  onZoomOut,
  onFitToScreen,
  onResetView,
  onTogglePanMode,
  onShowBeforeChange,
}: CanvasToolbarProps) {
  return (
    <div className="h-12 border-b border-border flex items-center justify-between px-4 bg-card/20 flex-shrink-0">
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8" 
          onClick={onZoomOut}
          title="Zoom Out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <span className="text-sm text-muted-foreground w-12 text-center">{zoom}%</span>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8" 
          onClick={onZoomIn}
          title="Zoom In"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <div className="h-4 w-px bg-border mx-2" />
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8" 
          onClick={onFitToScreen}
          title="Fit to Screen"
        >
          <Maximize className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8" 
          onClick={onResetView}
          title="Reset View"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button 
          variant={isPanMode ? "secondary" : "ghost"} 
          size="icon" 
          className="h-8 w-8"
          onClick={onTogglePanMode}
          title="Pan Mode (Hold Alt to pan)"
        >
          <Move className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <Label className="text-xs text-muted-foreground">Before/After</Label>
        <Switch checked={showBefore} onCheckedChange={onShowBeforeChange} />
      </div>
    </div>
  );
}
