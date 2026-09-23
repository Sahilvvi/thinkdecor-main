import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { AnimatePresence, motion } from 'framer-motion';
import { Download, UserPlus, ShieldCheck, ShieldOff, Ban, RotateCcw, Loader2 } from 'lucide-react';
import { SEO } from '@/components/shared/SEO';
import { AdminShell } from '@/components/admin/AdminShell';
import { Seg } from '@/components/admin/Seg';
import { CountUp } from '@/components/admin/CountUp';
import { useAdminUsers, useAdminUserAction, useInviteAdmin, type AdminUserRow } from '@/lib/admin';
import { useAuthStore } from '@/stores/authStore';

function when(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

/** Last 4 digits, everything else masked — same idea as the reference's "click to reveal". */
function maskPhone(phone: string | null) {
  if (!phone) return null;
  const digits = phone.replace(/\D/g, '');
  const last4 = digits.slice(-4);
  const cc = phone.trim().startsWith('+') ? phone.trim().split(/\s|\d{4,}$/)[0] : '';
  return `${cc ? `${cc} ` : ''}•••• ••${last4}`;
}

type Filter = 'all' | 'admins' | 'members' | 'suspended';

export default function Accounts() {
  const { data: users, isLoading, error } = useAdminUsers();
  const action = useAdminUserAction();
  const invite = useInviteAdmin();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');

  const sendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = inviteEmail.trim();
    if (!email) return;
    try {
      const res = await invite.mutateAsync(email);
      toast.success(res.status === 'promoted' ? `${email} is now an admin.` : `Invitation sent to ${email}.`);
      setInviteOpen(false);
      setInviteEmail('');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't add that admin.");
    }
  };
  const { user: me } = useAuthStore();
  const [q, setQ] = useState(() => (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('q') ?? '' : ''));
  const [filter, setFilter] = useState<Filter>('all');
  const [revealed, setRevealed] = useState<Set<string>>(new Set());
  const [confirm, setConfirm] = useState<{ user: AdminUserRow; kind: 'ban' | 'demote' } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const admins = users?.filter((u) => u.isAdmin).length ?? 0;
  const suspended = users?.filter((u) => u.bannedAt).length ?? 0;
  const paid = users?.filter((u) => u.plan !== 'free').length ?? 0;

  // Phone numbers that appear on more than one account — flagged the same way the reference calls out likely test sign-ups.
  const duplicatePhones = useMemo(() => {
    const counts = new Map<string, number>();
    (users ?? []).forEach((u) => {
      if (!u.phone) return;
      const key = u.phone.replace(/\D/g, '').slice(-4);
      if (key.length < 4) return;
      counts.set(key, (counts.get(key) ?? 0) + 1);
    });
    let top: [string, number] | null = null;
    counts.forEach((count, key) => { if (count > 1 && (!top || count > top[1])) top = [key, count]; });
    return top as [string, number] | null;
  }, [users]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (users ?? []).filter((u) => {
      if (filter === 'admins' && !u.isAdmin) return false;
      if (filter === 'members' && u.isAdmin) return false;
      if (filter === 'suspended' && !u.bannedAt) return false;
      if (!term) return true;
      return [u.email, u.name, u.phone].filter(Boolean).some((v) => (v as string).toLowerCase().includes(term));
    });
  }, [users, q, filter]);

  const run = async (u: AdminUserRow, act: 'promote' | 'demote' | 'ban' | 'unban') => {
    setBusyId(u.id);
    try {
      await action.mutateAsync({ action: act, userId: u.id });
      toast.success(
        act === 'promote' ? `${u.email} is now an admin`
          : act === 'demote' ? `${u.email} is no longer an admin`
            : act === 'ban' ? `${u.email} has been suspended`
              : `${u.email} has been restored`,
      );
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusyId(null);
      setConfirm(null);
    }
  };

  const avatarClass = (i: number) => ['', 't2', 't3', 't4', 'l'][i % 5];

  return (
    <AdminShell>
      <SEO title="Accounts · Admin" description="Manage customer and admin accounts." />

      <section className="panel">
        <div className="ph">
          <div className="r">
            <div className="kicker">People · Members</div>
            <h1>Accounts</h1>
            <p className="sub">
              {users?.length ?? 0} accounts<span className="sep" />{admins} admins<span className="sep" />{suspended} suspended
            </p>
          </div>
          <div className="actions r" style={{ ['--i' as string]: 1 }}>
            <button type="button" className="btn btn-line" onClick={() => exportCsv(filtered)} disabled={!filtered.length}>
              <Download width={15} height={15} /> Export
            </button>
            <button type="button" className="btn btn-dark" onClick={() => setInviteOpen(true)}>
              <UserPlus width={15} height={15} /> Invite admin
            </button>
          </div>
        </div>

        {!isLoading && error && (
          <div className="mt-8 rounded-2xl px-6 py-10 text-center" style={{ boxShadow: 'inset 0 0 0 1px var(--stone-2)' }}>
            <p className="text-[14.5px]" style={{ color: 'var(--taupe)' }}>
              Couldn't load accounts. Deploy the <code>admin-users</code> edge function and run the admin_panel migration.
            </p>
            <p className="mt-2 text-[12px]" style={{ color: 'var(--taupe-2)' }}>{(error as Error).message}</p>
          </div>
        )}

        {users && (
          <>
            <div className="stats">
              <div className="st graph r" style={{ ['--i' as string]: 2 }}>
                <div>
                  <div className="lab">Signups</div>
                  <div className="v"><CountUp value={users.length} /></div>
                  <div className="n">Every account, all-time</div>
                </div>
                <div>
                  <SignupHistogram users={users} />
                </div>
              </div>
              <div className="st r" style={{ ['--i' as string]: 3 }}>
                <div className="lab">Admins</div>
                <div className="v"><CountUp value={admins} /></div>
                <div className="n">{users.length - admins} regular members</div>
              </div>
              <div className="st r" style={{ ['--i' as string]: 4 }}>
                <div className="lab">On a paid plan</div>
                <div className="v"><CountUp value={paid} /></div>
                <div className="split"><b style={{ width: `${Math.max(1, (paid / Math.max(1, users.length)) * 100)}%` }} /></div>
                <div className="n" style={{ marginTop: 8 }}>{users.length ? `All ${users.length} on Free` : ''}</div>
              </div>
              <div className="st r" style={{ ['--i' as string]: 5 }}>
                <div className="lab">Suspended</div>
                <div className="v"><CountUp value={suspended} /></div>
                <div className="n">{suspended ? 'Access revoked' : 'No accounts restricted'}</div>
              </div>
            </div>

            {duplicatePhones && (
              <div className="notice r" style={{ ['--i' as string]: 6 }}>
                <div className="ic">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l10 18H2z" /><path d="M12 10v5M12 18v.5" /></svg>
                </div>
                <div>
                  <b>{duplicatePhones[1]} accounts share the same phone number</b> (ending {duplicatePhones[0]}). Likely test sign-ups.
                </div>
                <button type="button" className="btn btn-sm" onClick={() => setQ(duplicatePhones[0])}>Review duplicates</button>
              </div>
            )}

            <div className="toolbar r" style={{ ['--i' as string]: 7 }}>
              <Seg<Filter>
                layoutId="accounts-filter"
                value={filter}
                onChange={setFilter}
                options={[
                  { value: 'all', label: 'All', count: users.length },
                  { value: 'admins', label: 'Admins', count: admins },
                  { value: 'members', label: 'Members', count: users.length - admins },
                  { value: 'suspended', label: 'Suspended', count: suspended },
                ]}
              />
              <span className="spacer" />
              <div className="field" style={{ width: 280 }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="M20 20l-3.5-3.5" /></svg>
                <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, phone…" />
              </div>
            </div>

            <div className="tbl r" style={{ ['--i' as string]: 8 }}>
              <div className="th">
                <span />
                <span>MEMBER</span>
                <span>EMAIL</span>
                <span>PHONE</span>
                <span>PLAN</span>
                <span>JOINED</span>
                <span style={{ textAlign: 'right' }}>ACTIONS</span>
              </div>
              {filtered.map((u, i) => {
                const self = u.id === me?.id;
                const phoneRevealed = revealed.has(u.id);
                return (
                  <div key={u.id} className={`tr${self ? ' self' : ''}`}>
                    <span />
                    <div className="mem">
                      <div className={`av s ${avatarClass(i)}`}>{(u.name || u.email || '?').slice(0, 1).toUpperCase()}</div>
                      <span className={`nm${!u.name ? ' dim' : ''}`}>{u.name || 'No name'}</span>
                      {u.isAdmin && (
                        <span className="tg">
                          <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z" /></svg>
                          ADMIN
                        </span>
                      )}
                      {self && <span className="you">YOU</span>}
                    </div>
                    <span className="em">{u.email}</span>
                    {u.phone ? (
                      <button
                        type="button"
                        className="ph2"
                        onClick={() => setRevealed((s) => {
                          const n = new Set(s);
                          if (n.has(u.id)) n.delete(u.id); else n.add(u.id);
                          return n;
                        })}
                        title={phoneRevealed ? 'Click to hide' : 'Click to reveal'}
                      >
                        {phoneRevealed ? u.phone : maskPhone(u.phone)}
                      </button>
                    ) : (
                      <span className="ph2 none">—</span>
                    )}
                    <span><span className="plan">{u.plan}</span></span>
                    <span className="jn">{when(u.createdAt)}</span>
                    <div className="ra">
                      {busyId === u.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'var(--taupe)' }} />
                      ) : (
                        <>
                          <button
                            type="button"
                            className={`ico-btn${u.isAdmin ? ' is' : ''}`}
                            disabled={self}
                            title={u.isAdmin ? 'Remove admin access' : 'Make admin'}
                            onClick={() => (u.isAdmin ? setConfirm({ user: u, kind: 'demote' }) : run(u, 'promote'))}
                          >
                            {u.isAdmin ? <ShieldOff width={16} height={16} /> : <ShieldCheck width={16} height={16} />}
                          </button>
                          <button
                            type="button"
                            className="ico-btn danger"
                            disabled={self}
                            title={u.bannedAt ? 'Restore account' : 'Suspend account'}
                            onClick={() => (u.bannedAt ? run(u, 'unban') : setConfirm({ user: u, kind: 'ban' }))}
                          >
                            {u.bannedAt ? <RotateCcw width={16} height={16} /> : <Ban width={16} height={16} />}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
              {filtered.length === 0 && !isLoading && (
                <div className="px-6 py-16 text-center text-[14px]" style={{ color: 'var(--taupe)' }}>
                  No accounts match that search.
                </div>
              )}
            </div>

            <div className="pager r" style={{ ['--i' as string]: 9 }}>
              <span>Showing {filtered.length} of {users.length} accounts</span>
              <span>Phone numbers are masked · click a row to reveal</span>
            </div>
          </>
        )}
      </section>

      <AnimatePresence>
        {inviteOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/35 px-6 backdrop-blur-sm"
            onClick={() => !invite.isPending && setInviteOpen(false)}
          >
            <motion.form
              onSubmit={sendInvite}
              initial={{ scale: 0.95, y: 12 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.97, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="admin-x w-full max-w-[420px] rounded-2xl bg-white p-7 shadow-2xl"
            >
              <h3 className="font-display text-[20px] text-[--char]">Invite an admin</h3>
              <p className="mt-2.5 text-[14px] leading-relaxed" style={{ color: 'var(--taupe)' }}>
                Someone who already has an account is made an admin straight away. Anyone else is emailed an invitation
                and gets admin access as soon as they accept it.
              </p>
              <input
                type="email"
                required
                autoFocus
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="name@company.com"
                aria-label="Email address"
                className="mt-5 h-11 w-full rounded-xl px-3.5 text-[14.5px] outline-none"
                style={{ boxShadow: 'inset 0 0 0 1px var(--stone)', color: 'var(--ink)' }}
              />
              <div className="mt-6 flex gap-3">
                <button type="button" onClick={() => setInviteOpen(false)} disabled={invite.isPending} className="btn btn-line flex-1 justify-center">Cancel</button>
                <button type="submit" disabled={invite.isPending || !inviteEmail.trim()} className="btn btn-dark flex-1 justify-center">
                  {invite.isPending && <Loader2 width={15} height={15} className="animate-spin" />} Add admin
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}

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
              <h3 className="font-display text-[20px] text-[--char]">
                {confirm.kind === 'ban' ? 'Suspend this account?' : 'Remove admin access?'}
              </h3>
              <p className="mt-2.5 text-[14px] leading-relaxed" style={{ color: 'var(--taupe)' }}>
                {confirm.kind === 'ban'
                  ? `${confirm.user.email} won't be able to generate any new designs until restored.`
                  : `${confirm.user.email} will lose access to the admin panel.`}
              </p>
              <div className="mt-7 flex gap-3">
                <button type="button" onClick={() => setConfirm(null)} className="btn btn-line flex-1 justify-center">Cancel</button>
                <button
                  type="button"
                  onClick={() => run(confirm.user, confirm.kind === 'ban' ? 'ban' : 'demote')}
                  className="btn flex-1 justify-center"
                  style={{ background: 'var(--rose)', color: '#fff' }}
                >
                  {confirm.kind === 'ban' ? 'Suspend' : 'Remove access'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AdminShell>
  );
}

/** Signups per day over the last 14 days, from account creation dates already in hand — no extra query. */
function SignupHistogram({ users }: { users: AdminUserRow[] }) {
  const days = 14;
  const since = Date.now() - days * 86_400_000;
  const counts = new Array(days).fill(0);
  users.forEach((u) => {
    const t = new Date(u.createdAt).getTime();
    if (t < since) return;
    const idx = Math.min(days - 1, Math.floor((t - since) / 86_400_000));
    counts[idx] += 1;
  });
  const max = Math.max(1, ...counts);
  const start = new Date(since);
  const end = new Date();

  return (
    <>
      <div className="hist">
        {counts.map((v, i) => (
          <i key={i} className={v ? 'on' : ''} style={{ height: `${v ? Math.max(12, (v / max) * 100) : 3}%`, animationDelay: `${300 + i * 40}ms` }} />
        ))}
      </div>
      <div className="hist-l">
        <span>{start.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
        <span>Last {days} days</span>
        <span>{end.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
      </div>
    </>
  );
}

function exportCsv(users: AdminUserRow[]) {
  const header = ['Name', 'Email', 'Phone', 'Plan', 'Admin', 'Suspended', 'Joined'];
  const rows = users.map((u) => [
    u.name ?? '', u.email ?? '', u.phone ?? '', u.plan, u.isAdmin ? 'yes' : 'no', u.bannedAt ? 'yes' : 'no', u.createdAt,
  ]);
  const csv = [header, ...rows].map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'thinkdecor-accounts.csv';
  a.click();
  URL.revokeObjectURL(url);
}
