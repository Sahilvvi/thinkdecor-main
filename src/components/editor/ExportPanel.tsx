import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useExports, useCreateExport } from '@/hooks/useExports';
import { uploadFile } from '@/lib/storage';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { Download, Loader2, ExternalLink, Trash2 } from 'lucide-react';
import type { Canvas2DHandle } from './Canvas2D';

interface ExportPanelProps {
  projectId: string;
  canvasWidth: number;
  canvasHeight: number;
  maxResolution: string;
  canvasRef: React.RefObject<Canvas2DHandle>;
}

export function ExportPanel({
  projectId,
  canvasWidth,
  canvasHeight,
  maxResolution,
  canvasRef,
}: ExportPanelProps) {
  const { user } = useAuthStore();
  const { data: exports = [], isLoading } = useExports(projectId);
  const createExport = useCreateExport();
  
  const [exportFormat, setExportFormat] = useState<'png' | 'jpg'>('png');
  const [exportResolution, setExportResolution] = useState<string>('1x');
  const [isExporting, setIsExporting] = useState(false);

  const resolutionMultiplier = {
    '1x': 1,
    '2x': 2,
    '4x': 4,
  };

  const handleExport = async () => {
    if (!canvasRef.current || !user) return;

    setIsExporting(true);
    try {
      const multiplier = resolutionMultiplier[exportResolution as keyof typeof resolutionMultiplier] || 1;
      const blob = await canvasRef.current.exportCanvas(multiplier, exportFormat);
      
      // Create file from blob
      const fileName = `export-${Date.now()}.${exportFormat}`;
      const file = new File([blob], fileName, { 
        type: exportFormat === 'jpg' ? 'image/jpeg' : 'image/png' 
      });
      
      // Upload to storage
      const exportUrl = await uploadFile('exports', user.id, file, `${projectId}/${fileName}`);
      
      // Create export record
      await createExport.mutateAsync({
        project_id: projectId,
        export_url: exportUrl,
        format: exportFormat,
        resolution: exportResolution,
      });
      
      // Also trigger download
      const downloadUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = downloadUrl;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(downloadUrl);
      
      toast.success('Export completed!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export image');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Export Section */}
      <div className="p-4 border-b border-border">
        <h3 className="font-semibold text-sm mb-4 flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export
        </h3>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs">Format</Label>
            <Select value={exportFormat} onValueChange={(v) => setExportFormat(v as 'png' | 'jpg')}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG (Lossless)</SelectItem>
                <SelectItem value="jpg">JPG (Smaller file)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-xs">Resolution</Label>
            <Select value={exportResolution} onValueChange={setExportResolution}>
              <SelectTrigger className="h-9">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1x">
                  1x ({canvasWidth}×{canvasHeight})
                </SelectItem>
                <SelectItem value="2x" disabled={maxResolution === '1x'}>
                  2x ({canvasWidth * 2}×{canvasHeight * 2})
                  {maxResolution === '1x' && ' (Pro)'}
                </SelectItem>
                <SelectItem value="4x" disabled={maxResolution !== '4x'}>
                  4x ({canvasWidth * 4}×{canvasHeight * 4})
                  {maxResolution !== '4x' && ' (Pro)'}
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button 
            variant="hero" 
            className="w-full"
            onClick={handleExport}
            disabled={isExporting}
          >
            {isExporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            {isExporting ? 'Exporting...' : 'Export Image'}
          </Button>
        </div>
      </div>

      {/* Export History */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-border">
          <h3 className="font-semibold text-sm">Export History</h3>
        </div>
        
        <ScrollArea className="flex-1">
          <div className="p-4">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              </div>
            ) : exports.length > 0 ? (
              <div className="space-y-3">
                {exports.map((exp) => (
                  <div
                    key={exp.id}
                    className="p-3 rounded-lg bg-secondary/30 border border-border hover:border-primary/30 transition-colors"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium uppercase">
                        {exp.format} · {exp.resolution}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(exp.created_at), 'MMM d, HH:mm')}
                      </span>
                    </div>
                    <a
                      href={exp.export_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      View export
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground text-sm">
                No exports yet
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}
