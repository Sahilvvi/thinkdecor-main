import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import { Download, ImagePlus, Loader2, RefreshCw, X } from 'lucide-react';

import { SEO } from '@/components/shared/SEO';
import { StoredCompare, StoredImage } from '@/components/app/StoredImage';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { useAuthStore } from '@/stores/authStore';
import {
  GenerationError, OutOfCreditsError, RateLimitError, downloadStoredImage, isSetupError,
  type Generation, useCreditBalance,
} from '@/lib/generation';
import { useRepaintFloor, useRepaintWalls, type WallMode } from '@/lib/repaint';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/** A photo the user picked: a new local file, or one already stored (a session's room photo). */
type SourceImage = { kind: 'file'; file: File; preview: string } | { kind: 'stored'; path: string };
const refOf = (s: SourceImage) => (s.kind === 'file' ? s.preview : s.path);

function errorMessage(err: unknown, outOfCredits: boolean): string {
  if (err instanceof OutOfCreditsError) return "You're out of credits.";
  if (err instanceof RateLimitError || err instanceof GenerationError) return err.message;
  if (isSetupError(err)) return "Repaint isn't switched on yet — it still needs the repaint-support migration and the Repaint service's API key.";
  return outOfCredits ? "You're out of credits." : 'That repaint failed. No worries — try again.';
}

/** Shared dashed-box picker for a room photo, a texture, or a wallpaper. */
function PhotoPicker({
  label, source, onPick, onClear,
}: {
  label: string;
  source: SourceImage | null;
  onPick: (file: File | undefined) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <p className="mb-1.5 text-[12.5px] font-medium text-foreground/65">{label}</p>
      {source ? (
        <div className="relative inline-block">
          <StoredImage src={refOf(source)} alt={label} className="h-24 w-24 rounded-xl object-cover" />
          <button
            type="button"
            onClick={onClear}
            aria-label={`Remove ${label.toLowerCase()}`}
            className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-primary/40 bg-primary/[0.04] text-primary transition-colors hover:bg-primary/[0.08]"
        >
          <ImagePlus className="h-5 w-5" />
          <span className="text-[10px] font-semibold">Upload</span>
        </button>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_TYPES.join(',')}
        className="hidden"
        onChange={(e) => { onPick(e.target.files?.[0]); e.target.value = ''; }}
      />
    </div>
  );
}

function pickFile(file: File | undefined, onOk: (f: File) => void) {
  if (!file) return;
  if (!ALLOWED_TYPES.includes(file.type)) {
    toast.error('Please choose a JPG, PNG or WebP photo.');
    return;
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    toast.error('That photo is over 10MB — please use a smaller one.');
    return;
  }
  onOk(file);
}

/** Result card shared by both tabs: before/after compare, download, try-another-on-this-photo. */
function ResultCard({
  result, onTryAnother,
}: {
  result: Generation;
  onTryAnother: () => void;
}) {
  return (
    <div className="mt-6 max-w-[640px] overflow-hidden rounded-[20px] border border-border/70 bg-card">
      <StoredCompare before={result.input_image_url} after={result.output_image_url} />
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
        <span className="text-[12.5px] text-foreground/55">
          Saved to your{' '}
          <Link to="/app/library" className="font-semibold text-primary hover:underline">projects</Link>
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onTryAnother}
            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Try another
          </button>
          <button
            type="button"
            onClick={() =>
              result.output_image_url &&
              downloadStoredImage(result.output_image_url, `thinkdecor-repaint-${result.id.slice(0, 8)}.jpg`)
            }
            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-[13px] font-semibold text-primary-foreground"
          >
            <Download className="h-3.5 w-3.5" /> Download
          </button>
        </div>
      </div>
    </div>
  );
}

