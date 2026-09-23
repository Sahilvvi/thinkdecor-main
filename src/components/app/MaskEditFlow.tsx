import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowRight, Check, Download, Eraser, ImagePlus, Loader2, Mic, MicOff, Repeat, RotateCcw, Sparkles,
} from 'lucide-react';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { MaskCanvas, type MaskCanvasHandle, type Stroke } from '@/components/app/MaskCanvas';
import { StoredCompare } from '@/components/app/StoredImage';
import { Magnetic, Reveal } from '@/components/premium/Motion';
import {
  FREE_SIGNUP_CREDITS, GenerationError, OutOfCreditsError, RateLimitError,
  downloadStoredImage, fileNameFor, isSetupError, labelMaskRegion, useCreditBalance, useGenerateMaskEdit,
  useStoredImageUrl, type Generation,
} from '@/lib/generation';
import { useAuthStore } from '@/stores/authStore';
import { PHASE1_PLAN, money, pence } from '@/lib/billing';

/** How long to wait after the last stroke before asking Gemini what's under the mask. */
const LABEL_DEBOUNCE_MS = 700;

const INTRO = pence(PHASE1_PLAN.introPrice ?? 0.69);
const MONTHLY = money(PHASE1_PLAN.monthly);
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/** Quick-start categories shown before upload, in "replace" mode only — pre-fill the
 *  step-2 prompt so there's already a sensible starting point to edit. */
