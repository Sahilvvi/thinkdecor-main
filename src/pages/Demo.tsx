import { useState, useRef, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Logo } from '@/components/brand/Logo';
import { Canvas2D, type Canvas2DHandle } from '@/components/editor/Canvas2D';
import { CanvasToolbar } from '@/components/editor/CanvasToolbar';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Download,
  Image,
  Upload,
  Plus,
  Eye,
  EyeOff,
  Trash2,
  GripVertical,
  Layers,
  FlipHorizontal,
  FlipVertical,
  RotateCcw,
  Palette,
  Sparkles,
  Grid3X3,
  Replace
} from 'lucide-react';

// Sample demo images
const DEMO_SAMPLES = [
  {
    id: '1',
    name: 'Living Room',
    thumbnail: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400&h=300&fit=crop',
    baseImage: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1920&h=1080&fit=crop',
  },
  {
    id: '2',
    name: 'Modern Kitchen',
    thumbnail: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=300&fit=crop',
    baseImage: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=1920&h=1080&fit=crop',
  },
  {
    id: '3',
    name: 'Bedroom Suite',
    thumbnail: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=400&h=300&fit=crop',
    baseImage: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1920&h=1080&fit=crop',
  },
];

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

interface DemoLayer {
  id: string;
  name: string;
  texture_url: string | null;
  visible: boolean;
  opacity: number;
  blend_mode: string;
  scale: number;
  rotation: number;
  offset_x: number;
  offset_y: number;
  tile: boolean;
  flip_x: boolean;
  flip_y: boolean;
  order_index: number;
  // Required by Canvas2D Layer type
  created_at: string;
  updated_at: string;
  project_id: string;
  user_id: string;
}

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
  'darken',
  'lighten',
];

