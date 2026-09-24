import { useEffect, useMemo, useRef, useState } from 'react';
import { isActiveSubscription, useSubscription } from '@/hooks/useProfile';
import { Link, useLocation, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import {
  ArrowRight, Check, Download, ImagePlus, Link2, Loader2, Mic, MicOff, RefreshCw, Wand2, X,
} from 'lucide-react';

import { SEO } from '@/components/shared/SEO';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useAuthStore } from '@/stores/authStore';
import { StoredCompare, StoredImage } from '@/components/app/StoredImage';
import {
  ExtractionError, GenerationError, IS_PLACEHOLDER_GENERATOR, OutOfCreditsError, RateLimitError,
  downloadStoredImage, extractPinImage, fileNameFor, isSetupError, useStoredImageUrl, type Generation, useCreditBalance, useGenerate,
} from '@/lib/generation';
import {
  DEFAULT_TEMPLATE_KEY, ROOM_TYPES, TEMPLATES, type RoomType, roomLabel, templateByKey,
} from '@/lib/templates';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

/** The photo in the composer: a new local file, or one already stored (refining/regenerating). */
type SourceImage = { kind: 'file'; file: File; preview: string } | { kind: 'stored'; path: string };

interface Turn {
  id: string;
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

  const [pinUrl, setPinUrl] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [reference, setReference] = useState<{ path: string; title: string | null } | null>(null);
  const referencePreview = useStoredImageUrl(reference?.path);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const voice = useVoiceInput({
    onResult: (text) => setPrompt((prev) => (prev ? `${prev} ${text}` : text)),
    onError: (message) => toast.error(message),
  });

