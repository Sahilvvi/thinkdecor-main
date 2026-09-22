import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowUp, Check, Download, ImagePlus, Loader2, RefreshCw, Wand2, X,
} from 'lucide-react';

import { SEO } from '@/components/shared/SEO';
import { StoredCompare, StoredImage } from '@/components/app/StoredImage';
import { Tilt } from '@/components/motion/primitives';
import { useAuthStore } from '@/stores/authStore';
import {
  FREE_SIGNUP_CREDITS, GenerationError, IS_PLACEHOLDER_GENERATOR, OutOfCreditsError, RateLimitError,
  downloadStoredImage, isSetupError, type Generation, useCreditBalance, useGenerate,
} from '@/lib/generation';
import {
  DEFAULT_TEMPLATE_KEY, ROOM_TYPES, TEMPLATES, type RoomType, roomLabel, templateByKey,
} from '@/lib/templates';
import { PHASE1_PLAN, money, pence } from '@/lib/billing';

const INTRO = pence(PHASE1_PLAN.introPrice ?? 0.69);
const MONTHLY = money(PHASE1_PLAN.monthly);
const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/** The photo in the composer: a new local file, or one already stored (refining/regenerating). */
type SourceImage = { kind: 'file'; file: File; preview: string } | { kind: 'stored'; path: string };

interface Turn {
  id: string;
  /** Local blob: preview while uploading; the stored bucket path once saved. */
  sourceRef: string;
  templateKey: string;
  roomType: RoomType;
  prompt: string;
  status: 'pending' | 'done' | 'error';
  result?: Generation;
  error?: string;
  attempt: number;
}

interface PrefillState {
  inputPath?: string;
  templateKey?: string | null;
  roomType?: RoomType | null;
  prompt?: string | null;
}

const refOf = (s: SourceImage) => (s.kind === 'file' ? s.preview : s.path);

