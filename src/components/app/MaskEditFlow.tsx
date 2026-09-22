import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowRight, Check, Download, ImagePlus, Loader2, RotateCcw, Sparkles,
} from 'lucide-react';
import { MaskCanvas, type MaskCanvasHandle } from '@/components/app/MaskCanvas';
import { StoredCompare } from '@/components/app/StoredImage';
import {
  FREE_SIGNUP_CREDITS, GenerationError, OutOfCreditsError, RateLimitError,
  downloadStoredImage, isSetupError, useCreditBalance, useGenerateMaskEdit,
  type Generation,
} from '@/lib/generation';
import { useAuthStore } from '@/stores/authStore';
import { PHASE1_PLAN, money, pence } from '@/lib/billing';

const INTRO = pence(PHASE1_PLAN.introPrice ?? 0.69);
const MONTHLY = money(PHASE1_PLAN.monthly);
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/** A picked photo before any mask is painted on it. */
type Source = { kind: 'file'; file: File; preview: string } | { kind: 'stored'; path: string };

/**
 * Shared upload → paint a mask → generate → before/after flow behind both
 * Cleanup and Replace (see src/pages/app/Cleanup.tsx and Replace.tsx) — they
 * differ only in copy, the fixed vs. user-prompt request, and the server
 * prompt generate-redesign builds for `mode`. The "before" shown in the
 * result slider is deliberately the visitor's own clean photo, not the
 * red-marked one actually sent to the model — that's still their real photo,
 * just without editing instructions painted on it that were never part of
 * the room.
 */
