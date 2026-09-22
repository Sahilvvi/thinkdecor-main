import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Inbox, Loader2, X, Clock, Check, MessageSquare } from 'lucide-react';
import { SEO } from '@/components/shared/SEO';
import { AdminShell } from '@/components/admin/AdminShell';
import { Reveal } from '@/components/premium/Motion';
import { Button } from '@/components/ui/button';
import {
  useAllTickets, useReplyToTicket, useSetTicketStatus, useTicketsRealtime,
  type SupportTicket, type TicketStatus,
} from '@/lib/support';

const STATUSES: { value: TicketStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'answered', label: 'Answered' },
  { value: 'resolved', label: 'Resolved' },
];

const STATUS_STYLE: Record<TicketStatus, string> = {
  open: 'bg-primary/12 text-primary',
  answered: 'bg-amber-500/14 text-amber-700',
  resolved: 'bg-foreground/[0.06] text-foreground/45',
};

function full(iso: string) {
  return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function Support() {
  useTicketsRealtime();
  const { data: tickets, isLoading, error } = useAllTickets();
  const reply = useReplyToTicket();
  const setStatus = useSetTicketStatus();

  const [tab, setTab] = useState<'all' | TicketStatus>('all');
  const [open, setOpen] = useState<SupportTicket | null>(null);
  const [draft, setDraft] = useState('');

  useEffect(() => { setDraft(open?.admin_reply ?? ''); }, [open]);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: tickets?.length ?? 0 };
    STATUSES.forEach((s) => { c[s.value] = (tickets ?? []).filter((t) => t.status === s.value).length; });
    return c;
  }, [tickets]);

  const filtered = useMemo(
    () => (tickets ?? []).filter((t) => tab === 'all' || t.status === tab),
    [tickets, tab],
  );

  const send = async () => {
    if (!open || !draft.trim()) return;
    try {
      await reply.mutateAsync({ id: open.id, reply: draft.trim(), status: 'answered' });
      setOpen((o) => (o ? { ...o, admin_reply: draft.trim(), status: 'answered' } : o));
      toast.success('Reply saved');
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const resolve = async () => {
    if (!open) return;
    try {
      await setStatus.mutateAsync({ id: open.id, status: 'resolved' });
      setOpen((o) => (o ? { ...o, status: 'resolved' } : o));
      toast.success('Marked resolved');
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  return (
    <AdminShell>
      <SEO title="Support · Admin" description="Customer queries raised from the dashboard." />

      <main className="container mx-auto max-w-[1180px] px-6 py-10">
        <Reveal>
          <h1 className="font-display text-[34px] font-normal tracking-[-0.01em] text-foreground">Support</h1>
          <p className="mt-1.5 text-[13.5px] text-foreground/50">
            {counts.all} total · {counts.open ?? 0} open
          </p>
        </Reveal>

        <Reveal delay={0.08} className="mt-7 flex flex-wrap items-center gap-1 rounded-xl border border-foreground/[0.09] bg-foreground/[0.025] p-1">
          {[{ value: 'all' as const, label: 'All' }, ...STATUSES].map((s) => {
            const active = tab === s.value;
            return (
              <button
                key={s.value}
                onClick={() => setTab(s.value)}
                className={`relative rounded-lg px-3.5 py-1.5 text-[12.5px] font-medium transition-colors duration-300 ${
                  active ? 'text-primary-foreground' : 'text-foreground/55 hover:text-foreground'
                }`}
              >
                {active && (
                  <motion.span
                    layoutId="support-tab-pill"
                    className="absolute inset-0 rounded-lg bg-primary"
                    transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                  />
                )}
                <span className="relative z-10">
                  {s.label} <span className={active ? 'text-primary-foreground/65' : 'text-foreground/35'}>{counts[s.value] ?? 0}</span>
                </span>
              </button>
            );
          })}
        </Reveal>

        <div className="mt-6 overflow-hidden rounded-2xl border border-foreground/[0.09]">
          {isLoading && (
            <div className="flex items-center justify-center gap-3 py-20 text-foreground/50">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading queries…
            </div>
          )}

          {!isLoading && error && (
            <div className="px-6 py-16 text-center">
              <Inbox className="mx-auto h-8 w-8 text-foreground/25" />
              <p className="mt-4 text-[15px] font-medium text-foreground">Couldn't load queries</p>
              <p className="mx-auto mt-2 max-w-[48ch] text-[13.5px] leading-relaxed text-foreground/55">
                Run the <code className="mx-1 rounded bg-foreground/[0.05] px-1.5 py-0.5 text-primary">admin_panel</code> migration in Supabase so this inbox can read tickets.
              </p>
            </div>
          )}

          {!isLoading && !error && filtered.length === 0 && (
            <div className="px-6 py-20 text-center">
              <Inbox className="mx-auto h-8 w-8 text-foreground/25" />
              <p className="mt-4 text-[15px] text-foreground/58">Nothing here.</p>
            </div>
          )}

          {!isLoading && !error && filtered.map((t, i) => (
            <motion.button
              key={t.id}
              onClick={() => setOpen(t)}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.025, 0.4) }}
              className="group flex w-full items-center gap-4 border-b border-foreground/[0.07] bg-card px-5 py-4 text-left transition-colors last:border-0 hover:bg-foreground/[0.025]"
            >
              <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/[0.10] text-primary transition-transform duration-300 group-hover:scale-110">
                <MessageSquare className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-2.5">
                  <span className="truncate text-[14px] font-medium text-foreground">{t.subject}</span>
                  <span className={`flex-shrink-0 rounded-full px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider ${STATUS_STYLE[t.status]}`}>
                    {t.status}
                  </span>
                </span>
                <span className="mt-1 block truncate text-[12.5px] text-foreground/45">{t.message}</span>
              </span>
              <span className="flex-shrink-0 text-[12px] text-foreground/38">{full(t.created_at)}</span>
            </motion.button>
          ))}
        </div>
      </main>

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
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-[17px] font-bold tracking-[-0.02em] text-foreground">{open.subject}</h2>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[12px] text-foreground/45">
                    <Clock className="h-3 w-3" /> {full(open.created_at)}
                  </p>
                </div>
                <button onClick={() => setOpen(null)} className="rounded-lg border border-foreground/[0.10] p-2 text-foreground/50 hover:text-foreground">
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="flex-1 space-y-7 overflow-y-auto px-6 py-6">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/45">Message</p>
                  <p className="mt-3 whitespace-pre-line rounded-xl border border-foreground/[0.08] bg-card px-4 py-4 text-[14px] leading-relaxed text-foreground/75">
                    {open.message}
                  </p>
                </div>

                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-foreground/45">Reply</p>
                  <textarea
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    rows={6}
                    placeholder="Write a reply the customer will see on their account…"
                    className="mt-3 w-full resize-none rounded-xl border border-foreground/[0.12] bg-card px-4 py-3 text-[13.5px] leading-relaxed text-foreground outline-none transition-all duration-300 placeholder:text-foreground/35 focus:border-primary/45 focus:ring-4 focus:ring-primary/[0.09]"
                  />
                  <div className="mt-3 flex gap-2.5">
                    <Button
                      onClick={send}
                      disabled={reply.isPending || !draft.trim()}
                      variant="hero"
                      className="h-auto rounded-full px-5 py-2.5 text-[13px] disabled:hover:scale-100"
                    >
                      {reply.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
                      Save reply
                    </Button>
                    {open.status !== 'resolved' && (
                      <button
                        onClick={resolve}
                        disabled={setStatus.isPending}
                        className="rounded-full border border-foreground/[0.14] px-5 py-2.5 text-[13px] font-medium text-foreground/70 transition-colors hover:text-foreground disabled:opacity-40"
                      >
                        Mark resolved
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </AdminShell>
  );
}
