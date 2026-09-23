import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Download, LayoutGrid, List as ListIcon, MoreHorizontal, Mail, Phone, Building2, Globe, Tag, Users, Inbox,
  X, Clock, StickyNote, Check, Trash2, Loader2, Calendar,
} from 'lucide-react';
import { SEO } from '@/components/shared/SEO';
import { AdminShell } from '@/components/admin/AdminShell';
import { Seg } from '@/components/admin/Seg';
import { CountUp } from '@/components/admin/CountUp';
import { Button } from '@/components/ui/button';
import {
  listLeads, setLeadStatus, setLeadNotes, deleteLead, downloadCsv,
  STATUSES, type Lead, type LeadStatus,
} from '@/lib/leads';

const STAGE_COLOR: Record<LeadStatus, string> = {
  new: 'var(--brass)', contacted: '#D69A3A', qualified: '#5B6FC0', closed: 'var(--char)',
};

const SOURCE_STYLE: Record<string, string> = {
  newsletter: 'nl',
};

function sourceClass(reason: string | null) {
  if (!reason) return 'ps';
  const key = reason.toLowerCase();
  if (key.includes('newsletter')) return 'nl';
  if (key.includes('brand') || key.includes('partner')) return 'bp';
  return SOURCE_STYLE[key] ?? 'ps';
}

function shortDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

