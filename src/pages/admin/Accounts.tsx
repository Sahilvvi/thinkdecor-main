import { useMemo, useState } from 'react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Users, ShieldCheck, ShieldOff, Ban, RotateCcw } from 'lucide-react';
import { SEO } from '@/components/shared/SEO';
import { AdminShell } from '@/components/admin/AdminShell';
import { Reveal } from '@/components/premium/Motion';
import { useAdminUsers, useAdminUserAction, type AdminUserRow } from '@/lib/admin';
import { useAuthStore } from '@/stores/authStore';

function when(iso: string | null) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Accounts() {
  const { data: users, isLoading, error } = useAdminUsers();
  const action = useAdminUserAction();
  const { user: me } = useAuthStore();
  const [q, setQ] = useState('');
  const [confirm, setConfirm] = useState<{ user: AdminUserRow; kind: 'ban' | 'demote' } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return users ?? [];
    return (users ?? []).filter((u) =>
      [u.email, u.name, u.phone].filter(Boolean).some((v) => (v as string).toLowerCase().includes(term)),
    );
  }, [users, q]);

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

  return (
    <AdminShell>
      <SEO title="Accounts · Admin" description="Manage customer and admin accounts." />

      <main className="container mx-auto max-w-[1180px] px-6 py-10">
        <Reveal className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <h1 className="font-display text-[34px] font-normal tracking-[-0.01em] text-foreground">Accounts</h1>
            <p className="mt-1.5 text-[13.5px] text-foreground/50">
              {users?.length ?? 0} total · {users?.filter((u) => u.isAdmin).length ?? 0} admins ·{' '}
              {users?.filter((u) => u.bannedAt).length ?? 0} suspended
            </p>
          </div>
        </Reveal>

        <Reveal delay={0.08} className="mt-7 flex items-center gap-3 rounded-xl border border-foreground/[0.10] bg-foreground/[0.025] px-4 py-3">
          <Search className="h-4 w-4 flex-shrink-0 text-foreground/42" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name, email, phone…"
            className="flex-1 bg-transparent text-[14px] text-foreground outline-none placeholder:text-foreground/38"
          />
        </Reveal>

        <div className="mt-6 overflow-hidden rounded-2xl border border-foreground/[0.09]">
          {isLoading && (
            <div className="flex items-center justify-center gap-3 py-20 text-foreground/50">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading accounts…
            </div>
          )}

          {!isLoading && error && (
            <div className="px-6 py-16 text-center">
              <Users className="mx-auto h-8 w-8 text-foreground/25" />
              <p className="mt-4 text-[15px] font-medium text-foreground">Couldn't load accounts</p>
              <p className="mx-auto mt-2 max-w-[48ch] text-[13.5px] leading-relaxed text-foreground/55">
                Deploy the <code className="mx-1 rounded bg-foreground/[0.05] px-1.5 py-0.5 text-primary">admin-users</code> edge function and run the admin_panel migration.
              </p>
              <p className="mt-3 text-[12px] text-foreground/38">{(error as Error).message}</p>
            </div>
          )}

          {!isLoading && !error && filtered.map((u, i) => (
            <motion.div
              key={u.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.02, 0.4) }}
              className="group flex flex-wrap items-center gap-4 border-b border-foreground/[0.07] bg-card px-5 py-4 transition-colors last:border-0 hover:bg-foreground/[0.02]"
            >
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/[0.10] text-[13px] font-bold text-primary transition-transform duration-300 group-hover:scale-110">
                {(u.name || u.email || '?').slice(0, 1).toUpperCase()}
              </span>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="truncate text-[14px] font-medium text-foreground">{u.name || 'No name'}</span>
                  {u.isAdmin && (
                    <span className="flex items-center gap-1 rounded-full bg-primary/12 px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-primary">
                      <ShieldCheck className="h-3 w-3" /> Admin
                    </span>
                  )}
                  {u.bannedAt && (
                    <span className="flex items-center gap-1 rounded-full bg-destructive/12 px-2.5 py-0.5 text-[10.5px] font-semibold uppercase tracking-wider text-destructive">
                      <Ban className="h-3 w-3" /> Suspended
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-[12.5px] text-foreground/45">
                  {u.email} {u.phone && <span className="text-foreground/28"> · {u.phone}</span>}
                </p>
              </div>

              <span className="hidden text-[12px] text-foreground/40 sm:block">Joined {when(u.createdAt)}</span>
              <span className="hidden rounded-full bg-foreground/[0.05] px-2.5 py-1 text-[11px] font-medium capitalize text-foreground/55 md:block">
                {u.plan}
              </span>

              <div className="flex flex-shrink-0 items-center gap-2">
                {busyId === u.id ? (
                  <Loader2 className="h-4 w-4 animate-spin text-foreground/40" />
                ) : (
                  <>
                    <button
                      onClick={() => (u.isAdmin ? setConfirm({ user: u, kind: 'demote' }) : run(u, 'promote'))}
                      disabled={u.id === me?.id}
                      title={u.isAdmin ? 'Remove admin access' : 'Make admin'}
                      className="rounded-lg border border-foreground/[0.10] p-2 text-foreground/55 transition-colors hover:border-primary/40 hover:text-primary disabled:opacity-30"
                    >
                      {u.isAdmin ? <ShieldOff className="h-3.5 w-3.5" /> : <ShieldCheck className="h-3.5 w-3.5" />}
                    </button>
                    <button
                      onClick={() => (u.bannedAt ? run(u, 'unban') : setConfirm({ user: u, kind: 'ban' }))}
                      disabled={u.id === me?.id}
                      title={u.bannedAt ? 'Restore account' : 'Suspend account'}
                      className="rounded-lg border border-foreground/[0.10] p-2 text-foreground/55 transition-colors hover:border-destructive/40 hover:text-destructive disabled:opacity-30"
                    >
                      {u.bannedAt ? <RotateCcw className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          ))}

          {!isLoading && !error && filtered.length === 0 && (
            <div className="px-6 py-20 text-center">
              <Users className="mx-auto h-8 w-8 text-foreground/25" />
              <p className="mt-4 text-[15px] text-foreground/58">No accounts match that search.</p>
            </div>
          )}
        </div>
      </main>

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
              <h3 className="text-[17px] font-bold tracking-[-0.02em] text-foreground">
                {confirm.kind === 'ban' ? 'Suspend this account?' : 'Remove admin access?'}
              </h3>
              <p className="mt-2.5 text-[14px] leading-relaxed text-foreground/58">
                {confirm.kind === 'ban'
                  ? `${confirm.user.email} won't be able to generate any new designs until restored. Their existing designs and data stay intact.`
                  : `${confirm.user.email} will lose access to the admin panel.`}
              </p>
              <div className="mt-7 flex gap-3">
                <button
                  onClick={() => setConfirm(null)}
                  className="flex-1 rounded-full border border-foreground/[0.14] py-3 text-[13.5px] font-medium text-foreground/70 transition-colors hover:text-foreground"
                >
                  Cancel
                </button>
                <button
                  onClick={() => run(confirm.user, confirm.kind === 'ban' ? 'ban' : 'demote')}
                  className="flex-1 rounded-full bg-destructive py-3 text-[13.5px] font-semibold text-destructive-foreground transition-transform duration-300 hover:scale-[1.02]"
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
