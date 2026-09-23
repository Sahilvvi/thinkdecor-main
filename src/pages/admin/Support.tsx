import { useEffect, useMemo, useState } from 'react';
import { toast } from 'sonner';
import { Download, MessageSquare, Check, Bookmark, Send } from 'lucide-react';
import { SEO } from '@/components/shared/SEO';
import { AdminShell } from '@/components/admin/AdminShell';
import { Seg } from '@/components/admin/Seg';
import { CountUp } from '@/components/admin/CountUp';
import {
  useAllTickets, useReplyToTicket, useSetTicketStatus, useTicketsRealtime,
  type SupportTicket, type TicketStatus,
} from '@/lib/support';

const STATUSES: { value: TicketStatus; label: string }[] = [
  { value: 'open', label: 'Open' },
  { value: 'answered', label: 'Answered' },
  { value: 'resolved', label: 'Resolved' },
];

function full(iso: string) {
  return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}
function time(iso: string) {
  return new Date(iso).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
}
function dateGroup(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase();
}

function exportCsv(tickets: SupportTicket[]) {
  const header = ['Subject', 'Status', 'Message', 'Reply', 'Created'];
  const rows = tickets.map((t) => [t.subject, t.status, t.message, t.admin_reply ?? '', t.created_at]);
  const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'thinkdecor-support.csv'; a.click();
  URL.revokeObjectURL(url);
}

/** One-click starting points for common replies. They drop into the composer, so they're edited before sending. */
const SAVED_REPLIES = [
  { label: 'Thanks — looking into it', text: "Thanks for getting in touch — I'm looking into this now and will come back to you shortly." },
  { label: 'Generation failed (credit refunded)', text: "Sorry about that. When a design fails we automatically refund the credit, so you haven't lost anything. Please try again, ideally with a straight-on, well-lit photo — and if it fails again, let us know and we'll dig in." },
  { label: 'How credits work', text: 'Every account starts with free redesigns, and each design or regeneration uses one credit. Subscribers get a fresh batch of credits every month. You can see your balance in the sidebar and under Settings → Plan & billing.' },
  { label: 'How to cancel', text: 'You can cancel any time from Settings → Plan & billing → Manage billing. Your plan stays active until the end of the period you have already paid for.' },
  { label: 'Cleanup / Replace tips', text: 'For the best result, paint just the object you want to change (a little beyond its edges), and describe the replacement in a few words, for example "a low grey linen sofa". Painting a smaller area usually gives a cleaner edit.' },
  { label: 'Resolved — anything else?', text: "Glad we could get that sorted. I'll mark this as resolved — just reply here if anything else comes up." },
];