function full(iso: string) {
  return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState(() => (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('q') ?? '' : ''));
  const [view, setView] = useState<'board' | 'list'>('board');
  const [open, setOpen] = useState<Lead | null>(null);
  const [confirm, setConfirm] = useState<Lead | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [savingNote, setSavingNote] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [overCol, setOverCol] = useState<LeadStatus | null>(null);

  const load = () => listLeads().then((r) => { setLeads(r); setErr(null); }).catch((e: Error) => setErr(e.message)).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);
  useEffect(() => { setNoteDraft(open?.notes ?? ''); }, [open]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return leads;
    return leads.filter((l) =>
      [l.name, l.email, l.company, l.message, l.reason, l.phone].filter(Boolean).some((v) => (v as string).toLowerCase().includes(term)),
    );
  }, [leads, q]);

  const byStage = useMemo(() => {
    const map: Record<LeadStatus, Lead[]> = { new: [], contacted: [], qualified: [], closed: [] };
    filtered.forEach((l) => map[l.status]?.push(l));
    return map;
  }, [filtered]);

  const unread = leads.filter((l) => l.status === 'new').length;
  const total = leads.length || 1;

  const changeStatus = async (l: Lead, status: LeadStatus) => {
    const prev = leads;
    setLeads((rows) => rows.map((r) => (r.id === l.id ? { ...r, status } : r)));
    setOpen((o) => (o && o.id === l.id ? { ...o, status } : o));
    try {
      await setLeadStatus(l.id, status);
    } catch (e) {
      setLeads(prev);
      toast.error((e as Error).message);
    }
  };

  const saveNote = async () => {
    if (!open) return;
    setSavingNote(true);
    try {
      await setLeadNotes(open.id, noteDraft);
      setLeads((rows) => rows.map((r) => (r.id === open.id ? { ...r, notes: noteDraft } : r)));
      // The open panel keeps its own copy of the lead; without this its idea of the
      // saved note goes stale and Save stays disabled when you clear or revert a note.
      setOpen((o) => (o && o.id === open.id ? { ...o, notes: noteDraft } : o));
      toast.success('Note saved');
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setSavingNote(false);
    }
  };

  const remove = async (l: Lead) => {
    try {
      await deleteLead(l.id);
      setLeads((rows) => rows.filter((r) => r.id !== l.id));
      setConfirm(null);
      if (open?.id === l.id) setOpen(null);
      toast.success('Lead deleted');
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const onDrop = (status: LeadStatus) => {
    setOverCol(null);
    if (!dragId) return;
    const lead = leads.find((l) => l.id === dragId);
    setDragId(null);
    if (lead && lead.status !== status) changeStatus(lead, status);
  };

  return (
    <AdminShell>
      <SEO title="Leads · ThinkDecor" description="Contact form submissions." />

      <section className="panel">
        <div className="ph">
          <div className="r">
            <div className="kicker">Content · Inbound</div>
            <h1>Leads <em>pipeline</em></h1>
            <p className="sub">
              {leads.length} leads<span className="sep" />{unread} unread<span className="sep" />
              {view === 'board' ? 'Drag a card to move it between stages' : 'Click a row to open it'}
            </p>
          </div>
          <div className="actions r" style={{ ['--i' as string]: 1 }}>
            <Seg<'board' | 'list'>
              layoutId="leads-view"
              value={view}
              onChange={setView}
              options={[
                { value: 'board', label: 'Board', icon: <LayoutGrid width={14} height={14} /> },
                { value: 'list', label: 'List', icon: <ListIcon width={14} height={14} /> },
              ]}
            />
            <button type="button" className="btn btn-line" onClick={() => downloadCsv(filtered)} disabled={!filtered.length}>
              <Download width={15} height={15} /> Export CSV
            </button>
          </div>
        </div>

        <div className="funnel r" style={{ ['--i' as string]: 2 }}>
          {STATUSES.map((s) => {
            const count = byStage[s.value]?.length ?? leads.filter((l) => l.status === s.value).length;
            return (
              <div className="fs" key={s.value}>
                <div className="lab"><i style={{ background: STAGE_COLOR[s.value] }} />{s.label}</div>
                <div className="v"><CountUp value={leads.filter((l) => l.status === s.value).length} /></div>
                <div className="track"><b style={{ width: `${(count / total) * 100}%`, background: STAGE_COLOR[s.value] }} /></div>
              </div>
            );
          })}
        </div>

        <div className="toolbar r" style={{ ['--i' as string]: 3 }}>
          <div className="field" style={{ width: 340 }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, company, message…" />
          </div>
          <span className="spacer" />
          <span className="muted text-[12.5px]">Newest first</span>
        </div>

        {loading && (
          <div className="mt-10 flex items-center justify-center gap-3 py-14" style={{ color: 'var(--taupe)' }}>
            <Loader2 className="h-4 w-4 animate-spin" /> Loading leads…
          </div>
        )}

        {!loading && err && (
          <div className="mt-8 rounded-2xl px-6 py-10 text-center" style={{ boxShadow: 'inset 0 0 0 1px var(--stone-2)' }}>
            <p className="text-[14.5px]" style={{ color: 'var(--taupe)' }}>Couldn't load leads.</p>
            <p className="mt-2 text-[12px]" style={{ color: 'var(--taupe-2)' }}>{err}</p>
          </div>
        )}

        {!loading && !err && view === 'board' && (
          <div className="board">
            {STATUSES.map((s, ci) => (
              <div
                key={s.value}
                className={`col r${overCol === s.value ? ' over' : ''}`}
                style={{ ['--i' as string]: ci + 4 }}
                onDragOver={(e) => { e.preventDefault(); setOverCol(s.value); }}
                onDragLeave={() => setOverCol((c) => (c === s.value ? null : c))}
                onDrop={(e) => { e.preventDefault(); onDrop(s.value); }}
              >
                <div className="col-h">
                  <i style={{ background: STAGE_COLOR[s.value] }} />{s.label} <span className="c">{byStage[s.value].length}</span>
                </div>
                {byStage[s.value].length === 0 ? (
                  <div className="drop">
                    <div><b>{s.value === 'new' ? 'Nothing new' : `Drop here for ${s.label.toLowerCase()}`}</b>Drag a card from another column</div>
                  </div>
                ) : (
                  byStage[s.value].map((l) => (
                    <div
                      key={l.id}
                      className="lead"
                      draggable
                      onDragStart={() => setDragId(l.id)}
                      onDragEnd={() => setDragId(null)}
                      onClick={() => setOpen(l)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className="top1">
                        <div className="av s l">{l.name?.slice(0, 1).toUpperCase() || '?'}</div>
                        <div>
                          <div className="nm">{l.name}{l.status === 'new' && <span className="unread" />}</div>
                          <div className="co">{l.company || 'No company'}</div>
                        </div>
                        <span className="hacts">
                          <button
                            type="button"
                            className="ico-btn"
                            title="Delete"
                            onClick={(e) => { e.stopPropagation(); setConfirm(l); }}
                          >
                            <MoreHorizontal width={14} height={14} />
                          </button>
                        </span>
                      </div>
                      {l.message && <blockquote>"{l.message.length > 80 ? `${l.message.slice(0, 80)}…` : l.message}"</blockquote>}
                      <div className="mail">
                        <Mail width={13} height={13} />{l.email}
                      </div>
                      <div className="ft">
                        <span className={`src ${sourceClass(l.reason)}`}>{l.reason || 'Contact form'}</span>
                        <time>
                          <Calendar width={12} height={12} />{shortDate(l.created_at)}
                        </time>
                      </div>
                    </div>
                  ))
                )}
              </div>
            ))}
          </div>
        )}

        {!loading && !err && view === 'list' && (
          <div className="tbl r" style={{ ['--i' as string]: 4, marginTop: 14 }}>
            {filtered.length === 0 ? (
              <div className="px-6 py-16 text-center text-[14px]" style={{ color: 'var(--taupe)' }}>
                {leads.length === 0 ? 'No enquiries yet.' : 'Nothing matches that search.'}
              </div>
            ) : (
              filtered.map((l, i) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => setOpen(l)}
                  className="tr"
                  style={{ gridTemplateColumns: '32px minmax(0,1.6fr) minmax(0,2fr) 120px 90px', width: '100%', cursor: 'pointer', textAlign: 'left' }}
                >
                  <div className={`av s ${['', 't2', 't3', 't4', 'l'][i % 5]}`}>{l.name?.slice(0, 1).toUpperCase() || '?'}</div>
                  <div className="mem"><span className="nm">{l.name}</span></div>
                  <span className="em">{l.message}</span>
                  <span className={`src ${sourceClass(l.reason)}`}>{l.reason || 'Contact'}</span>
                  <span className="jn">{shortDate(l.created_at)}</span>
                </button>
              ))
            )}
          </div>
        )}
      </section>

      {/* ---------------- detail drawer ---------------- */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(null)}
              className="fixed inset-0 z-50 bg-black/25 backdrop-blur-[2px]"
            />
            <motion.aside
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="admin-x fixed right-0 top-0 z-50 flex h-full w-full max-w-[480px] flex-col bg-white shadow-2xl"
              style={{ fontFamily: 'var(--body)' }}
            >
              <div className="flex items-start gap-4 px-6 py-5" style={{ borderBottom: '1px solid var(--stone-2)' }}>
                <span className="av" style={{ width: 44, height: 44, fontSize: 15 }}>{open.name?.slice(0, 1).toUpperCase() || '?'}</span>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate font-display text-[19px]" style={{ color: 'var(--char)' }}>{open.name}</h2>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[12px]" style={{ color: 'var(--taupe-2)' }}>
                    <Clock className="h-3 w-3" /> {full(open.created_at)}
                  </p>
                </div>
                <button type="button" onClick={() => setOpen(null)} className="ico-btn"><X width={16} height={16} /></button>
              </div>

              <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
                <div>
                  <p className="kicker">Status</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {STATUSES.map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => changeStatus(open, s.value)}
                        className="pill"
                        style={open.status === s.value ? { background: 'var(--char)', color: '#fff', boxShadow: 'none' } : undefined}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-2.5">
                  <a href={`mailto:${open.email}?subject=${encodeURIComponent('Re: your ThinkDecor enquiry')}`} className="field" style={{ height: 44 }}>
                    <Mail width={15} height={15} style={{ color: 'var(--brass)' }} />
                    <span className="min-w-0 flex-1 truncate" style={{ color: 'var(--ink)' }}>{open.email}</span>
                  </a>
                  {open.phone && (
                    <a href={`tel:${open.phone}`} className="field" style={{ height: 44 }}>
                      <Phone width={15} height={15} style={{ color: 'var(--brass)' }} />
                      <span style={{ color: 'var(--ink)' }}>{open.phone}</span>
                    </a>
                  )}
                </div>

                <div>
                  <p className="kicker">Details</p>
                  <dl className="mt-3 grid grid-cols-2 gap-2.5">
                    {[
                      { icon: Building2, label: 'Company', value: open.company },
                      { icon: Users, label: 'Team size', value: open.company_size },
                      { icon: Tag, label: 'Industry', value: open.industry },
                      { icon: Globe, label: 'Region', value: open.region },
                      { icon: Inbox, label: 'Reason', value: open.reason },
                    ].filter((r) => r.value).map((r) => {
                      const Icon = r.icon;
                      return (
                        <div key={r.label} className="box" style={{ padding: '10px 14px' }}>
                          <dt className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em]" style={{ color: 'var(--taupe-2)' }}>
                            <Icon className="h-3 w-3" /> {r.label}
                          </dt>
                          <dd className="mt-1 text-[13.5px]" style={{ color: 'var(--ink)' }}>{r.value}</dd>
                        </div>
                      );
                    })}
                  </dl>
                </div>

                <div>
                  <p className="kicker">Message</p>
                  <p className="mt-3 whitespace-pre-line rounded-xl px-4 py-4 text-[14px] leading-relaxed" style={{ boxShadow: 'inset 0 0 0 1px var(--stone-2)', color: 'var(--ink)' }}>
                    {open.message}
                  </p>
                </div>

                <div>
                  <p className="flex items-center gap-1.5 kicker"><StickyNote className="h-3 w-3" /> Internal note</p>
                  <textarea
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    rows={4}
                    placeholder="Only your team sees this."
                    className="mt-3 w-full resize-none rounded-xl px-4 py-3 text-[13.5px] leading-relaxed outline-none"
                    style={{ boxShadow: 'inset 0 0 0 1px var(--stone)', color: 'var(--ink)' }}
                  />
                  <Button onClick={saveNote} disabled={savingNote || noteDraft === (open.notes ?? '')} variant="hero" className="mt-2.5 h-auto rounded-full px-5 py-2.5 text-[13px]">
                    {savingNote ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />} Save note
                  </Button>
                </div>
              </div>

              <div className="px-6 py-4" style={{ borderTop: '1px solid var(--stone-2)' }}>
                <button type="button" onClick={() => setConfirm(open)} className="flex items-center gap-2 text-[13px]" style={{ color: 'var(--taupe)' }}>
                  <Trash2 className="h-3.5 w-3.5" /> Delete this lead
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 px-6 backdrop-blur-sm"
            onClick={() => setConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.97, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="admin-x w-full max-w-[400px] rounded-2xl bg-white p-7 shadow-2xl"
            >
              <h3 className="font-display text-[20px]" style={{ color: 'var(--char)' }}>Delete this lead?</h3>
              <p className="mt-2.5 text-[14px] leading-relaxed" style={{ color: 'var(--taupe)' }}>
                {confirm.name}'s enquiry will be removed permanently. Export first if you need a record.
              </p>
              <div className="mt-7 flex gap-3">
                <button type="button" onClick={() => setConfirm(null)} className="btn btn-line flex-1 justify-center">Cancel</button>
                <button type="button" onClick={() => remove(confirm)} className="btn flex-1 justify-center" style={{ background: 'var(--rose)', color: '#fff' }}>
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminShell>
  );
}