export default function Create() {
  const { user } = useAuthStore();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const prefill = (location.state as PrefillState | null) ?? null;

  const { data: credits, isLoading: creditsLoading, error: creditsError } = useCreditBalance();
  const generate = useGenerate();

  const [source, setSource] = useState<SourceImage | null>(
    prefill?.inputPath ? { kind: 'stored', path: prefill.inputPath } : null,
  );
  const [templateKey, setTemplateKey] = useState(
    templateByKey(searchParams.get('template'))?.key ?? templateByKey(prefill?.templateKey)?.key ?? DEFAULT_TEMPLATE_KEY,
  );
  const [roomType, setRoomType] = useState<RoomType>(prefill?.roomType ?? 'living');
  const [prompt, setPrompt] = useState(prefill?.prompt ?? '');
  const [turns, setTurns] = useState<Turn[]>([]);
  const [dragging, setDragging] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const threadEndRef = useRef<HTMLDivElement>(null);

  const setupPending = isSetupError(creditsError);
  const outOfCredits = credits !== undefined && credits <= 0;
  const busy = turns.some((t) => t.status === 'pending');
  const canSend = !!source && !busy && !creditsLoading && !outOfCredits && !setupPending;

  // Release local previews when they're replaced or the page unmounts.
  const filePreview = source?.kind === 'file' ? source.preview : null;
  useEffect(() => () => { if (filePreview) URL.revokeObjectURL(filePreview); }, [filePreview]);

  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [turns]);

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
    setSource({ kind: 'file', file, preview: URL.createObjectURL(file) });
  };

  const run = async (args: {
    image: File | string;
    sourceRef: string;
    templateKey: string;
    roomType: RoomType;
    prompt: string;
    attempt: number;
  }) => {
    if (!user) return;
    const id = crypto.randomUUID();
    setTurns((prev) => [
      ...prev,
      {
        id,
        sourceRef: args.sourceRef,
        templateKey: args.templateKey,
        roomType: args.roomType,
        prompt: args.prompt,
        status: 'pending',
        attempt: args.attempt,
      },
    ]);

    try {
      const result = await generate.mutateAsync({
        userId: user.id,
        image: args.image,
        templateKey: args.templateKey,
        roomType: args.roomType,
        prompt: args.prompt,
        attempt: args.attempt,
      });
      // Point the bubble at the stored photo in the same update that swaps the
      // composer over, so the local preview can be released safely.
      setTurns((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: 'done', result, sourceRef: result.input_image_url } : t)),
      );
      // Keep refining the same photo without uploading it again.
      setSource({ kind: 'stored', path: result.input_image_url });
    } catch (err) {
      const message =
        err instanceof OutOfCreditsError
          ? "You're out of credits."
          : err instanceof RateLimitError || err instanceof GenerationError
            ? err.message
            : isSetupError(err)
              ? "Generation isn't switched on yet — the latest database update still needs to be applied."
              : 'Something went wrong generating that design. No worries — try again.';
      setTurns((prev) => prev.map((t) => (t.id === id ? { ...t, status: 'error', error: message } : t)));
    }
  };

  const send = () => {
    if (!source || !canSend) return;
    run({
      image: source.kind === 'file' ? source.file : source.path,
      sourceRef: refOf(source),
      templateKey,
      roomType,
      prompt: prompt.trim(),
      attempt: 0,
    });
    setPrompt('');
  };

  const regenerate = (turn: Turn) => {
    if (!turn.result || busy || outOfCredits) return;
    run({
      image: turn.result.input_image_url,
      sourceRef: turn.result.input_image_url,
      templateKey: turn.templateKey,
      roomType: turn.roomType,
      prompt: turn.prompt,
      attempt: turn.attempt + 1,
    });
  };

  const selectedTemplate = useMemo(() => templateByKey(templateKey), [templateKey]);

  return (
    <>
      <SEO title="Create | ThinkDecor" description="Redesign a room with Mantha AI." />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-primary">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Create
          </p>
          <h1 className="mt-2 text-[clamp(1.7rem,3vw,2.3rem)] font-bold tracking-[-0.025em] text-foreground">Create</h1>
          <p className="mt-1 text-[15px] text-foreground/55">
            Upload a room, choose a style, and tell Mantha what to change.
          </p>
        </div>
        {credits !== undefined && (
          <span className="inline-flex items-center gap-1.5 self-start rounded-full border border-primary/20 bg-primary/[0.07] px-3 py-1.5 text-[12.5px] font-semibold text-primary sm:self-auto">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            {credits} {credits === 1 ? 'credit' : 'credits'} left · 1 per design
          </span>
        )}
      </div>

      {IS_PLACEHOLDER_GENERATOR && (
        <p className="mt-4 rounded-xl border border-border/70 bg-secondary/60 px-4 py-2.5 text-[12.5px] text-foreground/60">
          Preview mode: results are sample designs while Mantha's live generation is being connected. Credits,
          history and your projects all work as they will at launch.
        </p>
      )}

      {setupPending && (
        <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/[0.07] px-5 py-4 text-[14px] text-amber-800">
          Creating switches on once the latest database update is applied.
        </div>
      )}

      {/* Thread */}
      <div className="mt-8 space-y-8">
        {turns.length === 0 ? (
          <EmptyThread credits={credits} onPickTemplate={setTemplateKey} activeTemplate={templateKey} />
        ) : (
          <AnimatePresence initial={false}>
          {turns.map((turn) => (
            <motion.div
              key={turn.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-4"
            >
              {/* The request */}
              <div className="flex justify-end">
                <div className="max-w-[min(100%,440px)] rounded-[20px] rounded-br-md bg-primary p-3 text-primary-foreground">
                  <StoredImage src={turn.sourceRef} alt="Your room" className="aspect-[4/3] w-full rounded-xl object-cover" />
                  <div className="mt-3 flex flex-wrap gap-1.5 px-1">
                    <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11.5px] font-medium">
                      {templateByKey(turn.templateKey)?.label}
                    </span>
                    <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11.5px] font-medium">
                      {roomLabel(turn.roomType)}
                    </span>
                    {turn.attempt > 0 && (
                      <span className="rounded-full bg-white/15 px-2.5 py-1 text-[11.5px] font-medium">
                        Variation {turn.attempt + 1}
                      </span>
                    )}
                  </div>
                  {turn.prompt && <p className="mt-2 px-1 pb-1 text-[14px] leading-relaxed">{turn.prompt}</p>}
                </div>
              </div>

              {/* The response */}
              <div className="flex gap-3">
                <span className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary to-[hsl(160_84%_38%)]">
                  <Wand2 className="h-4 w-4 text-primary-foreground" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] font-semibold text-foreground">Mantha AI</p>

                  {turn.status === 'pending' && (
                    <div className="mt-2 overflow-hidden rounded-[20px] border border-border/70 bg-card">
                      <div className="relative aspect-[4/3] w-full max-w-[640px] overflow-hidden bg-secondary">
                        <StoredImage src={turn.sourceRef} className="h-full w-full scale-105 object-cover opacity-60 blur-md" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                          <Loader2 className="h-7 w-7 animate-spin text-primary" />
                          <p className="text-[14px] font-medium text-foreground">Redesigning your room…</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {turn.status === 'error' && (
                    <div className="mt-2 rounded-[20px] border border-destructive/20 bg-destructive/[0.05] px-4 py-3 text-[14px] text-foreground/75">
                      {turn.error}
                      {outOfCredits && (
                        <Link to="/pricing" className="ml-1 font-semibold text-primary hover:underline">
                          See plans
                        </Link>
                      )}
                    </div>
                  )}

                  {turn.status === 'done' && turn.result && (
                    <div className="mt-2 max-w-[640px] overflow-hidden rounded-[20px] border border-border/70 bg-card">
                      <StoredCompare before={turn.result.input_image_url} after={turn.result.output_image_url} />
                      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 text-[12.5px] text-foreground/55">
                          <Check className="h-3.5 w-3.5 text-primary" />
                          Saved to your{' '}
                          <Link to="/app/library" className="font-semibold text-primary hover:underline">
                            projects
                          </Link>
                        </span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => regenerate(turn)}
                            disabled={busy || outOfCredits}
                            className="inline-flex items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-[13px] font-medium text-foreground transition-colors hover:bg-secondary disabled:cursor-not-allowed disabled:opacity-50"
                          >
                            <RefreshCw className="h-3.5 w-3.5" /> Regenerate
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              turn.result?.output_image_url &&
                              downloadStoredImage(turn.result.output_image_url, `thinkdecor-${turn.result.id.slice(0, 8)}.jpg`)
                            }
                            className="inline-flex items-center gap-1.5 rounded-full bg-primary px-3.5 py-1.5 text-[13px] font-semibold text-primary-foreground"
                          >
                            <Download className="h-3.5 w-3.5" /> Download
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
          </AnimatePresence>
        )}
        <div ref={threadEndRef} />
      </div>

      {/* Composer — or the paywall once free credits are spent */}
      <div className="sticky bottom-4 z-10 mt-8">
        {outOfCredits ? (
          <div className="rounded-[24px] bg-primary p-6 text-primary-foreground shadow-[0_24px_60px_-28px_hsl(168_100%_17%/0.6)] sm:flex sm:items-center sm:justify-between sm:gap-6">
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
        ) : (
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); pickFile(e.dataTransfer.files?.[0]); }}
            className={`rounded-[24px] border bg-background/95 p-3 backdrop-blur-xl transition-all duration-300 ${
              dragging
                ? 'border-primary shadow-[0_0_0_4px_hsl(168_100%_17%/0.1),0_24px_60px_-30px_hsl(168_100%_17%/0.5)]'
                : 'border-border/80 shadow-[0_24px_60px_-30px_hsl(168_40%_15%/0.45)]'
            }`}
          >
            {/* Style + room */}
            <div className="flex gap-2 overflow-x-auto pb-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.key}
                  type="button"
                  onClick={() => setTemplateKey(t.key)}
                  aria-pressed={templateKey === t.key}
                  className={`flex flex-shrink-0 items-center gap-2 rounded-full border py-1 pl-1 pr-3 text-[12.5px] font-medium transition-colors ${
                    templateKey === t.key
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/70 text-foreground/65 hover:text-foreground'
                  }`}
                >
                  <img src={t.image} alt="" className="h-6 w-6 rounded-full object-cover" />
                  {t.label}
                </button>
              ))}
            </div>

            <div className="flex items-end gap-3 pt-1">
              {/* Photo */}
              {source ? (
                <div className="relative flex-shrink-0">
                  <StoredImage src={refOf(source)} alt="Selected room" className="h-16 w-16 rounded-xl object-cover" />
                  <button
                    type="button"
                    onClick={() => setSource(null)}
                    aria-label="Remove photo"
                    className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-foreground text-background"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex h-16 w-16 flex-shrink-0 flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-primary/40 bg-primary/[0.04] text-primary transition-colors hover:bg-primary/[0.08]"
                  aria-label="Upload a room photo"
                >
                  <ImagePlus className="h-5 w-5" />
                  <span className="text-[10px] font-semibold">Photo</span>
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => { pickFile(e.target.files?.[0]); e.target.value = ''; }}
              />

              <div className="min-w-0 flex-1">
                <label htmlFor="room-type" className="sr-only">Room type</label>
                <select
                  id="room-type"
                  value={roomType}
                  onChange={(e) => setRoomType(e.target.value as RoomType)}
                  className="mb-1.5 rounded-full border border-border/70 bg-card px-3 py-1 text-[12.5px] font-medium text-foreground/70 outline-none focus:border-primary"
                >
                  {ROOM_TYPES.map((r) => (
                    <option key={r.key} value={r.key}>{r.label}</option>
                  ))}
                </select>

                <label htmlFor="prompt" className="sr-only">Describe your changes</label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
                  }}
                  rows={1}
                  placeholder={
                    source
                      ? `Describe changes — e.g. "green velvet sofa, oak floors" (${selectedTemplate?.label ?? 'style'})`
                      : 'Upload or drop a room photo to begin'
                  }
                  className="block max-h-40 min-h-[40px] w-full resize-none bg-transparent px-1 py-2 text-[14.5px] text-foreground outline-none placeholder:text-foreground/40 [field-sizing:content]"
                />
              </div>

              <button
                type="button"
                onClick={send}
                disabled={!canSend}
                aria-label="Generate design"
                className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-all duration-200 hover:scale-105 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 ${
                  canSend ? 'shadow-[0_8px_24px_-6px_hsl(168_100%_17%/0.55)]' : ''
                }`}
              >
                {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUp className="h-5 w-5" />}
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function EmptyThread({
  credits, onPickTemplate, activeTemplate,
}: {
  credits: number | undefined;
  onPickTemplate: (key: string) => void;
  activeTemplate: string;
}) {
  const featured = TEMPLATES.filter((t) => t.featured);
  return (
    <div className="relative overflow-hidden rounded-[26px] border border-border/70 bg-card px-6 py-10 text-center sm:px-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[linear-gradient(hsl(168_30%_20%/0.03)_1px,transparent_1px),linear-gradient(90deg,hsl(168_30%_20%/0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000,transparent)]"
      />
      <span className="relative mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
        <Wand2 className="h-5 w-5 text-primary" />
      </span>
      <h2 className="relative mt-4 text-[20px] font-bold tracking-[-0.02em] text-foreground">What are we redesigning today?</h2>
      <p className="relative mx-auto mt-2 max-w-[48ch] text-[14.5px] text-foreground/55">
        Add a photo below — straight-on, in daylight works best. Pick a style to start from, then describe anything
        you want changed.
        {credits !== undefined && credits > 0 && ` You have ${credits} ${credits === 1 ? 'credit' : 'credits'}.`}
      </p>
      <div className="relative mx-auto mt-7 grid max-w-2xl gap-3 sm:grid-cols-3">
        {featured.map((t) => (
          <Tilt key={t.key} max={6} innerClassName="rounded-2xl">
            <button
              type="button"
              onClick={() => onPickTemplate(t.key)}
              className={`group block w-full overflow-hidden rounded-2xl border text-left transition-colors ${
                activeTemplate === t.key ? 'border-primary ring-2 ring-primary/20' : 'border-border/70 hover:border-primary/40'
              }`}
            >
              <div className="overflow-hidden">
                <img
                  src={t.image}
                  alt={`${t.label} style`}
                  className="aspect-[4/3] w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <p className="px-3 py-2.5 text-[13.5px] font-semibold text-foreground">{t.label}</p>
            </button>
          </Tilt>
        ))}
      </div>
    </div>
  );
}