function FloorTab({ outOfCredits }: { outOfCredits: boolean }) {
  const { user } = useAuthStore();
  const repaint = useRepaintFloor();

  const [room, setRoom] = useState<SourceImage | null>(null);
  const [texture, setTexture] = useState<SourceImage | null>(null);
  const [tileM, setTileM] = useState(0.6);
  const [rotDeg, setRotDeg] = useState(0);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [result, setResult] = useState<Generation | null>(null);

  useEffect(() => {
    const preview = room?.kind === 'file' ? room.preview : null;
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [room]);
  useEffect(() => {
    const preview = texture?.kind === 'file' ? texture.preview : null;
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [texture]);

  const canSend = !!room && !!texture && !repaint.isPending && !outOfCredits;

  const send = async () => {
    if (!user || !room || !texture) return;
    try {
      const generation = await repaint.mutateAsync({
        userId: user.id,
        image: room.kind === 'file' ? room.file : room.path,
        texture: texture.kind === 'file' ? texture.file : texture.path,
        tileM, rotDeg, sessionId,
      });
      setResult(generation);
      setSessionId(generation.session_id ?? undefined);
      setRoom({ kind: 'stored', path: generation.input_image_url });
    } catch (err) {
      toast.error(errorMessage(err, outOfCredits));
    }
  };

  return (
    <div className="mt-6 space-y-5">
      <div className="flex flex-wrap gap-6">
        <PhotoPicker
          label="Room photo"
          source={room}
          onPick={(f) => pickFile(f, (file) => {
            setRoom({ kind: 'file', file, preview: URL.createObjectURL(file) });
            setSessionId(undefined);
            setResult(null);
          })}
          onClear={() => { setRoom(null); setSessionId(undefined); setResult(null); }}
        />
        <PhotoPicker
          label="Floor texture"
          source={texture}
          onPick={(f) => pickFile(f, (file) => setTexture({ kind: 'file', file, preview: URL.createObjectURL(file) }))}
          onClear={() => setTexture(null)}
        />
      </div>

      <div className="grid max-w-md gap-4 sm:grid-cols-2">
        <div>
          <p className="mb-1.5 text-[12.5px] font-medium text-foreground/65">Tile size — {tileM.toFixed(2)} m</p>
          <Slider min={0.15} max={1.2} step={0.05} value={[tileM]} onValueChange={([v]) => setTileM(v)} />
        </div>
        <div>
          <p className="mb-1.5 text-[12.5px] font-medium text-foreground/65">Rotation — {rotDeg}°</p>
          <Slider min={0} max={90} step={5} value={[rotDeg]} onValueChange={([v]) => setRotDeg(v)} />
        </div>
      </div>

      <button
        type="button"
        onClick={send}
        disabled={!canSend}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[14px] font-semibold text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
      >
        {repaint.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {repaint.isPending ? 'Repainting floor…' : 'Repaint floor'}
      </button>

      {outOfCredits && (
        <p className="text-[13px] text-foreground/60">
          Out of credits. <Link to="/pricing" className="font-semibold text-primary hover:underline">See plans</Link>
        </p>
      )}

      {result && <ResultCard result={result} onTryAnother={() => setResult(null)} />}
    </div>
  );
}

function WallsTab({ outOfCredits }: { outOfCredits: boolean }) {
  const { user } = useAuthStore();
  const repaint = useRepaintWalls();

  const [room, setRoom] = useState<SourceImage | null>(null);
  const [mode, setMode] = useState<WallMode>('color');
  const [color, setColor] = useState('#e4ddce');
  const [wallpaper, setWallpaper] = useState<SourceImage | null>(null);
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [result, setResult] = useState<Generation | null>(null);

  useEffect(() => {
    const preview = room?.kind === 'file' ? room.preview : null;
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [room]);
  useEffect(() => {
    const preview = wallpaper?.kind === 'file' ? wallpaper.preview : null;
    return () => { if (preview) URL.revokeObjectURL(preview); };
  }, [wallpaper]);

  const canSend = !!room && (mode === 'color' || !!wallpaper) && !repaint.isPending && !outOfCredits;

  const send = async () => {
    if (!user || !room) return;
    try {
      const generation = await repaint.mutateAsync({
        userId: user.id,
        image: room.kind === 'file' ? room.file : room.path,
        mode,
        color: mode === 'color' ? color : undefined,
        wallpaper: mode === 'wallpaper' && wallpaper ? (wallpaper.kind === 'file' ? wallpaper.file : wallpaper.path) : undefined,
        sessionId,
      });
      setResult(generation);
      setSessionId(generation.session_id ?? undefined);
      setRoom({ kind: 'stored', path: generation.input_image_url });
    } catch (err) {
      toast.error(errorMessage(err, outOfCredits));
    }
  };

  return (
    <div className="mt-6 space-y-5">
      <PhotoPicker
        label="Room photo"
        source={room}
        onPick={(f) => pickFile(f, (file) => {
          setRoom({ kind: 'file', file, preview: URL.createObjectURL(file) });
          setSessionId(undefined);
          setResult(null);
        })}
        onClear={() => { setRoom(null); setSessionId(undefined); setResult(null); }}
      />

      <div className="flex gap-2">
        {(['color', 'wallpaper'] as const).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => setMode(m)}
            aria-pressed={mode === m}
            className={`rounded-full border px-4 py-1.5 text-[13px] font-medium capitalize transition-colors ${
              mode === m ? 'border-primary bg-primary/10 text-primary' : 'border-border/70 text-foreground/65 hover:text-foreground'
            }`}
          >
            {m}
          </button>
        ))}
      </div>

      {mode === 'color' ? (
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="h-10 w-10 cursor-pointer rounded-lg border border-border/70 bg-transparent p-0.5"
            aria-label="Wall color"
          />
          <span className="text-[13px] text-foreground/60">{color}</span>
        </div>
      ) : (
        <PhotoPicker
          label="Wallpaper"
          source={wallpaper}
          onPick={(f) => pickFile(f, (file) => setWallpaper({ kind: 'file', file, preview: URL.createObjectURL(file) }))}
          onClear={() => setWallpaper(null)}
        />
      )}

      <button
        type="button"
        onClick={send}
        disabled={!canSend}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[14px] font-semibold text-primary-foreground transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
      >
        {repaint.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {repaint.isPending ? 'Repainting walls…' : 'Repaint walls'}
      </button>

      {outOfCredits && (
        <p className="text-[13px] text-foreground/60">
          Out of credits. <Link to="/pricing" className="font-semibold text-primary hover:underline">See plans</Link>
        </p>
      )}

      {result && <ResultCard result={result} onTryAnother={() => setResult(null)} />}
    </div>
  );
}

export default function Repaint() {
  const { data: credits, error: creditsError } = useCreditBalance();
  const setupPending = isSetupError(creditsError);
  const outOfCredits = (credits !== undefined && credits <= 0) || setupPending;

  return (
    <>
      <SEO title="Repaint | ThinkDecor" description="Preview real floor and wall materials in your own room." />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[clamp(1.7rem,3vw,2.3rem)] font-bold tracking-[-0.025em] text-foreground">Repaint</h1>
          <p className="mt-1 text-[15px] text-foreground/55">
            Try a real floor texture or wall color/wallpaper in your own room, to scale.
          </p>
        </div>
        {credits !== undefined && (
          <span className="inline-flex items-center gap-1.5 self-start rounded-full border border-primary/20 bg-primary/[0.07] px-3 py-1.5 text-[12.5px] font-semibold text-primary sm:self-auto">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {credits} {credits === 1 ? 'credit' : 'credits'} left · 1 per design
          </span>
        )}
      </div>

      {setupPending && (
        <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/[0.07] px-5 py-4 text-[14px] text-amber-800">
          Repaint isn't switched on yet — it needs the repaint-support migration applied and the Repaint service's
          API key set.
        </div>
      )}

      <Tabs defaultValue="floor" className="mt-8">
        <TabsList>
          <TabsTrigger value="floor">Floor</TabsTrigger>
          <TabsTrigger value="walls">Walls</TabsTrigger>
        </TabsList>
        <TabsContent value="floor">
          <FloorTab outOfCredits={outOfCredits} />
        </TabsContent>
        <TabsContent value="walls">
          <WallsTab outOfCredits={outOfCredits} />
        </TabsContent>
      </Tabs>
    </>
  );
}