export function MaskEditFlow({
  mode, title, kicker, description, promptLabel, promptPlaceholder, generatingLabel,
}: {
  mode: 'cleanup' | 'replace';
  title: string;
  kicker: string;
  description: string;
  promptLabel?: string;
  promptPlaceholder?: string;
  generatingLabel: string;
}) {
  const { user } = useAuthStore();
  const { data: credits, isLoading: creditsLoading, error: creditsError } = useCreditBalance();
  const generate = useGenerateMaskEdit();

  const [source, setSource] = useState<Source | null>(null);
  const [strokeCount, setStrokeCount] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<Generation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const canvasRef = useRef<MaskCanvasHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const setupPending = isSetupError(creditsError);
  const outOfCredits = credits !== undefined && credits <= 0;

  const filePreview = source?.kind === 'file' ? source.preview : null;
  useEffect(() => () => { if (filePreview) URL.revokeObjectURL(filePreview); }, [filePreview]);

  const pickFile = (file: File | undefined) => {
    if (!file) return;
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Please choose a JPG, PNG or WebP photo.');
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      toast.error('That photo is over 10MB — please use a smaller one.');
      return;
    }
    setResult(null);
    setError(null);
    setSource({ kind: 'file', file, preview: URL.createObjectURL(file) });
  };

  const startOver = () => {
    setSource(null);
    setResult(null);
    setError(null);
    setStrokeCount(0);
    setPrompt('');
  };

  const editMaskAgain = () => {
    setResult(null);
    setError(null);
  };

  const generateNow = async () => {
    if (!user || !source || strokeCount === 0) return;
    setError(null);
    try {
      const maskedImage = await canvasRef.current?.exportMasked();
      if (!maskedImage) throw new Error('Could not read the painted photo — please try again.');
      const generation = await generate.mutateAsync({ userId: user.id, maskedImage, mode, prompt: prompt.trim() });
      setResult(generation);
    } catch (err) {
      const message =
        err instanceof OutOfCreditsError
          ? "You're out of credits."
          : err instanceof RateLimitError || err instanceof GenerationError
            ? err.message
            : isSetupError(err)
              ? `${title} isn't switched on yet — the latest database update still needs to be applied.`
              : 'Something went wrong. No worries — try again.';
      setError(message);
    }
  };

  // What the result slider's "before" should point at — the visitor's own
  // clean photo (object URL for a fresh upload, or the stored path if this
  // was already in the library), never the red-marked upload the model saw.
  const cleanBeforeRef = source ? (source.kind === 'file' ? source.preview : source.path) : null;

  return (
    <>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-primary">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            {kicker}
          </p>
          <h1 className="mt-2 text-[clamp(1.7rem,3vw,2.3rem)] font-bold tracking-[-0.025em] text-foreground">{title}</h1>
          <p className="mt-1 max-w-[54ch] text-[15px] text-foreground/55">{description}</p>
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
          {title} switches on once the latest database update is applied.
        </div>
      )}

      {outOfCredits && !setupPending && (
        <div className="mt-4 rounded-[24px] bg-primary p-6 text-primary-foreground shadow-[0_24px_60px_-28px_hsl(168_100%_17%/0.6)] sm:flex sm:items-center sm:justify-between sm:gap-6">
          <div>
            <p className="text-[17px] font-bold">You've used your {FREE_SIGNUP_CREDITS} free redesigns</p>
            <p className="mt-1 text-[14px] text-primary-foreground/75">
              Subscribe for {INTRO} your first month, then {MONTHLY}/month — {PHASE1_PLAN.credits} redesigns every month.
            </p>
          </div>
          <Link
            to="/pricing"
            className="mt-4 inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[14px] font-semibold text-primary sm:mt-0"
          >
            Start for {INTRO}
          </Link>
        </div>
      )}

      <div className="mt-8">
        <AnimatePresence mode="wait">
          {/* ---------- 1. no photo yet ---------- */}
          {!source && !result && (
            <motion.div key="upload" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); pickFile(e.dataTransfer.files?.[0]); }}
                onClick={() => fileInputRef.current?.click()}
                className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[24px] border-2 border-dashed px-8 py-20 text-center transition-colors duration-300 ${
                  dragging ? 'border-primary bg-primary/[0.04]' : 'border-border/70 hover:border-primary/40'
                }`}
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/[0.09] text-primary">
                  <ImagePlus className="h-5 w-5" />
                </span>
                <p className="text-[16px] font-semibold text-foreground">Upload a room photo</p>
                <p className="max-w-[40ch] text-[13.5px] text-foreground/55">
                  Drop a photo here or tap to choose one — then paint over what you want to {mode === 'cleanup' ? 'remove' : 'replace'}.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  hidden
                  onChange={(e) => { pickFile(e.target.files?.[0]); e.target.value = ''; }}
                />
              </div>
            </motion.div>
          )}

          {/* ---------- 2. paint the mask ---------- */}
          {source && !result && (
            <motion.div key="mask" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="max-w-[640px]">
              <MaskCanvas
                ref={canvasRef}
                imageSrc={source.kind === 'file' ? source.preview : source.path}
                onStrokeCountChange={setStrokeCount}
              />
              <p className="mt-3 text-[12.5px] text-foreground/50">
                Paint over the {mode === 'cleanup' ? 'thing you want gone' : 'thing you want swapped out'} — the red marks the spot, they won't show up in the result.
              </p>

              {mode === 'replace' && (
                <div className="mt-4">
                  <label className="text-[12.5px] font-medium text-foreground/60">{promptLabel}</label>
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder={promptPlaceholder}
                    rows={2}
                    className="mt-1.5 w-full resize-none rounded-xl border border-foreground/[0.12] bg-foreground/[0.03] px-4 py-3 text-[14px] text-foreground placeholder:text-foreground/38 outline-none transition-colors focus:border-primary/50"
                  />
                </div>
              )}

              {error && (
                <div className="mt-4 rounded-[16px] border border-destructive/20 bg-destructive/[0.05] px-4 py-3 text-[14px] text-foreground/75">
                  {error}
                  {error.includes('out of credits') && (
                    <Link to="/pricing" className="ml-1 font-semibold text-primary hover:underline">See plans</Link>
                  )}
                </div>
              )}

              <div className="mt-5 flex items-center gap-3">
                <button
                  type="button"
                  onClick={startOver}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2.5 text-[13.5px] font-medium text-foreground/70 transition-colors hover:text-foreground"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Different photo
                </button>
                <button
                  type="button"
                  onClick={generateNow}
                  disabled={strokeCount === 0 || generate.isPending || outOfCredits || setupPending}
                  className="ml-auto inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-[14px] font-semibold text-primary-foreground shadow-[0_14px_32px_-14px_hsl(168_100%_17%/0.55)] transition-transform duration-300 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                >
                  {generate.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> {generatingLabel}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" /> Generate <ArrowRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          )}

          {/* ---------- 3. result ---------- */}
          {result && cleanBeforeRef && (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-[640px] overflow-hidden rounded-[20px] border border-border/70 bg-card"
            >
              {/* StoredCompare/useStoredImageUrl already handle both a bucket
                  path (signs it) and an already-displayable blob:/http URL
                  (uses it as-is) — no branching needed here. */}
              <StoredCompare before={cleanBeforeRef} after={result.output_image_url} />
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <span className="inline-flex items-center gap-1.5 text-[12.5px] text-foreground/55">
                  <Check className="h-3.5 w-3.5 text-primary" />
                  Saved to your{' '}
                  <Link to="/app/library" className="font-semibold text-primary hover:underline">projects</Link>
                </span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={editMaskAgain}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    Edit mask again
                  </button>
                  <button
                    type="button"
                    onClick={startOver}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary"
                  >
                    <RotateCcw className="h-3.5 w-3.5" /> New photo
                  </button>
                  <button
                    type="button"
                    onClick={() => result.output_image_url && downloadStoredImage(result.output_image_url, `thinkdecor-${mode}-${result.id.slice(0, 8)}.jpg`)}
                    className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-[13px] font-semibold text-primary-foreground"
                  >
                    <Download className="h-3.5 w-3.5" /> Download
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
