import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Logo } from '@/components/brand/Logo';
import { Canvas2D, type Canvas2DHandle } from '@/components/editor/Canvas2D';
import { CanvasToolbar } from '@/components/editor/CanvasToolbar';
import { LayersPanel } from '@/components/editor/LayersPanel';
import { ExportPanel } from '@/components/editor/ExportPanel';
import { useAuthStore } from '@/stores/authStore';
import { useProject, useCreateProject, useUpdateProject } from '@/hooks/useProjects';
import { useLayers, useCreateLayer, useUpdateLayer, useDeleteLayer, type Layer } from '@/hooks/useLayers';
import { usePlanLimits } from '@/hooks/useProfile';
import { uploadFile } from '@/lib/storage';
import { toast } from 'sonner';
import {
  ArrowLeft,
  Save,
  Download,
  Check,
  Loader2
} from 'lucide-react';

export default function Editor() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isNew = projectId === 'new';
  const planLimits = usePlanLimits();

  // Data hooks
  const { data: project, isLoading: projectLoading } = useProject(projectId);
  const { data: layers = [], isLoading: layersLoading } = useLayers(projectId);
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const createLayer = useCreateLayer();
  const updateLayer = useUpdateLayer();
  const deleteLayer = useDeleteLayer();

  // Refs
  const canvasRef = useRef<Canvas2DHandle>(null);
  const baseImageInputRef = useRef<HTMLInputElement>(null);
  const textureInputRef = useRef<HTMLInputElement>(null);

  // Local state
  const [title, setTitle] = useState('Untitled Project');
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [showBefore, setShowBefore] = useState(false);
  const [isPanMode, setIsPanMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Initialize title from project
  useEffect(() => {
    if (project?.title) {
      setTitle(project.title);
    }
  }, [project?.title]);

  // Create new project on mount if needed
  useEffect(() => {
    if (isNew && user) {
      createProject.mutateAsync({})
        .then((p) => {
          navigate(`/app/editor/${p.id}`, { replace: true });
        })
        .catch(() => {
          toast.error('Failed to create project');
          navigate('/app');
        });
    }
  }, [isNew, user]);

  // Auto-save title with debounce
  const saveTitle = useCallback(async () => {
    if (!project || title === project.title) return;
    
    try {
      await updateProject.mutateAsync({ id: project.id, title });
      setLastSaved(new Date());
    } catch (error) {
      toast.error('Failed to save title');
    }
  }, [project, title, updateProject]);

  useEffect(() => {
    const timeout = setTimeout(saveTitle, 1000);
    return () => clearTimeout(timeout);
  }, [title, saveTitle]);

  // Handle base image upload
  const handleBaseImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !project || !user) return;

    setIsUploading(true);
    try {
      const url = await uploadFile('uploads', user.id, file, `base-${project.id}.${file.name.split('.').pop()}`);
      await updateProject.mutateAsync({ id: project.id, base_image_url: url });
      toast.success('Base image uploaded');
      setLastSaved(new Date());
    } catch (error) {
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle texture layer upload
  const handleTextureUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !project || !user) return;

    // Check layer limit
    if (layers.length >= planLimits.maxLayersPerProject) {
      toast.error(`You've reached the maximum of ${planLimits.maxLayersPerProject} layers on the free plan.`);
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadFile('textures', user.id, file);
      const newLayer = await createLayer.mutateAsync({
        project_id: project.id,
        name: file.name.replace(/\.[^/.]+$/, ''),
        texture_url: url,
        order_index: layers.length,
      });
      setSelectedLayerId(newLayer.id);
      toast.success('Texture layer added');
    } catch (error) {
      toast.error('Failed to add texture layer');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle layer visibility toggle
  const toggleLayerVisibility = async (layer: Layer) => {
    try {
      await updateLayer.mutateAsync({ id: layer.id, visible: !layer.visible });
    } catch (error) {
      toast.error('Failed to update layer');
    }
  };

  // Handle layer deletion
  const handleDeleteLayer = async (layerId: string) => {
    if (!projectId) return;
    try {
      await deleteLayer.mutateAsync({ id: layerId, projectId });
      if (selectedLayerId === layerId) {
        setSelectedLayerId(null);
      }
      toast.success('Layer deleted');
    } catch (error) {
      toast.error('Failed to delete layer');
    }
  };

  // Handle layer property update
  const handleLayerUpdate = async (property: string, value: unknown) => {
    const selectedLayer = layers.find(l => l.id === selectedLayerId);
    if (!selectedLayer) return;
    try {
      await updateLayer.mutateAsync({ id: selectedLayer.id, [property]: value });
    } catch (error) {
      toast.error('Failed to update layer');
    }
  };

  // Manual save with thumbnail
  const handleSave = async () => {
    if (!project || !user) return;
    
    setIsSaving(true);
    try {
      await saveTitle();
      
      // Generate and upload thumbnail
      if (canvasRef.current) {
        try {
          const thumbnailBlob = await canvasRef.current.generateThumbnail();
          const thumbnailFile = new File([thumbnailBlob], `thumb-${project.id}.png`, { type: 'image/png' });
          const thumbnailUrl = await uploadFile('thumbnails', user.id, thumbnailFile, `${project.id}.png`);
          await updateProject.mutateAsync({ id: project.id, thumbnail_url: thumbnailUrl });
        } catch (thumbError) {
          console.error('Failed to generate thumbnail:', thumbError);
        }
      }
      
      setLastSaved(new Date());
      toast.success('Project saved');
    } catch (error) {
      toast.error('Failed to save project');
    } finally {
      setIsSaving(false);
    }
  };

  // Export handler for header button
  const handleExport = async () => {
    if (!canvasRef.current) return;
    
    try {
      const blob = await canvasRef.current.exportCanvas(1, 'png');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${title || 'export'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Image exported');
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

  // Keyboard shortcuts for zoom
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

  if (isNew || projectLoading || createProject.isPending) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">
            {isNew ? 'Creating project...' : 'Loading project...'}
          </p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Project not found</h2>
          <Link to="/app">
            <Button variant="hero">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Hidden file inputs */}
      <input
        type="file"
        ref={baseImageInputRef}
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

      {/* Header */}
      <header className="h-14 border-b border-border bg-card/50 flex items-center justify-between px-4 flex-shrink-0">
        <div className="flex items-center gap-4">
          <Link to="/app" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back</span>
          </Link>
          <div className="h-6 w-px bg-border" />
          <Logo />
        </div>

        <div className="flex items-center gap-2">
          <Input 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-40 sm:w-60 h-9 text-center bg-transparent border-transparent hover:border-border focus:border-primary"
          />
        </div>

        <div className="flex items-center gap-2">
          {lastSaved && (
            <div className="text-xs text-muted-foreground hidden sm:flex items-center gap-1">
              <Check className="h-3 w-3 text-success" />
              Saved
            </div>
          )}
          <Button variant="ghost" size="sm" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            <span className="hidden sm:inline">Save</span>
          </Button>
          <Button variant="hero" size="sm" onClick={handleExport}>
            <Download className="h-4 w-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
        </div>
      </header>

      {/* Main Editor Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel - Layers */}
        <LayersPanel
          project={project}
          layers={layers}
          selectedLayerId={selectedLayerId}
          isUploading={isUploading}
          layersLoading={layersLoading}
          onSelectLayer={setSelectedLayerId}
          onToggleVisibility={toggleLayerVisibility}
          onDeleteLayer={handleDeleteLayer}
          onLayerUpdate={handleLayerUpdate}
          onBaseImageUpload={() => baseImageInputRef.current?.click()}
          onTextureUpload={() => textureInputRef.current?.click()}
        />

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
              baseImageUrl={project.base_image_url}
              layers={layers}
              width={project.canvas_width}
              height={project.canvas_height}
              zoom={zoom}
              showBefore={showBefore}
              panOffset={panOffset}
              onPanChange={setPanOffset}
            />
          </div>
        </main>

        {/* Right Panel - Export */}
        <aside className="w-64 border-l border-border bg-card/30 flex flex-col overflow-hidden flex-shrink-0">
          <ExportPanel
            projectId={project.id}
            canvasWidth={project.canvas_width}
            canvasHeight={project.canvas_height}
            maxResolution={planLimits.maxExportResolution}
            canvasRef={canvasRef}
          />
        </aside>
      </div>
    </div>
  );
}
