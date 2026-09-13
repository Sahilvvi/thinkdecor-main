import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, Download, Trash2, Loader2, Inbox, Mail, Phone, Building2,
  Globe, Users, Tag, X, Clock, StickyNote, Check,
} from 'lucide-react';
import { SEO } from '@/components/shared/SEO';
import { AdminShell } from '@/components/admin/AdminShell';
import {
  listLeads, setLeadStatus, setLeadNotes, deleteLead, downloadCsv,
  STATUSES, type Lead, type LeadStatus,
} from '@/lib/leads';

const STATUS_STYLE: Record<LeadStatus, string> = {
  new: 'bg-primary/12 text-primary',
  contacted: 'bg-amber-500/14 text-amber-700',
  qualified: 'bg-emerald-500/14 text-emerald-700',
  closed: 'bg-foreground/[0.06] text-foreground/45',
};

function when(iso: string) {
  const d = new Date(iso);
  const mins = Math.round((Date.now() - d.getTime()) / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (mins < 1440) return `${Math.round(mins / 60)}h ago`;
  if (mins < 10080) return `${Math.round(mins / 1440)}d ago`;
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

function full(iso: string) {
  return new Date(iso).toLocaleString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}

export default function Leads() {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [q, setQ] = useState('');
  const [tab, setTab] = useState<'all' | LeadStatus>('all');
  const [open, setOpen] = useState<Lead | null>(null);
  const [confirm, setConfirm] = useState<Lead | null>(null);
  const [noteDraft, setNoteDraft] = useState('');
  const [savingNote, setSavingNote] = useState(false);

  const load = () => {
    return listLeads()
      .then((r) => { setLeads(r); setErr(null); })
      .catch((e: Error) => setErr(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  useEffect(() => { setNoteDraft(open?.notes ?? ''); }, [open]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: leads.length };
    STATUSES.forEach((s) => { c[s.value] = leads.filter((l) => l.status === s.value).length; });
    return c;
  }, [leads]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return leads.filter((l) => {
      if (tab !== 'all' && l.status !== tab) return false;
      if (!term) return true;
      return [l.name, l.email, l.company, l.message, l.reason, l.industry, l.region]
        .filter(Boolean)
        .some((v) => (v as string).toLowerCase().includes(term));
    });
  }, [leads, q, tab]);

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

  return (
    <AdminShell>
      <SEO title="Leads · ThinkDecor" description="Contact form submissions." />

      <main className="container mx-auto max-w-[1180px] px-6 py-10">
        {/* heading */}
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="text-[28px] font-bold tracking-[-0.02em] text-foreground">Leads</h1>
            <p className="mt-1.5 text-[13.5px] text-foreground/50">
              {leads.length} total · {counts.new ?? 0} unread
            </p>
          </div>
          <button
            onClick={() => downloadCsv(filtered)}
            disabled={!filtered.length}
            className="flex items-center gap-2 rounded-full border border-foreground/[0.12] px-5 py-2.5 text-[13.5px] font-medium text-foreground/70 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:text-primary disabled:opacity-40 disabled:hover:translate-y-0"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>

        {/* filters */}
        <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-3 rounded-xl border border-foreground/[0.10] bg-foreground/[0.025] px-4 py-3">
            <Search className="h-4 w-4 flex-shrink-0 text-foreground/42" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search name, email, company, message…"
              className="flex-1 bg-transparent text-[14px] text-foreground outline-none placeholder:text-foreground/38"
            />
          </div>
          <div className="flex flex-wrap items-center gap-1 rounded-xl border border-foreground/[0.09] bg-foreground/[0.025] p-1">
            {[{ value: 'all' as const, label: 'All' }, ...STATUSES].map((s) => {
              const active = tab === s.value;
              return (
                <button
                  key={s.value}
                  onClick={() => setTab(s.value)}
                  className={`relative rounded-lg px-3 py-1.5 text-[12.5px] font-medium transition-colors duration-300 ${
                    active ? 'text-primary-foreground' : 'text-foreground/55 hover:text-foreground'
                  }`}
                >
                  {active && (
                    <motion.span
                      layoutId="lead-tab-pill"
                      className="absolute inset-0 rounded-lg bg-primary"
                      transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                    />
                  )}
                  <span className="relative z-10">
                    {s.label}
                    <span className={`ml-1.5 ${active ? 'text-primary-foreground/65' : 'text-foreground/35'}`}>
                      {counts[s.value] ?? 0}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* list */}
        <div className="mt-6 overflow-hidden rounded-2xl border border-foreground/[0.09]">
          {loading && (
            <div className="flex items-center justify-center gap-3 py-20 text-foreground/50">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading leads…
            </div>
          )}

          {!loading && err && (
            <div className="px-6 py-16 text-center">
              <Inbox className="mx-auto h-8 w-8 text-foreground/25" />
              <p className="mt-4 text-[15px] font-medium text-foreground">Couldn't load leads</p>
              <p className="mx-auto mt-2 max-w-[48ch] text-[13.5px] leading-relaxed text-foreground/55">
                If this is a fresh setup, run the
                <code className="mx-1.5 rounded bg-foreground/[0.05] px-1.5 py-0.5 text-[12.5px] text-primary">contact_leads_admin</code>
                migration in Supabase so the panel is allowed to read submissions.
              </p>
              <p className="mt-3 text-[12px] text-foreground/38">{err}</p>
            </div>
          )}

          {!loading && !err && filtered.length === 0 && (
            <div className="px-6 py-20 text-center">
              <Inbox className="mx-auto h-8 w-8 text-foreground/25" />
              <p className="mt-4 text-[15px] text-foreground/58">
                {leads.length === 0 ? 'No enquiries yet.' : 'Nothing matches those filters.'}
              </p>
            </div>
          )}

          {!loading && !err && filtered.map((l, i) => (
            <motion.button
              key={l.id}
              onClick={() => setOpen(l)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.025, 0.4) }}
              className="group flex w-full items-center gap-4 border-b border-foreground/[0.07] bg-card px-5 py-4 text-left transition-colors last:border-0 hover:bg-foreground/[0.025]"
            >
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/[0.10] text-[13px] font-bold text-primary">
                {l.name?.slice(0, 1).toUpperCase() || '?'}
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2.5">
                  <span className="truncate text-[14.5px] font-medium text-foreground">{l.name}</span>
                  <span className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider ${STATUS_STYLE[l.status]}`}>
                    {l.status}
                  </span>
                  {l.reason && (
                    <span className="hidden flex-shrink-0 rounded-full bg-foreground/[0.05] px-2.5 py-0.5 text-[10.5px] text-foreground/50 md:block">
                      {l.reason}
                    </span>
                  )}
                </span>
                <span className="mt-1 block truncate text-[12.5px] text-foreground/45">
                  {l.email}
                  {l.company && <span className="text-foreground/28"> · {l.company}</span>}
                </span>
                <span className="mt-1 block truncate text-[12.5px] text-foreground/38 sm:hidden">
                  {l.message}
                </span>
              </span>

              <span className="hidden min-w-0 flex-1 truncate text-[13px] text-foreground/45 sm:block">
                {l.message}
              </span>

              <span className="flex flex-shrink-0 items-center gap-3">
                <span className="whitespace-nowrap text-[12px] text-foreground/38">{when(l.created_at)}</span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => { e.stopPropagation(); setConfirm(l); }}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.stopPropagation(); setConfirm(l); } }}
                  className="rounded-lg border border-foreground/[0.10] p-2 text-foreground/45 opacity-0 transition-all duration-300 hover:border-destructive/50 hover:text-destructive group-hover:opacity-100"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </span>
              </span>
            </motion.button>
          ))}
        </div>
      </main>

      {/* ---------------- detail drawer ---------------- */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setOpen(null)}
              className="fixed inset-0 z-50 bg-foreground/25 backdrop-blur-[2px]"
            />
            <motion.aside
              initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 320, damping: 34 }}
              className="fixed right-0 top-0 z-50 flex h-full w-full max-w-[520px] flex-col border-l border-foreground/[0.09] bg-background shadow-2xl"
            >
              <div className="flex items-start gap-4 border-b border-foreground/[0.08] px-6 py-5">
                <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-primary/[0.10] text-[15px] font-bold text-primary">
                  {open.name?.slice(0, 1).toUpperCase() || '?'}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-[18px] font-bold tracking-[-0.02em] text-foreground">{open.name}</h2>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-foreground/45">
                    <Clock className="h-3 w-3" /> {full(open.created_at)}
                  </p>
                </div>
                <button
                  onClick={() => setOpen(null)}
                  className="rounded-lg border border-foreground/[0.10] p-2 text-foreground/50 transition-colors hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 space-y-7 overflow-y-auto px-6 py-6">
                {/* status */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/45">Status</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {STATUSES.map((s) => {
                      const active = open.status === s.value;
                      return (
                        <button
                          key={s.value}
                          onClick={() => changeStatus(open, s.value)}
                          className={`rounded-full px-3.5 py-1.5 text-[12.5px] font-medium transition-all duration-300 ${
                            active
                              ? 'bg-primary text-primary-foreground'
                              : 'border border-foreground/[0.12] text-foreground/55 hover:border-primary/35 hover:text-primary'
                          }`}
                        >
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* contact actions */}
                <div className="grid gap-2.5">
                  <a
                    href={`mailto:${open.email}?subject=${encodeURIComponent('Re: your ThinkDecor enquiry')}`}
                    className="group flex items-center gap-3 rounded-xl border border-foreground/[0.10] bg-card px-4 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30"
                  >
                    <Mail className="h-4 w-4 flex-shrink-0 text-primary" />
                    <span className="min-w-0 flex-1 truncate text-[13.5px] text-foreground">{open.email}</span>
                    <span className="text-[11.5px] font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">Reply</span>
                  </a>
                  {open.phone && (
                    <a
                      href={`tel:${open.phone}`}
                      className="group flex items-center gap-3 rounded-xl border border-foreground/[0.10] bg-card px-4 py-3 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30"
                    >
                      <Phone className="h-4 w-4 flex-shrink-0 text-primary" />
                      <span className="min-w-0 flex-1 truncate text-[13.5px] text-foreground">{open.phone}</span>
                      <span className="text-[11.5px] font-medium text-primary opacity-0 transition-opacity group-hover:opacity-100">Call</span>
                    </a>
                  )}
                </div>

                {/* attributes */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/45">Details</p>
                  <dl className="mt-3 grid grid-cols-2 gap-2.5">
                    {[
                      { icon: Building2, label: 'Company', value: open.company },
                      { icon: Users, label: 'Team size', value: open.company_size },
                      { icon: Tag, label: 'Industry', value: open.industry },
                      { icon: Globe, label: 'Region', value: open.region },
                      { icon: Inbox, label: 'Reason', value: open.reason },
                    ]
                      .filter((r) => r.value)
                      .map((r) => {
                        const Icon = r.icon;
                        return (
                          <div key={r.label} className="rounded-xl border border-foreground/[0.08] bg-card px-4 py-3">
                            <dt className="flex items-center gap-1.5 text-[10.5px] font-semibold uppercase tracking-[0.12em] text-foreground/40">
                              <Icon className="h-3 w-3" /> {r.label}
                            </dt>
                            <dd className="mt-1 text-[13.5px] text-foreground">{r.value}</dd>
                          </div>
                        );
                      })}
                  </dl>
                </div>

                {/* message */}
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/45">Message</p>
                  <p className="mt-3 whitespace-pre-line rounded-xl border border-foreground/[0.08] bg-card px-4 py-4 text-[14px] leading-relaxed text-foreground/75">
                    {open.message}
                  </p>
                </div>

                {/* internal note */}
                <div>
                  <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/45">
                    <StickyNote className="h-3 w-3" /> Internal note
                  </p>
                  <textarea
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                    rows={4}
                    placeholder="Only your team sees this."
                    className="mt-3 w-full resize-none rounded-xl border border-foreground/[0.12] bg-card px-4 py-3 text-[13.5px] leading-relaxed text-foreground outline-none transition-all duration-300 placeholder:text-foreground/35 focus:border-primary/45 focus:ring-4 focus:ring-primary/[0.09]"
                  />
                  <button
                    onClick={saveNote}
                    disabled={savingNote || noteDraft === (open.notes ?? '')}
                    className="mt-2.5 flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[13px] font-semibold text-primary-foreground transition-transform duration-300 hover:scale-[1.03] disabled:opacity-40 disabled:hover:scale-100"
                  >
                    {savingNote ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                    Save note
                  </button>
                </div>
              </div>

              <div className="border-t border-foreground/[0.08] px-6 py-4">
                <button
                  onClick={() => setConfirm(open)}
                  className="flex items-center gap-2 text-[13px] text-foreground/50 transition-colors hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" /> Delete this lead
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ---------------- delete confirm ---------------- */}
      <AnimatePresence>
        {confirm && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-foreground/35 px-6 backdrop-blur-sm"
            onClick={() => setConfirm(null)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.97, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-[400px] rounded-2xl border border-foreground/[0.10] bg-background p-7 shadow-2xl"
            >
              <h3 className="text-[17px] font-bold tracking-[-0.02em] text-foreground">Delete this lead?</h3>
              <p className="mt-2.5 text-[14px] leading-relaxed text-foreground/58">
                {confirm.name}'s enquiry will be removed permanently. Export first if you need a record.
              </p>
              <div className="mt-7 flex gap-3">
                <button
                  onClick={() => setConfirm(null)}
                  className="flex-1 rounded-full border border-foreground/[0.14] py-3 text-[13.5px] font-medium text-foreground/70 transition-colors hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={() => remove(confirm)}
                  className="flex-1 rounded-full bg-destructive py-3 text-[13.5px] font-semibold text-destructive-foreground transition-transform duration-300 hover:scale-[1.02]"
                >
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