export default function Demo() {
  const canvasRef = useRef<Canvas2DHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textureInputRef = useRef<HTMLInputElement>(null);
  
  // Demo state
  const [selectedSample, setSelectedSample] = useState<string | null>(null);
  const [baseImageUrl, setBaseImageUrl] = useState<string | null>(null);
  const [layers, setLayers] = useState<DemoLayer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  
  // Canvas controls
  const [zoom, setZoom] = useState(100);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [showBefore, setShowBefore] = useState(false);
  const [isPanMode, setIsPanMode] = useState(false);
  
  // Texture library dialog
  const [isTextureLibraryOpen, setIsTextureLibraryOpen] = useState(false);
  const [textureLibraryMode, setTextureLibraryMode] = useState<'add' | 'replace'>('add');
  const [replaceLayerId, setReplaceLayerId] = useState<string | null>(null);

  const selectedLayer = layers.find(l => l.id === selectedLayerId);

  // Select sample image
  const handleSelectSample = (sample: typeof DEMO_SAMPLES[0]) => {
    setSelectedSample(sample.id);
    setBaseImageUrl(sample.baseImage);
    setLayers([]);
    setSelectedLayerId(null);
    toast.success(`Loaded "${sample.name}" sample`);
  };

  // Handle base image upload
  const handleBaseImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const url = URL.createObjectURL(file);
    setBaseImageUrl(url);
    setSelectedSample(null);
    toast.success('Base image uploaded');
  };

  // Add new layer from file
  const handleTextureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const url = URL.createObjectURL(file);
    addLayer(file.name.replace(/\.[^/.]+$/, ''), url);
  };

  // Add layer function
  const addLayer = (name: string, textureUrl: string) => {
    const now = new Date().toISOString();
    const newLayer: DemoLayer = {
      id: `layer-${Date.now()}`,
      name,
      texture_url: textureUrl,
      visible: true,
      opacity: 1,
      blend_mode: 'multiply',
      scale: 1,
      rotation: 0,
      offset_x: 0,
      offset_y: 0,
      tile: true,
      flip_x: false,
      flip_y: false,
      order_index: layers.length,
      created_at: now,
      updated_at: now,
      project_id: 'demo',
      user_id: 'demo',
    };
    
    setLayers(prev => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
    toast.success(`Added "${name}" layer`);
  };

  // Add from texture library
  const handleSelectFromLibrary = (texture: { id: string; name: string; url: string }) => {
    if (textureLibraryMode === 'replace' && replaceLayerId) {
      setLayers(prev => prev.map(l => 
        l.id === replaceLayerId 
          ? { ...l, texture_url: texture.url, name: texture.name }
          : l
      ));
      toast.success(`Replaced texture with "${texture.name}"`);
    } else {
      addLayer(texture.name, texture.url);
    }
    setIsTextureLibraryOpen(false);
  };

  // Open texture library for adding
  const openTextureLibraryForAdd = () => {
    setTextureLibraryMode('add');
    setReplaceLayerId(null);
    setIsTextureLibraryOpen(true);
  };

  // Open texture library for replacing
  const openTextureLibraryForReplace = (layerId: string) => {
    setTextureLibraryMode('replace');
    setReplaceLayerId(layerId);
    setIsTextureLibraryOpen(true);
  };

  // Delete layer
  const handleDeleteLayer = (layerId: string) => {
    setLayers(prev => prev.filter(l => l.id !== layerId));
    if (selectedLayerId === layerId) {
      setSelectedLayerId(null);
    }
    toast.success('Layer deleted');
  };

  // Toggle layer visibility
  const toggleLayerVisibility = (layerId: string) => {
    setLayers(prev => prev.map(l => 
      l.id === layerId ? { ...l, visible: !l.visible } : l
    ));
  };

  // Update layer property
  const handleLayerUpdate = (property: string, value: unknown) => {
    if (!selectedLayerId) return;
    setLayers(prev => prev.map(l => 
      l.id === selectedLayerId ? { ...l, [property]: value } : l
    ));
  };

  // Export handler
  const handleExport = async () => {
    if (!canvasRef.current) return;
    
    try {
      const blob = await canvasRef.current.exportCanvas(1, 'png');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'viz2d-export.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Image exported!');
    } catch (error) {
      toast.error('Failed to export');
    }
  };

  // Zoom controls
  const handleZoomIn = () => setZoom(z => Math.min(400, z + 10));
  const handleZoomOut = () => setZoom(z => Math.max(10, z - 10));
  const handleFitToScreen = () => {
    setZoom(100);
    setPanOffset({ x: 0, y: 0 });
  };
  const handleResetView = () => {
    setZoom(100);
    setPanOffset({ x: 0, y: 0 });
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '=' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === '-' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === '0' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        handleResetView();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Wheel zoom
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -10 : 10;
        setZoom(z => Math.max(10, Math.min(400, z + delta)));
      }
    };
    
    window.addEventListener('wheel', handleWheel, { passive: false });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  // Show sample selection if no base image
  if (!baseImageUrl) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        {/* Header */}
        <header className="h-14 border-b border-border bg-card/50 flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </Link>
            <div className="h-6 w-px bg-border" />
            <Logo />
          </div>
          <div className="flex items-center gap-2">
            <Link to="/signup">
              <Button variant="hero" size="sm">
                <Sparkles className="h-4 w-4" />
                Start Free
              </Button>
            </Link>
          </div>
        </header>

        {/* Sample Selection */}
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="max-w-3xl w-full">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">Try Viz2D Demo</h1>
              <p className="text-muted-foreground">
                Select a sample image or upload your own to start visualizing textures
              </p>
            </div>

            {/* Upload Option */}
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleBaseImageUpload}
            />
            <Button 
              variant="outline" 
              className="w-full mb-6 h-24 border-dashed border-2"
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-6 w-6" />
                <span>Upload Your Own Image</span>
              </div>
            </Button>

            <div className="text-center text-muted-foreground mb-4">OR</div>

            {/* Sample Images */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {DEMO_SAMPLES.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className="group relative aspect-video rounded-xl overflow-hidden border border-border hover:border-primary transition-all hover:shadow-xl hover:shadow-primary/10"
                >
                  <img 
                    src={sample.thumbnail} 
                    alt={sample.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute bottom-3 left-3 text-white font-medium">
                    {sample.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleBaseImageUpload}
      />
      <input
        type="file"
        ref={textureInputRef}
        className="hidden"
        accept="image/*"
        onChange={handleTextureUpload}
      />

      {/* Texture Library Dialog */}
      <Dialog open={isTextureLibraryOpen} onOpenChange={setIsTextureLibraryOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              {textureLibraryMode === 'replace' ? 'Replace Texture' : 'Texture Library'}
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
                        onClick={() => handleSelectFromLibrary(texture)}
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
            <Button variant="outline" onClick={() => textureInputRef.current?.click()}>
              <Upload className="h-4 w-4" />
              Upload Custom
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Header */}
      <header className="h-14 border-b border-border bg-card/50 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="h-6 w-px bg-border" />
          <Logo />
          <span className="text-xs text-muted-foreground bg-secondary px-2 py-1 rounded">DEMO</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => { setBaseImageUrl(null); setLayers([]); }}>
            Change Image
          </Button>
          <Button variant="hero" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Link to="/signup">
            <Button variant="glow" size="sm">
              <Sparkles className="h-4 w-4" />
              Sign Up Free
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Layers */}
        <aside className="w-72 border-r border-border bg-card/30 flex flex-col overflow-hidden flex-shrink-0">
          <ScrollArea className="flex-1">
            {/* Base Image Section */}
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                <Image className="h-4 w-4" />
                Base Image
              </h3>
              <div className="space-y-2">
                <div className="aspect-video rounded-lg overflow-hidden bg-secondary/30">
                  <img 
                    src={baseImageUrl} 
                    alt="Base" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <Button 
                  variant="outline" 
                  className="w-full" 
                  size="sm"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  Replace Image
                </Button>
              </div>
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
                  onClick={openTextureLibraryForAdd}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Layer List */}
              {layers.length > 0 ? (
                <div className="space-y-2">
                  {layers.map((layer) => (
                    <div
                      key={layer.id}
                      onClick={() => setSelectedLayerId(layer.id)}
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
                          openTextureLibraryForReplace(layer.id);
                        }}
                        title="Replace texture"
                      >
                        <Replace className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLayerVisibility(layer.id);
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
                          handleDeleteLayer(layer.id);
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

              <div className="flex gap-2 mt-3">
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  size="sm"
                  onClick={openTextureLibraryForAdd}
                >
                  <Grid3X3 className="h-4 w-4" />
                  Library
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1" 
                  size="sm"
                  onClick={() => textureInputRef.current?.click()}
                >
                  <Upload className="h-4 w-4" />
                  Upload
                </Button>
              </div>
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
                      onValueChange={([v]) => handleLayerUpdate('opacity', v / 100)}
                      max={100}
                      step={1}
                    />
                  </div>

                  {/* Blend Mode */}
                  <div className="space-y-2">
                    <Label className="text-xs">Blend Mode</Label>
                    <Select
                      value={selectedLayer.blend_mode}
                      onValueChange={(v) => handleLayerUpdate('blend_mode', v)}
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
                      onValueChange={([v]) => handleLayerUpdate('scale', v / 100)}
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
                      onValueChange={([v]) => handleLayerUpdate('rotation', v)}
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
                      onValueChange={([v]) => handleLayerUpdate('offset_x', v)}
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
                      onValueChange={([v]) => handleLayerUpdate('offset_y', v)}
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
                        Tile (Repeat)
                      </Label>
                      <Switch
                        checked={selectedLayer.tile}
                        onCheckedChange={(v) => handleLayerUpdate('tile', v)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs flex items-center gap-2">
                        <FlipHorizontal className="h-3 w-3" />
                        Flip X
                      </Label>
                      <Switch
                        checked={selectedLayer.flip_x}
                        onCheckedChange={(v) => handleLayerUpdate('flip_x', v)}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-xs flex items-center gap-2">
                        <FlipVertical className="h-3 w-3" />
                        Flip Y
                      </Label>
                      <Switch
                        checked={selectedLayer.flip_y}
                        onCheckedChange={(v) => handleLayerUpdate('flip_y', v)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </ScrollArea>
        </aside>

        {/* Center - Canvas */}
        <main className="flex-1 flex flex-col overflow-hidden bg-background">
          {/* Canvas Toolbar */}
          <CanvasToolbar
            zoom={zoom}
            showBefore={showBefore}
            isPanMode={isPanMode}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onFitToScreen={handleFitToScreen}
            onResetView={handleResetView}
            onTogglePanMode={() => setIsPanMode(!isPanMode)}
            onShowBeforeChange={setShowBefore}
          />

          {/* Canvas Container */}
          <div className="flex-1 overflow-hidden">
            <Canvas2D
              ref={canvasRef}
              baseImageUrl={baseImageUrl}
              layers={layers}
              width={1920}
              height={1080}
              zoom={zoom}
              showBefore={showBefore}
              panOffset={panOffset}
              onPanChange={setPanOffset}
            />
          </div>
        </main>

        {/* Right Panel - Quick Tips */}
        <aside className="w-64 border-l border-border bg-card/30 flex flex-col overflow-hidden flex-shrink-0">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-sm mb-4">Quick Tips</h3>
            <div className="space-y-3 text-xs text-muted-foreground">
              <p>• Click "Library" to choose from preset textures</p>
              <p>• Use "Replace" button to swap textures on a layer</p>
              <p>• Enable "Tile" for repeating patterns</p>
              <p>• Use "Multiply" blend mode for realistic results</p>
              <p>• Ctrl+Scroll to zoom in/out</p>
              <p>• Alt+Drag to pan around</p>
            </div>
          </div>
          
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-sm mb-3">Export Options</h3>
            <Button variant="hero" className="w-full" onClick={handleExport}>
              <Download className="h-4 w-4" />
              Export PNG
            </Button>
          </div>

          <div className="p-4 flex-1">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Want More?
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                Sign up for free to save projects, access more textures, and export in higher resolutions.
              </p>
              <Link to="/signup">
                <Button variant="hero" size="sm" className="w-full">
                  Get Started Free
                </Button>
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}