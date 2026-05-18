import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import type { ImageComponent } from './ComponentCanvas';
import { useState } from 'react';
import {
  MousePointer2,
  Paintbrush,
  Image,
  Trash2,
  RotateCcw,
  Grid3X3,
  Upload,
  Palette,
  Check,
  X
} from 'lucide-react';

// Sample texture library
const TEXTURE_LIBRARY = {
  wood: [
    { id: 'wood-1', name: 'Oak Hardwood', url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=512&h=512&fit=crop' },
    { id: 'wood-2', name: 'Walnut', url: 'https://images.unsplash.com/photo-1541123603104-512919d6a96c?w=512&h=512&fit=crop' },
    { id: 'wood-3', name: 'Pine', url: 'https://images.unsplash.com/photo-1566312922674-aa341e369809?w=512&h=512&fit=crop' },
  ],
  marble: [
    { id: 'marble-1', name: 'White Marble', url: 'https://images.unsplash.com/photo-1618220179428-22790b461013?w=512&h=512&fit=crop' },
    { id: 'marble-2', name: 'Black Marble', url: 'https://images.unsplash.com/photo-1615971677499-5467cbab01c0?w=512&h=512&fit=crop' },
  ],
  fabric: [
    { id: 'fabric-1', name: 'Linen', url: 'https://images.unsplash.com/photo-1558171813-4c088753af8f?w=512&h=512&fit=crop' },
    { id: 'fabric-2', name: 'Cotton Weave', url: 'https://images.unsplash.com/photo-1528459105426-b9548367069b?w=512&h=512&fit=crop' },
  ],
  concrete: [
    { id: 'concrete-1', name: 'Polished Concrete', url: 'https://images.unsplash.com/photo-1517420704952-d9f39e95b43e?w=512&h=512&fit=crop' },
    { id: 'concrete-2', name: 'Raw Concrete', url: 'https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?w=512&h=512&fit=crop' },
  ],
  tile: [
    { id: 'tile-1', name: 'Subway Tile', url: 'https://images.unsplash.com/photo-1620626011761-996317b8d101?w=512&h=512&fit=crop' },
    { id: 'tile-2', name: 'Hexagon', url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=512&h=512&fit=crop' },
  ],
};

// Preset colors
const PRESET_COLORS = [
  '#FFFFFF', '#F5F5F5', '#E0E0E0', '#9E9E9E', '#424242', '#212121',
  '#FFCDD2', '#F8BBD9', '#E1BEE7', '#D1C4E9', '#C5CAE9', '#BBDEFB',
  '#B3E5FC', '#B2EBF2', '#B2DFDB', '#C8E6C9', '#DCEDC8', '#F0F4C3',
  '#FFF9C4', '#FFECB3', '#FFE0B2', '#FFCCBC', '#D7CCC8', '#CFD8DC',
  '#EF5350', '#EC407A', '#AB47BC', '#7E57C2', '#5C6BC0', '#42A5F5',
  '#29B6F6', '#26C6DA', '#26A69A', '#66BB6A', '#9CCC65', '#D4E157',
  '#FFEE58', '#FFCA28', '#FFA726', '#FF7043', '#8D6E63', '#78909C',
];

const blendModes = [
  'normal',
  'multiply',
  'overlay',
  'screen',
  'soft-light',
  'hard-light',
  'color-dodge',
  'color-burn',
];

interface ComponentPanelProps {
  components: ImageComponent[];
  selectedComponentId: string | null;
  isSelectMode: boolean;
  onSelectModeChange: (enabled: boolean) => void;
  onSelectComponent: (id: string | null) => void;
  onUpdateComponent: (id: string, updates: Partial<ImageComponent>) => void;
  onTextureUpload: (file: File) => void;
}

export function ComponentPanel({
  components,
  selectedComponentId,
  isSelectMode,
  onSelectModeChange,
  onSelectComponent,
  onUpdateComponent,
  onTextureUpload,
}: ComponentPanelProps) {
  const [isTextureLibraryOpen, setIsTextureLibraryOpen] = useState(false);
  const selectedComponent = components.find(c => c.id === selectedComponentId);

  const handleApplyTexture = (textureUrl: string) => {
    if (selectedComponentId) {
      onUpdateComponent(selectedComponentId, { texture_url: textureUrl, tint_color: null });
    }
    setIsTextureLibraryOpen(false);
  };

  const handleApplyColor = (color: string) => {
    if (selectedComponentId) {
      onUpdateComponent(selectedComponentId, { tint_color: color, texture_url: null });
    }
  };

  const handleClearCustomization = () => {
    if (selectedComponentId) {
      onUpdateComponent(selectedComponentId, { 
        texture_url: null, 
        tint_color: null,
        opacity: 0.7,
        blend_mode: 'multiply',
        scale: 1,
        tile: true
      });
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onTextureUpload(file);
      setIsTextureLibraryOpen(false);
    }
  };

  return (
    <aside className="w-80 border-r border-border bg-card/30 flex flex-col overflow-hidden flex-shrink-0">
      {/* Texture Library Dialog */}
      <Dialog open={isTextureLibraryOpen} onOpenChange={setIsTextureLibraryOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Select Texture
            </DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="wood" className="mt-4">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="wood">Wood</TabsTrigger>
              <TabsTrigger value="marble">Marble</TabsTrigger>
              <TabsTrigger value="fabric">Fabric</TabsTrigger>
              <TabsTrigger value="concrete">Concrete</TabsTrigger>
              <TabsTrigger value="tile">Tile</TabsTrigger>
            </TabsList>
            
            {Object.entries(TEXTURE_LIBRARY).map(([category, textures]) => (
              <TabsContent key={category} value={category}>
                <ScrollArea className="h-[300px]">
                  <div className="grid grid-cols-3 gap-3 p-1">
                    {textures.map((texture) => (
                      <button
                        key={texture.id}
                        onClick={() => handleApplyTexture(texture.url)}
                        className="group relative aspect-square rounded-lg overflow-hidden border border-border hover:border-primary transition-all"
                      >
                        <img 
                          src={texture.url} 
                          alt={texture.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-2 left-2 right-2 text-white text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                          {texture.name}
                        </div>
                      </button>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            ))}
          </Tabs>

          <div className="flex items-center justify-between pt-4 border-t border-border">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <Button variant="outline" asChild>
                <span>
                  <Upload className="h-4 w-4" />
                  Upload Custom
                </span>
              </Button>
            </label>
          </div>
        </DialogContent>
      </Dialog>

      <ScrollArea className="flex-1">
        {/* Selection Mode Toggle */}
        <div className="p-4 border-b border-border space-y-3">
          <Button
            variant={isSelectMode ? 'hero' : 'outline'}
            className="w-full"
            onClick={() => onSelectModeChange(!isSelectMode)}
          >
            <MousePointer2 className="h-4 w-4" />
            {isSelectMode ? 'Selection Mode Active' : 'Enable Selection Mode'}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            {isSelectMode 
              ? 'Component boundaries are shown - click any region to customize it' 
              : 'Click on components in the image to select and customize them'
            }
          </p>
        </div>

        {/* Components List */}
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
            <Grid3X3 className="h-4 w-4" />
            Components ({components.length})
          </h3>
          
          <div className="space-y-2">
            {components.map((component) => (
              <button
                key={component.id}
                onClick={() => onSelectComponent(component.id)}
                className={`w-full flex items-center gap-3 p-2 rounded-lg transition-colors text-left ${
                  selectedComponentId === component.id
                    ? 'bg-primary/10 border border-primary/30'
                    : 'hover:bg-secondary/50 border border-transparent'
                }`}
              >
                <div 
                  className="w-4 h-4 rounded-full flex-shrink-0 border border-border"
                  style={{ backgroundColor: component.color }}
                />
                <span className="flex-1 text-sm truncate">{component.name}</span>
                {(component.texture_url || component.tint_color) && (
                  <Check className="h-4 w-4 text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Selected Component Controls */}
        {selectedComponent ? (
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">{selectedComponent.name}</h3>
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7"
                onClick={handleClearCustomization}
                title="Reset customization"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            
            <Tabs defaultValue="texture" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="texture" className="text-xs">
                  <Image className="h-3 w-3 mr-1" />
                  Texture
                </TabsTrigger>
                <TabsTrigger value="color" className="text-xs">
                  <Paintbrush className="h-3 w-3 mr-1" />
                  Color
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="texture" className="space-y-4">
                {/* Current Texture Preview */}
                {selectedComponent.texture_url && (
                  <div className="aspect-video rounded-lg overflow-hidden bg-secondary/30 relative">
                    <img 
                      src={selectedComponent.texture_url} 
                      alt="Current texture" 
                      className="w-full h-full object-cover"
                    />
                    <Button
                      variant="destructive"
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6"
                      onClick={() => onUpdateComponent(selectedComponent.id, { texture_url: null })}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setIsTextureLibraryOpen(true)}
                >
                  <Palette className="h-4 w-4" />
                  {selectedComponent.texture_url ? 'Change Texture' : 'Select Texture'}
                </Button>
              </TabsContent>
              
              <TabsContent value="color" className="space-y-4">
                {/* Color Picker */}
                <div>
                  <Label className="text-xs mb-2 block">Custom Color</Label>
                  <div className="flex gap-2">
                    <Input
                      type="color"
                      value={selectedComponent.tint_color || '#ffffff'}
                      onChange={(e) => handleApplyColor(e.target.value)}
                      className="w-12 h-9 p-1 cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={selectedComponent.tint_color || ''}
                      onChange={(e) => handleApplyColor(e.target.value)}
                      placeholder="#FFFFFF"
                      className="flex-1"
                    />
                    {selectedComponent.tint_color && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9"
                        onClick={() => onUpdateComponent(selectedComponent.id, { tint_color: null })}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
                
                {/* Preset Colors */}
                <div>
                  <Label className="text-xs mb-2 block">Preset Colors</Label>
                  <div className="grid grid-cols-6 gap-1">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={color}
                        onClick={() => handleApplyColor(color)}
                        className={`w-8 h-8 rounded border-2 transition-all hover:scale-110 ${
                          selectedComponent.tint_color === color 
                            ? 'border-primary ring-2 ring-primary/30' 
                            : 'border-border'
                        }`}
                        style={{ backgroundColor: color }}
                        title={color}
                      />
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Advanced Settings */}
            {(selectedComponent.texture_url || selectedComponent.tint_color) && (
              <div className="mt-6 pt-4 border-t border-border space-y-4">
                <h4 className="font-medium text-xs text-muted-foreground uppercase">Advanced</h4>
                
                {/* Opacity */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs">Opacity</Label>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(selectedComponent.opacity * 100)}%
                    </span>
                  </div>
                  <Slider
                    value={[selectedComponent.opacity * 100]}
                    onValueChange={([v]) => onUpdateComponent(selectedComponent.id, { opacity: v / 100 })}
                    max={100}
                    step={1}
                  />
                </div>

                {/* Blend Mode */}
                <div className="space-y-2">
                  <Label className="text-xs">Blend Mode</Label>
                  <Select
                    value={selectedComponent.blend_mode}
                    onValueChange={(v) => onUpdateComponent(selectedComponent.id, { blend_mode: v })}
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

                {/* Scale (for textures) */}
                {selectedComponent.texture_url && (
                  <>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label className="text-xs">Scale</Label>
                        <span className="text-xs text-muted-foreground">
                          {Math.round(selectedComponent.scale * 100)}%
                        </span>
                      </div>
                      <Slider
                        value={[selectedComponent.scale * 100]}
                        onValueChange={([v]) => onUpdateComponent(selectedComponent.id, { scale: v / 100 })}
                        min={10}
                        max={200}
                        step={1}
                      />
                    </div>

                    {/* Tile Toggle */}
                    <div className="flex items-center justify-between">
                      <Label className="text-xs">Tile (Repeat)</Label>
                      <Switch
                        checked={selectedComponent.tile}
                        onCheckedChange={(v) => onUpdateComponent(selectedComponent.id, { tile: v })}
                      />
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        ) : (
          <div className="p-4">
            <div className="text-center py-8 text-muted-foreground">
              <MousePointer2 className="h-8 w-8 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Enable selection mode and click on a component to customize it</p>
            </div>
          </div>
        )}
      </ScrollArea>
    </aside>
  );
}