const REPLACE_SUGGESTIONS = [
  { label: 'Sofas', prompt: 'a different sofa' },
  { label: 'Rugs', prompt: 'a new rug' },
  { label: 'Lamps', prompt: 'a different lamp' },
  { label: 'Tables', prompt: 'a different table' },
];

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
  const location = useLocation();
  const { data: credits, error: creditsError } = useCreditBalance();
  const generate = useGenerateMaskEdit();

  // Library's "Edit again" opens a stored photo straight into the paint step.
  const prefillPath = (location.state as { inputPath?: string } | null)?.inputPath;
  const [source, setSource] = useState<Source | null>(prefillPath ? { kind: 'stored', path: prefillPath } : null);
  const [strokeCount, setStrokeCount] = useState(0);
  // Kept here, not only inside the canvas, so "Edit mask again" (which
  // remounts the canvas) restores the painted mask instead of wiping it.
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [dragging, setDragging] = useState(false);
  const [result, setResult] = useState<Generation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [label, setLabel] = useState<string | null>(null);
  const [labeling, setLabeling] = useState(false);
  const [labelFailed, setLabelFailed] = useState(false);

  const canvasRef = useRef<MaskCanvasHandle>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const labelRequestId = useRef(0);
  const labelTimer = useRef<number | null>(null);

  const voice = useVoiceInput({
    onResult: (text) => setPrompt((prev) => (prev ? `${prev} ${text}` : text)),
    onError: (message) => toast.error(message),
  });

  // After each stroke, wait for painting to pause, then ask Mantha what's
  // under the mask — so the user sees what was detected before they can hit
  // Regenerate, instead of guessing whether the selection was right.
  useEffect(() => {
    if (labelTimer.current) window.clearTimeout(labelTimer.current);
    if (!source || strokeCount === 0) {
      labelRequestId.current += 1;
      setLabel(null);
      setLabeling(false);
      setLabelFailed(false);
      return;
    }
    const myId = ++labelRequestId.current;
    setLabeling(true);
    setLabelFailed(false);
    labelTimer.current = window.setTimeout(async () => {
      try {
        // A small JPEG is plenty to name an object, and far quicker to send.
        const maskedImage = await canvasRef.current?.exportMasked({ maxDimension: 768, type: 'image/jpeg' });
        if (!maskedImage || myId !== labelRequestId.current) return;
        const detected = await labelMaskRegion(maskedImage);
        if (myId === labelRequestId.current) setLabel(detected);
      } catch {
        // Detection is optional — Generate still works without a label.
        if (myId === labelRequestId.current) { setLabel(null); setLabelFailed(true); }
      } finally {
        if (myId === labelRequestId.current) setLabeling(false);
      }
    }, LABEL_DEBOUNCE_MS);
    return () => { if (labelTimer.current) window.clearTimeout(labelTimer.current); };
  }, [strokeCount, source]);

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
    setStrokes([]);
    setHasGenerated(false);
    setSource({ kind: 'file', file, preview: URL.createObjectURL(file) });
  };

  const startOver = () => {
    setSource(null);
    setResult(null);
    setError(null);
    setStrokeCount(0);
    setStrokes([]);
    setHasGenerated(false);
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
      const generation = await generate.mutateAsync({
        userId: user.id,
        cleanImage: source.kind === 'file' ? source.file : source.path,
        maskedImage,
        mode,
        prompt: prompt.trim(),
        detectedLabel: label ?? undefined,
      });
      setHasGenerated(true);
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
  // The canvas needs a loadable URL, so a stored photo is signed first.
  const canvasSrc = useStoredImageUrl(cleanBeforeRef);

  return (
    <>
      <Reveal className="text-center">
        <div className="flex flex-wrap items-center justify-center gap-3">
          <h1 className="font-display text-[clamp(1.9rem,3.4vw,2.6rem)] font-normal tracking-[-0.01em] text-foreground">{title}</h1>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-primary">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            {kicker}
          </span>
        </div>
        <p className="mx-auto mt-2 max-w-[60ch] text-[15px] text-foreground/55">{description}</p>
        {credits !== undefined && (
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/[0.07] px-3 py-1.5 text-[12.5px] font-semibold text-primary">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {credits} {credits === 1 ? 'credit' : 'credits'} left · 1 per design
          </span>
        )}
      </Reveal>

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
          <Magnetic className="mt-4 flex-shrink-0 sm:mt-0">
            <Link
              to="/pricing"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-white px-5 py-2.5 text-[14px] font-semibold text-primary transition-transform duration-300 hover:scale-[1.03]"
            >
              <span
                aria-hidden
                className="absolute inset-0 -translate-x-full bg-[linear-gradient(100deg,transparent,hsl(168_100%_17%/0.12),transparent)] transition-transform duration-700 group-hover:translate-x-full"
              />
              <span className="relative">Start for {INTRO}</span>
            </Link>
          </Magnetic>
        </div>
      )}

      {/* Step progress — a real stepper (fixed equal-width columns + a track
          spanning exactly between circle centers), not flex-1 rows. Flex-1
          on every column — including the last, with nothing after it to
          fill — was what made the whole row read as off-center before. */}
      <div className="relative mx-auto mt-8 max-w-[420px]">
        {(() => {
          const stepIndex = result ? 2 : source ? 1 : 0;
          return (
            <>
              <div className="absolute left-[calc(100%/6)] right-[calc(100%/6)] top-4 h-[2px] -translate-y-1/2 rounded-full bg-border" />
              <motion.div
                className="absolute left-[calc(100%/6)] top-4 h-[2px] -translate-y-1/2 rounded-full bg-primary"
                initial={false}
                animate={{ width: `${stepIndex * (100 / 3)}%` }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
              />
              <div className="relative grid grid-cols-3">
                {(['Upload', 'Paint', 'Result'] as const).map((label, i) => {
                  const active = i === stepIndex;
                  const done = i < stepIndex;
                  return (
                    <div key={label} className="flex flex-col items-center gap-2">
                      <span
                        className={`relative flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-[12px] font-bold shadow-sm transition-colors duration-300 ${
                          active || done ? 'bg-primary text-primary-foreground' : 'border border-border bg-card text-foreground/40'
                        }`}
                      >
                        {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
                        {active && (
                          <motion.span
                            layoutId="mask-flow-step-ring"
                            className="absolute -inset-1.5 rounded-full ring-2 ring-primary/25"
                            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                          />
                        )}
                      </span>
                      <span className={`text-[12.5px] font-medium transition-colors duration-300 ${active ? 'text-foreground' : 'text-foreground/40'}`}>
                        {label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </>
          );
        })()}
      </div>

      <div className="relative mx-auto mt-5 max-w-[640px] overflow-hidden rounded-[26px] border border-border/70 bg-card p-6 shadow-[0_28px_60px_-32px_hsl(168_40%_15%/0.4)] sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[linear-gradient(hsl(168_30%_20%/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(168_30%_20%/0.03)_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,#000,transparent)]"
        />
        <AnimatePresence mode="wait">
          {/* ---------- 1. no photo yet ---------- */}
          {!source && !result && (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); pickFile(e.dataTransfer.files?.[0]); }}
                className={`flex flex-col items-center justify-center gap-3 rounded-[20px] border-2 border-dashed px-8 py-14 text-center transition-colors duration-300 ${
                  dragging ? 'border-primary bg-primary/[0.04]' : 'border-border/70 hover:border-primary/40'
                }`}
              >
                <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <span aria-hidden className="absolute inset-0 rounded-full bg-primary/25 blur-xl" />
                  <motion.span
                    animate={{ scale: [1, 1.08, 1] }}
                    transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
                    className="relative"
                  >
                    {mode === 'cleanup' ? (
                      <Eraser className="h-6 w-6 text-primary" />
                    ) : (
                      <Repeat className="h-6 w-6 text-primary" />
                    )}
                  </motion.span>
                </span>
                <p className="text-[16px] font-semibold text-foreground">Upload a room photo</p>
                <p className="max-w-[40ch] text-[13.5px] text-foreground/55">
                  Drop a photo here or tap to choose one — then paint over what you want to {mode === 'cleanup' ? 'remove' : 'replace'}.
                </p>
                <Magnetic strength={0.25}>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="group relative mt-1 inline-flex items-center gap-2 overflow-hidden rounded-full bg-primary px-5 py-2.5 text-[14px] font-semibold text-primary-foreground transition-transform duration-300 hover:scale-[1.03]"
                  >
                    <span
                      aria-hidden
                      className="absolute inset-0 -translate-x-full bg-[linear-gradient(100deg,transparent,rgba(255,255,255,0.25),transparent)] transition-transform duration-700 group-hover:translate-x-full"
                    />
                    <ImagePlus className="relative h-4 w-4" /> <span className="relative">Upload photo</span>
                  </button>
                </Magnetic>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  hidden
                  onChange={(e) => { pickFile(e.target.files?.[0]); e.target.value = ''; }}
                />

                {mode === 'replace' && (
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {REPLACE_SUGGESTIONS.map((s) => (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => { setPrompt(s.prompt); fileInputRef.current?.click(); }}
                        className="rounded-full bg-primary/10 px-3 py-1.5 text-[12.5px] font-medium text-primary transition-colors hover:bg-primary/20"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* ---------- 2. paint the mask ---------- */}
          {source && !result && (
            <motion.div
              key="mask"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative"
            >
              {canvasSrc ? (
                <MaskCanvas
                  ref={canvasRef}
                  imageSrc={canvasSrc}
                  initialStrokes={strokes}
                  onStrokesChange={setStrokes}
                  onStrokeCountChange={setStrokeCount}
                />
              ) : (
                <div className="flex aspect-[4/3] w-full animate-pulse items-center justify-center rounded-[18px] bg-secondary text-[13px] text-muted-foreground">
                  Loading photo…
                </div>
              )}
              <p className="mt-3 text-[12.5px] text-foreground/50">
                Paint over the {mode === 'cleanup' ? 'thing you want gone' : 'thing you want swapped out'} — the red marks the spot, they won't show up in the result.
              </p>

              <AnimatePresence mode="wait">
                {(labeling || label || labelFailed) && (
                  <motion.div
                    key={labeling ? 'labeling' : label ? 'label' : 'failed'}
                    initial={{ opacity: 0, y: -4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.2 }}
                    className={`mt-3 inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[13px] font-medium ${
                      labeling || label ? 'bg-primary/10 text-primary' : 'bg-secondary text-foreground/60'
                    }`}
                  >
                    {labeling ? (
                      <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Detecting…</>
                    ) : label ? (
                      <><Sparkles className="h-3.5 w-3.5" /> Looks like: <span className="font-semibold">{label}</span></>
                    ) : (
                      <>Couldn't identify it — you can still generate.</>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {mode === 'replace' && (
                <div className="mt-4">
                  <label className="text-[12.5px] font-medium text-foreground/60">{promptLabel}</label>
                  <div className="relative mt-1.5">
                    <textarea
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      placeholder={promptPlaceholder}
                      rows={2}
                      className="w-full resize-none rounded-xl border border-foreground/[0.12] bg-foreground/[0.03] py-3 pl-4 pr-11 text-[14px] text-foreground placeholder:text-foreground/38 outline-none transition-colors focus:border-primary/50"
                    />
                    {voice.supported && (
                      <button
                        type="button"
                        onClick={() => (voice.listening ? voice.stop() : voice.start())}
                        aria-label={voice.listening ? 'Stop voice input' : 'Describe by voice'}
                        className={`absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
                          voice.listening ? 'text-destructive' : 'text-foreground/40 hover:bg-secondary hover:text-foreground'
                        }`}
                      >
                        {voice.listening && (
                          <span aria-hidden className="absolute inset-0.5 animate-ping rounded-full bg-destructive/25" />
                        )}
                        {voice.listening ? <MicOff className="relative h-3.5 w-3.5" /> : <Mic className="relative h-3.5 w-3.5" />}
                      </button>
                    )}
                  </div>
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
                <Magnetic className="ml-auto" strength={0.25}>
                  <button
                    type="button"
                    onClick={generateNow}
                    disabled={strokeCount === 0 || labeling || generate.isPending || outOfCredits || setupPending}
                    className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-[14px] font-semibold text-primary-foreground shadow-[0_14px_32px_-14px_hsl(168_100%_17%/0.55)] transition-transform duration-300 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {generate.isPending ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> {generatingLabel}
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4" /> {hasGenerated ? 'Regenerate' : 'Generate'} <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </Magnetic>
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
              className="relative overflow-hidden rounded-[20px] border border-border/70 bg-card"
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
                    onClick={() => result.output_image_url && downloadStoredImage(result.output_image_url, fileNameFor(result.output_image_url, `thinkdecor-${mode}-${result.id.slice(0, 8)}`))}
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