  const setupPending = isSetupError(creditsError);
  const outOfCredits = credits !== undefined && credits <= 0;
  const { data: subscription } = useSubscription();
  const subscribed = isActiveSubscription(subscription);
  const busy = turns.some((t) => t.status === 'pending');
  const canSend = !!source && !busy && !creditsLoading && !outOfCredits && !setupPending;

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
    setSource({ kind: 'file', file, preview: URL.createObjectURL(file) });
  };

  const run = async (args: {
    userId: string;
    image: File | string;
    sourceRef: string;
    templateKey: string;
    roomType: RoomType;
    prompt: string;
    attempt: number;
    restorePromptOnError?: boolean;
    referencePath?: string;
  }) => {
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
        userId: args.userId,
        image: args.image,
        templateKey: args.templateKey,
        roomType: args.roomType,
        prompt: args.prompt,
        attempt: args.attempt,
        referencePath: args.referencePath,
        referenceNote: args.referencePath ? args.prompt : undefined,
      });
      setTurns((prev) =>
        prev.map((t) => (t.id === id ? { ...t, status: 'done', result, sourceRef: result.input_image_url } : t)),
      );
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
      if (args.restorePromptOnError && args.prompt) setPrompt((current) => current || args.prompt);
    }
  };

  const send = () => {
    if (!user || !source || !canSend) return;
    run({
      userId: user.id,
      image: source.kind === 'file' ? source.file : source.path,
      sourceRef: refOf(source),
      templateKey,
      roomType,
      prompt: prompt.trim(),
      attempt: 0,
      restorePromptOnError: true,
      referencePath: reference?.path,
    });
    setPrompt('');
    // The edge function deletes the reference photo from storage once it's used
    // (like the mask overlay), so it can't be reused for a later send — clear it
    // here rather than let a second click reference an already-deleted file.
    setReference(null);
    setPinUrl('');
  };

  const extractPin = async () => {
    const url = pinUrl.trim();
    if (!url) return;
    setExtracting(true);
    try {
      const result = await extractPinImage(url);
      setReference({ path: result.path, title: result.title });
      toast.success('Got it — mention what to do with it below.');
    } catch (err) {
      toast.error(err instanceof ExtractionError ? err.message : "Couldn't read that link. Please try again.");
    } finally {
      setExtracting(false);
    }
  };

  const regenerate = (turn: Turn) => {
    if (!user || !turn.result || busy || outOfCredits) return;
    run({
      userId: user.id,
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
      <SEO title="Create | Think Decor" description="Redesign a room with Mantha AI." />

      <section className="panel">
        <div className="ph">
          <div className="r">
            <div className="kicker">Tools · Create</div>
            <h1>What are we <em>redesigning</em>?</h1>
            <p className="sub">Upload a room, choose a style, and tell Mantha what to change.</p>
          </div>
          {credits !== undefined && (
            <div className="actions r" style={{ ['--i' as string]: 1 }}>
              <span className="credpill">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L4 14h7l-1 8 9-12h-7z" /></svg>
                <b>{credits}</b> credits left · 1 per design
              </span>
            </div>
          )}
        </div>

        {IS_PLACEHOLDER_GENERATOR && (
          <div className="note r" style={{ ['--i' as string]: 2 }}>
            <div className="ic">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18" /></svg>
            </div>
            <div><b>Preview mode.</b> Results are sample designs while Mantha's live generation is being connected. Credits, history and your projects all work as they will at launch.</div>
          </div>
        )}

        {setupPending && (
          <div className="note r" style={{ ['--i' as string]: 2 }}>
            <div className="ic">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5L18 18M18 6l-2.5 2.5M8.5 15.5L6 18" /></svg>
            </div>
            <div>Creating switches on once the latest database update is applied.</div>
          </div>
        )}

        {/* Past turns */}
        {turns.length > 0 && (
          <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 16 }}>
            {turns.map((turn) => (
              <div key={turn.id} className="turn-card">
                <div className="turn-media">
                  {turn.status === 'pending' && (
                    <div className="turn-wait">
                      <StoredImage src={turn.sourceRef} style={{ width: '100%', height: '100%', objectFit: 'cover', filter: 'blur(6px)', opacity: 0.6 }} />
                      <div className="turn-wait-in">
                        <Loader2 className="spin" color="var(--brass)" width={28} height={28} />
                        <span style={{ fontWeight: 600, fontSize: 13.5 }}>Redesigning your room…</span>
                      </div>
                    </div>
                  )}
                  {turn.status === 'done' && turn.result && (
                    <StoredCompare before={turn.result.input_image_url} after={turn.result.output_image_url} />
                  )}
                  {turn.status === 'error' && (
                    <div className="note" style={{ margin: 0, background: 'var(--rose-bg)', boxShadow: 'inset 0 0 0 1px #F3D3CB', color: '#7A2E20' }}>
                      <div>
                        {turn.error}
                        {outOfCredits && !subscribed && <Link to="/pricing" style={{ marginLeft: 6, fontWeight: 700, color: 'var(--brass)' }}>See plans</Link>}
                      </div>
                    </div>
                  )}
                </div>

                <div className="turn-side">
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="tagp">{templateByKey(turn.templateKey)?.label}</span>
                    <span className="tagp">{roomLabel(turn.roomType)}</span>
                    {turn.attempt > 0 && <span className="tagp">Variation {turn.attempt + 1}</span>}
                  </div>
                  {turn.prompt && (
                    <div>
                      <div className="kicker" style={{ marginBottom: 6 }}>Your brief</div>
                      <p className="muted" style={{ fontSize: 14, lineHeight: 1.55 }}>{turn.prompt}</p>
                    </div>
                  )}

                  {turn.status === 'pending' && (
                    <p className="muted" style={{ fontSize: 13 }}>Usually about ten seconds. You can leave this page open.</p>
                  )}

                  {turn.status === 'done' && turn.result && (
                    <div className="turn-acts">
                      <span className="muted" style={{ fontSize: 12.5, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                        <Check width={14} height={14} color="var(--brass)" />
                        Saved to your <Link to="/app/library" style={{ fontWeight: 700, color: 'var(--brass)' }}>projects</Link>
                      </span>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button type="button" onClick={() => regenerate(turn)} disabled={busy || outOfCredits} className="btn btn-line btn-sm">
                          <RefreshCw width={14} height={14} /> Regenerate
                        </button>
                        <button
                          type="button"
                          onClick={() => turn.result?.output_image_url && downloadStoredImage(turn.result.output_image_url, fileNameFor(turn.result.output_image_url, `thinkdecor-${turn.result.id.slice(0, 8)}`))}
                          className="btn btn-dark btn-sm"
                        >
                          <Download width={14} height={14} /> Download
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="ws">
          <div
            className="drop r"
            style={{ ['--i' as string]: 3 }}
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); pickFile(e.dataTransfer.files?.[0]); }}
          >
            {dragging && (
              <svg className="ants"><rect x="1" y="1" width="calc(100% - 2px)" height="calc(100% - 2px)" rx="21" ry="21" /></svg>
            )}
            {source ? (
              <>
                <div style={{ position: 'relative', width: '100%', maxWidth: 420, borderRadius: 18, overflow: 'hidden' }}>
                  <StoredImage src={refOf(source)} alt="Selected room" style={{ width: '100%', aspectRatio: '4/3', objectFit: 'cover' }} />
                </div>
                <button type="button" className="btn btn-line" style={{ marginTop: 16 }} onClick={() => setSource(null)}>Choose a different photo</button>
              </>
            ) : (
              <>
                <div className="big">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 8h3l2-3h6l2 3h3a1 1 0 0 1 1 1v10a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9a1 1 0 0 1 1-1z" /><circle cx="12" cy="13" r="4" /></svg>
                </div>
                <h3>Drop a room photo, <em>or tap to choose</em></h3>
                <p>Straight-on and in daylight works best. Get two walls and the floor in frame so Mantha can read the room.</p>
                <div className="acts">
                  <button type="button" className="btn btn-dark" onClick={() => fileInputRef.current?.click()}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 16V4M7 9l5-5 5 5M5 20h14" /></svg>Choose a photo
                  </button>
                </div>
                <div className="fmt">
                  <span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="16" rx="2" /><circle cx="9" cy="10" r="2" /><path d="M21 16l-5-5-9 9" /></svg>JPG or PNG</span>
                  <span><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2v14a2 2 0 0 0 2 2h14M18 22V8a2 2 0 0 0-2-2H2" /></svg>One room per photo</span>
                </div>
              </>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              style={{ display: 'none' }}
              onChange={(e) => { pickFile(e.target.files?.[0]); e.target.value = ''; }}
            />
          </div>

          <aside className="side2">
            <div className="box r" style={{ ['--i' as string]: 4 }}>
              <h5><span className="n">1</span>Style<small>{selectedTemplate?.label}</small></h5>
              <div className="styles">
                {TEMPLATES.map((t) => (
                  <div key={t.key} className={`st${templateKey === t.key ? ' on' : ''}`} onClick={() => setTemplateKey(t.key)}>
                    <img src={t.image} alt="" />
                    <span>{t.label}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="box r" style={{ ['--i' as string]: 5 }}>
              <h5><span className="n">2</span>Room type</h5>
              <div className="rooms">
                {ROOM_TYPES.map((r) => (
                  <button key={r.key} type="button" className={`pchip${roomType === r.key ? ' on' : ''}`} onClick={() => setRoomType(r.key)}>{r.label}</button>
                ))}
              </div>
            </div>
          </aside>
        </div>

        <div className="comp r" style={{ ['--i' as string]: 7 }}>
          <div className="top1">
            <span className="kicker" style={{ fontSize: 10 }}>3 · Describe it</span>
            <span className="sel"><img src={selectedTemplate?.image} alt="" />{selectedTemplate?.label}</span>
            <span className="sel">{roomLabel(roomType)}</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', margin: '2px 0 10px' }}>
            {reference ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px 6px 6px', borderRadius: 999, background: 'var(--paper-2, #F2F2EE)', boxShadow: 'inset 0 0 0 1px var(--stone, #E4E1D8)' }}>
                {referencePreview && (
                  <img src={referencePreview} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} />
                )}
                <span style={{ fontSize: 12.5, fontWeight: 600, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {reference.title || 'Product from Pinterest'}
                </span>
                <button
                  type="button"
                  onClick={() => { setReference(null); setPinUrl(''); }}
                  aria-label="Remove product reference"
                  style={{ display: 'grid', placeItems: 'center', width: 20, height: 20, borderRadius: '50%', border: 0, background: 'transparent', cursor: 'pointer', color: 'var(--muted-foreground, #8A8A80)' }}
                >
                  <X width={13} height={13} />
                </button>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: '1 1 260px', minWidth: 200 }}>
                  <Link2 width={14} height={14} style={{ flexShrink: 0, opacity: 0.55 }} />
                  <input
                    type="url"
                    value={pinUrl}
                    onChange={(e) => setPinUrl(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); extractPin(); } }}
                    placeholder="Paste a Pinterest link to add that product…"
                    disabled={extracting}
                    style={{ flex: 1, minWidth: 0, border: 0, borderBottom: '1px solid var(--stone, #E4E1D8)', background: 'transparent', font: 'inherit', fontSize: 13, padding: '4px 2px', outline: 'none' }}
                  />
                </div>
                <button
                  type="button"
                  onClick={extractPin}
                  disabled={extracting || !pinUrl.trim()}
                  className="btn btn-line btn-sm"
                  style={{ flexShrink: 0 }}
                >
                  {extracting ? <Loader2 className="animate-spin" width={13} height={13} /> : <Link2 width={13} height={13} />}
                  {extracting ? 'Reading…' : 'Add'}
                </button>
              </>
            )}
          </div>
          {reference && (
            <p className="muted" style={{ fontSize: 12, margin: '-6px 0 10px' }}>
              Mention what to do with it below — e.g. "put this armchair by the window".
            </p>
          )}

          <div className="ta">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              rows={2}
              placeholder="Keep my sofa, swap the rug for something softer and add warmer lighting…"
            />
          </div>
          <div className="bot">
            {['Warmer lighting', 'Oak floor', 'Keep my furniture', 'Add plants'].map((s) => (
              <button key={s} type="button" className="sug" onClick={() => setPrompt((p) => (p ? `${p}, ${s.toLowerCase()}` : s))}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 5v14M5 12h14" /></svg>{s}
              </button>
            ))}
            <span className="cost">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L4 14h7l-1 8 9-12h-7z" /></svg>
              Uses <b>1</b> of your {credits ?? '—'} credits
            </span>
            {voice.supported && (
              <button
                type="button"
                onClick={() => (voice.listening ? voice.stop() : voice.start())}
                className="ico-btn"
                aria-label={voice.listening ? 'Stop voice input' : 'Describe changes by voice'}
                style={voice.listening ? { color: 'var(--rose)' } : undefined}
              >
                {voice.listening ? <MicOff width={16} height={16} /> : <Mic width={16} height={16} />}
              </button>
            )}
            <button type="button" onClick={send} disabled={!canSend} className={`go${canSend ? ' ready' : ''}`}>
              {!source && <span className="tt">Add a room photo to begin</span>}
              {busy ? <Loader2 className="animate-spin" width={15} height={15} /> : <Wand2 width={15} height={15} />}
              Redesign
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
            </button>
          </div>
        </div>
      </section>
    </>
  );
}