export default function Support() {
  useTicketsRealtime();
  const { data: tickets, isLoading, error } = useAllTickets();
  const reply = useReplyToTicket();
  const setStatus = useSetTicketStatus();

  const [tab, setTab] = useState<'all' | TicketStatus>('all');
  const [q, setQ] = useState(() => (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('q') ?? '' : ''));
  const [openId, setOpenId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [savedOpen, setSavedOpen] = useState(false);

  const counts = useMemo(() => {
    const c: Record<string, number> = { all: tickets?.length ?? 0 };
    STATUSES.forEach((s) => { c[s.value] = (tickets ?? []).filter((t) => t.status === s.value).length; });
    return c;
  }, [tickets]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (tickets ?? []).filter((t) => {
      if (tab !== 'all' && t.status !== tab) return false;
      if (!term) return true;
      return [t.subject, t.message].some((v) => v.toLowerCase().includes(term));
    });
  }, [tickets, tab, q]);

  const open = (tickets ?? []).find((t) => t.id === openId) ?? filtered[0] ?? null;

  useEffect(() => {
    if (!openId && filtered[0]) setOpenId(filtered[0].id);
  }, [filtered, openId]);

  useEffect(() => { setDraft(''); }, [openId]);

  const send = async () => {
    if (!open || !draft.trim()) return;
    try {
      await reply.mutateAsync({ id: open.id, reply: draft.trim(), status: 'answered' });
      toast.success('Reply saved');
      setDraft('');
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  const resolve = async () => {
    if (!open) return;
    try {
      await setStatus.mutateAsync({ id: open.id, status: 'resolved' });
      toast.success('Marked resolved');
    } catch (e) {
      toast.error((e as Error).message);
    }
  };

  // group by day, newest first, matching the reference's grouped inbox
  const groups = useMemo(() => {
    const map = new Map<string, SupportTicket[]>();
    filtered.forEach((t) => {
      const key = dateGroup(t.created_at);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    });
    return Array.from(map.entries());
  }, [filtered]);

  const openCount = counts.open ?? 0;

  return (
    <AdminShell>
      <SEO title="Support · Admin" description="Customer queries raised from the dashboard." />

      <section className="panel">
        <div className="ph">
          <div className="r">
            <div className="kicker">People · Customer care</div>
            <h1>Support <em>inbox</em></h1>
            <p className="sub">
              <span className="pulse" style={{ marginRight: 2 }} />
              {tickets?.length ?? 0} conversations<span className="sep" />{openCount} waiting on you<span className="sep" />New tickets arrive in real time
            </p>
          </div>
          <div className="actions r" style={{ ['--i' as string]: 1 }}>
            <button type="button" className="btn btn-line" onClick={() => exportCsv(filtered)} disabled={!filtered.length}>
              <Download width={15} height={15} /> Export
            </button>
          </div>
        </div>

        {!isLoading && error && (
          <div className="mt-8 rounded-2xl px-6 py-10 text-center" style={{ boxShadow: 'inset 0 0 0 1px var(--stone-2)' }}>
            <p className="text-[14.5px]" style={{ color: 'var(--taupe)' }}>
              Couldn't load queries. Run the <code>admin_panel</code> migration in Supabase.
            </p>
          </div>
        )}

        {tickets && (
          <>
            <div className="strip r" style={{ ['--i' as string]: 2 }}>
              <div className="sc">
                <div>
                  <div className="lab">Open tickets</div>
                  <div className="v"><CountUp value={openCount} /></div>
                  <div className="n">{openCount ? 'Needs a reply' : "Nothing waiting. You're all caught up."}</div>
                </div>
                <div className="zero-ic"><Check width={22} height={22} /></div>
              </div>
              <div className="sc">
                <div className="lab">Total</div>
                <div className="v">{tickets.length}<small>tickets</small></div>
                <div className="n">All-time</div>
              </div>
              <div className="sc">
                <div className="lab">Answered</div>
                <div className="v">{counts.answered}<small>of {tickets.length}</small></div>
                <div className="n">Awaiting the user</div>
              </div>
              <div className="sc">
                <div className="lab">Resolved</div>
                <div className="v">{counts.resolved}<small>of {tickets.length}</small></div>
                <div className="n">Mark answered ones resolved</div>
              </div>
            </div>

            <div className="toolbar r" style={{ ['--i' as string]: 3 }}>
              <Seg<'all' | TicketStatus>
                layoutId="support-filter"
                value={tab}
                onChange={setTab}
                options={[{ value: 'all', label: 'All', count: counts.all }, ...STATUSES.map((s) => ({ ...s, count: counts[s.value] }))]}
              />
              <span className="spacer" />
              <div className="field" style={{ width: 260 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search tickets…" />
              </div>
            </div>

            <div className="inbox">
              <div className="list-col">
                {groups.length === 0 && (
                  <div className="empty-note">
                    <div className="c"><MessageSquare width={18} height={18} /></div>
                    <div><b>Nothing here.</b>New tickets from the app land here.</div>
                  </div>
                )}
                {groups.map(([day, rows], gi) => (
                  <div key={day}>
                    <div className="grp r" style={{ ['--i' as string]: gi + 4 }}>{day}</div>
                    {rows.map((t, i) => (
                      <article key={t.id} className={`tk r${t.id === open?.id ? ' sel' : ''}`} style={{ ['--i' as string]: gi + i + 5 }}>
                        <button type="button" onClick={() => setOpenId(t.id)} style={{ display: 'contents', textAlign: 'left' }}>
                          <div className={`av s${t.status !== 'open' ? ' l' : ''}`} style={{ display: 'grid', placeItems: 'center' }}>
                            <MessageSquare width={14} height={14} />
                          </div>
                          <div>
                            <h4>{t.subject} <span className={`chip ${t.status === 'answered' ? 'am' : t.status === 'resolved' ? 'live' : 'new'}`}>{t.status}</span></h4>
                            <p>{t.message}</p>
                          </div>
                          <time><b>{time(t.created_at)}</b>{new Date(t.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</time>
                        </button>
                      </article>
                    ))}
                  </div>
                ))}
                {groups.length > 0 && (
                  <div className="empty-note r" style={{ ['--i' as string]: 10 }}>
                    <div className="c"><Check width={18} height={18} /></div>
                    <div><b>That's everything.</b>New tickets from the app land here.</div>
                  </div>
                )}
              </div>

              {open && (
                <aside className="det r" style={{ ['--i' as string]: 6 }}>
                  <div className="dh">
                    <div className="row">
                      <span className="kicker">Ticket</span>
                      <span className={`status ${open.status}`}>
                        <i />
                        {open.status === 'open' ? 'Open' : open.status === 'answered' ? 'Answered' : 'Resolved'}
                      </span>
                    </div>
                    <h2>{open.subject}</h2>
                    <div className="meta">
                      <span><Clock14 /> Opened <b>{full(open.created_at)}</b></span>
                    </div>
                  </div>

                  <div className="thread">
                    <div className="msg in">
                      <div className="av s l">U</div>
                      <div className="bub">
                        <small>Customer · {time(open.created_at)}</small>
                        {open.message}
                      </div>
                    </div>
                    {open.admin_reply && (
                      <>
                        <span className="ev"><Check width={12} height={12} /> Marked as {open.status}</span>
                        <div className="msg out">
                          <div className="av s">A</div>
                          <div className="bub">
                            <small>You · Admin</small>
                            {open.admin_reply}
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  <div className="comp">
                    <textarea
                      value={draft}
                      onChange={(e) => setDraft(e.target.value)}
                      rows={2}
                      placeholder="Write a reply…"
                    />
                    <div className="bar">
                      <div style={{ position: 'relative' }}>
                        <button
                          type="button"
                          className="ico-btn"
                          title="Saved replies"
                          aria-label="Saved replies"
                          aria-expanded={savedOpen}
                          onClick={() => setSavedOpen((o) => !o)}
                        >
                          <Bookmark width={16} height={16} />
                        </button>
                        {savedOpen && (
                          <div className="bell-pop" role="menu" style={{ left: 0, right: 'auto', top: 'auto', bottom: 'calc(100% + 8px)', width: 'min(340px, 80vw)' }}>
                            <div className="sgroup">Saved replies</div>
                            {SAVED_REPLIES.map((r) => (
                              <button
                                key={r.label}
                                type="button"
                                role="menuitem"
                                className="sitem"
                                onClick={() => { setDraft((d) => (d.trim() ? `${d.trim()}\n\n${r.text}` : r.text)); setSavedOpen(false); }}
                              >
                                <span className="st"><b>{r.label}</b><small>{r.text}</small></span>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                      <span className="spacer" />
                      {open.status !== 'resolved' && (
                        <button type="button" className="btn btn-line btn-sm" onClick={resolve} disabled={setStatus.isPending}>Mark resolved</button>
                      )}
                      <button type="button" className="btn btn-dark btn-sm" onClick={send} disabled={reply.isPending || !draft.trim()}>
                        Send <Send width={13} height={13} />
                      </button>
                    </div>
                  </div>
                </aside>
              )}
            </div>
          </>
        )}
      </section>
    </AdminShell>
  );
}

function Clock14() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
    </svg>
  );
}
