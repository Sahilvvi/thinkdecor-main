import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/brand/Logo';
import { ComponentCanvas, type ComponentCanvasHandle, type ImageComponent } from '@/components/editor/ComponentCanvas';
import { ComponentPanel } from '@/components/editor/ComponentPanel';
import { CanvasToolbar } from '@/components/editor/CanvasToolbar';
import { ROOM_SAMPLES, type RoomSample } from '@/data/roomSamples';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Download,
  Upload,
  Sparkles,
  RefreshCw
} from 'lucide-react';

export default function DemoV2() {
  const canvasRef = useRef<ComponentCanvasHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Demo state
  const [selectedSample, setSelectedSample] = useState<RoomSample | null>(null);
  const [components, setComponents] = useState<ImageComponent[]>([]);
  const [selectedComponentId, setSelectedComponentId] = useState<string | null>(null);
  const [isSelectMode, setIsSelectMode] = useState(true);
  
  // Canvas controls
  const [zoom, setZoom] = useState(100);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [showBefore, setShowBefore] = useState(false);

  // Initialize components when sample is selected
  const handleSelectSample = (sample: RoomSample) => {
    setSelectedSample(sample);
    setComponents(sample.components.map(c => ({
      ...c,
      texture_url: null,
      tint_color: null,
      opacity: 0.7,
      blend_mode: 'multiply',
      scale: 1,
      tile: true,
    })));
    setSelectedComponentId(null);
    setZoom(100);
    setPanOffset({ x: 0, y: 0 });
    toast.success(`Loaded "${sample.name}" - Click on any component to customize it!`);
  };

  // Update component
  const handleUpdateComponent = (id: string, updates: Partial<ImageComponent>) => {
    setComponents(prev => prev.map(c => 
      c.id === id ? { ...c, ...updates } : c
    ));
  };

  // Handle texture upload
  const handleTextureUpload = (file: File) => {
    if (!selectedComponentId) return;
    
    const url = URL.createObjectURL(file);
    handleUpdateComponent(selectedComponentId, { texture_url: url, tint_color: null });
    toast.success('Custom texture applied!');
  };

  // Reset all customizations
  const handleReset = () => {
    if (selectedSample) {
      setComponents(selectedSample.components.map(c => ({
        ...c,
        texture_url: null,
        tint_color: null,
        opacity: 0.7,
        blend_mode: 'multiply',
        scale: 1,
        tile: true,
      })));
      setSelectedComponentId(null);
      toast.success('All customizations reset');
    }
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
      } else if (e.key === 'Escape') {
        setSelectedComponentId(null);
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

  // Show sample selection if no sample selected
  if (!selectedSample) {
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
          <div className="max-w-5xl w-full">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">ThinkDecor Component Editor Demo</h1>
              <p className="text-muted-foreground">
                Select a room to start customizing - click on individual furniture, walls, floors and more!
              </p>
            </div>

            {/* Sample Images Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {ROOM_SAMPLES.map((sample) => (
                <button
                  key={sample.id}
                  onClick={() => handleSelectSample(sample)}
                  className="group relative aspect-video rounded-xl overflow-hidden border-2 border-border hover:border-primary transition-all hover:shadow-xl hover:shadow-primary/10"
                >
                  <img 
                    src={sample.thumbnail} 
                    alt={sample.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                  <div className="absolute bottom-4 left-4 text-left">
                    <div className="text-white font-semibold text-lg">{sample.name}</div>
                    <div className="text-white/70 text-sm">{sample.description}</div>
                    <div className="text-primary text-xs mt-1">{sample.components.length} customizable components</div>
                  </div>
                  <div className="absolute top-3 right-3 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to start
                  </div>
                </button>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-muted-foreground mb-4">
                Each room has precisely mapped components you can customize individually
              </p>
              <input
                type="file"
                ref={fileInputRef}
                className="hidden"
                accept="image/*"
                onChange={() => {
                  toast.info('Custom image upload with AI segmentation coming soon!');
                }}
              />
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                <Upload className="h-4 w-4" />
                Upload Custom Image (Coming Soon)
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
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

        <div className="text-center">
          <span className="font-medium">{selectedSample.name}</span>
          <span className="text-xs text-muted-foreground ml-2">({components.length} components)</span>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => { setSelectedSample(null); setComponents([]); }}
          >
            Change Room
          </Button>
          <Button variant="outline" size="sm" onClick={handleReset}>
            <RefreshCw className="h-4 w-4" />
            <span className="hidden sm:inline">Reset</span>
          </Button>
          <Button variant="hero" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Link to="/signup">
            <Button variant="glow" size="sm">
              <Sparkles className="h-4 w-4" />
              Sign Up
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Components */}
        <ComponentPanel
          components={components}
          selectedComponentId={selectedComponentId}
          isSelectMode={isSelectMode}
          onSelectModeChange={setIsSelectMode}
          onSelectComponent={setSelectedComponentId}
          onUpdateComponent={handleUpdateComponent}
          onTextureUpload={handleTextureUpload}
        />

        {/* Center - Canvas */}
        <main className="flex-1 flex flex-col overflow-hidden bg-background">
          {/* Canvas Toolbar */}
          <CanvasToolbar
            zoom={zoom}
            showBefore={showBefore}
            isPanMode={false}
            onZoomIn={handleZoomIn}
            onZoomOut={handleZoomOut}
            onFitToScreen={handleFitToScreen}
            onResetView={handleResetView}
            onTogglePanMode={() => {}}
            onShowBeforeChange={setShowBefore}
          />

          {/* Canvas Container */}
          <div className="flex-1 overflow-hidden">
            <ComponentCanvas
              ref={canvasRef}
              baseImageUrl={selectedSample.baseImage}
              components={components}
              selectedComponentId={selectedComponentId}
              width={1920}
              height={1080}
              zoom={zoom}
              showBefore={showBefore}
              panOffset={panOffset}
              onPanChange={setPanOffset}
              onComponentClick={setSelectedComponentId}
              isSelectMode={isSelectMode}
            />
          </div>
        </main>

        {/* Right Panel - Tips */}
        <aside className="w-56 border-l border-border bg-card/30 flex flex-col overflow-hidden flex-shrink-0">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-sm mb-3">How to Use</h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>1. <strong>Enable Selection Mode</strong> to see all clickable regions</p>
              <p>2. Click on a highlighted component (sofa, wall, floor, etc.)</p>
              <p>3. Choose a texture or color from the panel</p>
              <p>4. Adjust opacity and blend mode</p>
              <p>5. Export your design!</p>
            </div>
          </div>
          
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-sm mb-3">Tip</h3>
            <p className="text-xs text-muted-foreground">
              When Selection Mode is active, all component boundaries are visible with labels. 
              Hover over any region to see what it is!
            </p>
          </div>
          
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-sm mb-3">Keyboard Shortcuts</h3>
            <div className="space-y-1 text-xs text-muted-foreground">
              <p><kbd className="px-1 bg-secondary rounded">Ctrl</kbd> + <kbd className="px-1 bg-secondary rounded">Scroll</kbd> Zoom</p>
              <p><kbd className="px-1 bg-secondary rounded">Alt</kbd> + <kbd className="px-1 bg-secondary rounded">Drag</kbd> Pan</p>
              <p><kbd className="px-1 bg-secondary rounded">Esc</kbd> Deselect</p>
            </div>
          </div>

          <div className="p-4 flex-1">
            <div className="p-4 rounded-xl bg-primary/5 border border-primary/20">
              <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                Go Pro
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                Sign up to save projects, upload custom images, and export in HD.
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