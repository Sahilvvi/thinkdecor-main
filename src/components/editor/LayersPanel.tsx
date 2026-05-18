import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { Layer } from '@/hooks/useLayers';
import {
  Image,
  Upload,
  Plus,
  Eye,
  EyeOff,
  Trash2,
  GripVertical,
  Layers,
  RotateCcw,
  FlipHorizontal,
  FlipVertical,
  Loader2,
  Replace,
  Palette
} from 'lucide-react';

const blendModes = [
  'normal',
  'multiply',
  'overlay',
  'screen',
  'soft-light',
  'hard-light',
  'difference',
  'exclusion',
  'color-dodge',
  'color-burn',
];

interface LayersPanelProps {
  project: {
    base_image_url: string | null;
  };
  layers: Layer[];
  selectedLayerId: string | null;
  isUploading: boolean;
  layersLoading: boolean;
  onSelectLayer: (id: string) => void;
  onToggleVisibility: (layer: Layer) => void;
  onDeleteLayer: (id: string) => void;
  onLayerUpdate: (property: string, value: unknown) => void;
  onBaseImageUpload: () => void;
  onTextureUpload: () => void;
}

export function LayersPanel({
  project,
  layers,
  selectedLayerId,
  isUploading,
  layersLoading,
  onSelectLayer,
  onToggleVisibility,
  onDeleteLayer,
  onLayerUpdate,
  onBaseImageUpload,
  onTextureUpload,
}: LayersPanelProps) {
  const selectedLayer = layers.find(l => l.id === selectedLayerId);

  return (
    <aside className="w-72 border-r border-border bg-card/30 flex flex-col overflow-hidden flex-shrink-0">
      <ScrollArea className="flex-1">
        {/* Base Image Section */}
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Image className="h-4 w-4" />
            Base Image
          </h3>
          {project.base_image_url ? (
            <div className="space-y-2">
              <div className="aspect-video rounded-lg overflow-hidden bg-secondary/30">
                <img 
                  src={project.base_image_url} 
                  alt="Base" 
                  className="w-full h-full object-cover"
                />
              </div>
              <Button 
                variant="outline" 
                className="w-full" 
                size="sm"
                onClick={onBaseImageUpload}
                disabled={isUploading}
              >
                {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                Replace Image
              </Button>
            </div>
          ) : (
            <Button 
              variant="outline" 
              className="w-full" 
              size="sm"
              onClick={onBaseImageUpload}
              disabled={isUploading}
            >
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Upload Base Image
            </Button>
          )}
        </div>

        {/* Layers Section */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm flex items-center gap-2">
              <Layers className="h-4 w-4" />
              Layers ({layers.length})
            </h3>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-7 w-7"
              onClick={onTextureUpload}
              disabled={isUploading}
            >
              {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            </Button>
          </div>

          {/* Layer List */}
          {layersLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : layers.length > 0 ? (
            <div className="space-y-2">
              {layers.map((layer) => (
                <div
                  key={layer.id}
                  onClick={() => onSelectLayer(layer.id)}
                  className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                    selectedLayerId === layer.id
                      ? 'bg-primary/10 border border-primary/30'
                      : 'hover:bg-secondary/50 border border-transparent'
                  }`}
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-grab" />
                  <div className="w-8 h-8 rounded bg-secondary/50 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {layer.texture_url ? (
                      <img src={layer.texture_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Layers className="h-4 w-4 text-muted-foreground" />
                    )}
                  </div>
                  <span className="flex-1 text-sm truncate">{layer.name}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      onToggleVisibility(layer);
                    }}
                  >
                    {layer.visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-muted-foreground" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteLayer(layer.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No layers yet. Add a texture layer to start.
            </p>
          )}

          <Button 
            variant="outline" 
            className="w-full mt-3" 
            size="sm"
            onClick={onTextureUpload}
            disabled={isUploading}
          >
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add Texture Layer
          </Button>
        </div>

        {/* Selected Layer Controls */}
        {selectedLayer && (
          <div className="p-4">
            <h3 className="font-semibold text-sm mb-4">Layer Settings</h3>
            
            <div className="space-y-5">
              {/* Opacity */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Opacity</Label>
                  <span className="text-xs text-muted-foreground">{Math.round(selectedLayer.opacity * 100)}%</span>
                </div>
                <Slider
                  value={[selectedLayer.opacity * 100]}
                  onValueChange={([v]) => onLayerUpdate('opacity', v / 100)}
                  max={100}
                  step={1}
                />
              </div>

              {/* Blend Mode */}
              <div className="space-y-2">
                <Label className="text-xs">Blend Mode</Label>
                <Select
                  value={selectedLayer.blend_mode}
                  onValueChange={(v) => onLayerUpdate('blend_mode', v)}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {blendModes.map(mode => (
                      <SelectItem key={mode} value={mode}>
                        {mode.charAt(0).toUpperCase() + mode.slice(1).replace('-', ' ')}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Scale */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Scale</Label>
                  <span className="text-xs text-muted-foreground">{Math.round(selectedLayer.scale * 100)}%</span>
                </div>
                <Slider
                  value={[selectedLayer.scale * 100]}
                  onValueChange={([v]) => onLayerUpdate('scale', v / 100)}
                  min={10}
                  max={200}
                  step={1}
                />
              </div>

              {/* Rotation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Rotation</Label>
                  <span className="text-xs text-muted-foreground">{Math.round(selectedLayer.rotation)}°</span>
                </div>
                <Slider
                  value={[selectedLayer.rotation]}
                  onValueChange={([v]) => onLayerUpdate('rotation', v)}
                  min={-180}
                  max={180}
                  step={1}
                />
              </div>

              {/* Offset X */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Offset X</Label>
                  <span className="text-xs text-muted-foreground">{Math.round(selectedLayer.offset_x)}px</span>
                </div>
                <Slider
                  value={[selectedLayer.offset_x]}
                  onValueChange={([v]) => onLayerUpdate('offset_x', v)}
                  min={-500}
                  max={500}
                  step={1}
                />
              </div>

              {/* Offset Y */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs">Offset Y</Label>
                  <span className="text-xs text-muted-foreground">{Math.round(selectedLayer.offset_y)}px</span>
                </div>
                <Slider
                  value={[selectedLayer.offset_y]}
                  onValueChange={([v]) => onLayerUpdate('offset_y', v)}
                  min={-500}
                  max={500}
                  step={1}
                />
              </div>

              {/* Toggles */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <Label className="text-xs flex items-center gap-2">
                    <RotateCcw className="h-3 w-3" />
                    Tile
                  </Label>
                  <Switch
                    checked={selectedLayer.tile}
                    onCheckedChange={(v) => onLayerUpdate('tile', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs flex items-center gap-2">
                    <FlipHorizontal className="h-3 w-3" />
                    Flip X
                  </Label>
                  <Switch
                    checked={selectedLayer.flip_x}
                    onCheckedChange={(v) => onLayerUpdate('flip_x', v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="text-xs flex items-center gap-2">
                    <FlipVertical className="h-3 w-3" />
                    Flip Y
                  </Label>
                  <Switch
                    checked={selectedLayer.flip_y}
                    onCheckedChange={(v) => onLayerUpdate('flip_y', v)}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </ScrollArea>
    </aside>
  );
}
