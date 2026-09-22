import { motion } from 'framer-motion';
import { Users, Eye, Sparkles, PoundSterling, Ticket, TrendingUp, Loader2 } from 'lucide-react';
import { SEO } from '@/components/shared/SEO';
import { AdminShell } from '@/components/admin/AdminShell';
import { useOverviewStats } from '@/lib/admin';
import { money } from '@/lib/billing';

const KIND_LABEL: Record<string, string> = {
  redesign: 'Mantha redesigns',
  repaint_floor: 'Floor repaints',
  repaint_walls: 'Wall repaints',
  cleanup: 'Cleanups',
  replace: 'Replacements',
};

function dayLabel(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', { weekday: 'short' });
}

export default function Overview() {
  const { data: stats, isLoading, error } = useOverviewStats();

  const cards = stats
    ? [
        { icon: Eye, label: 'Visitors (7d)', value: stats.visitors7d, sub: `${stats.pageViews7d} page views` },
        { icon: Users, label: 'Signups', value: stats.signupsTotal, sub: `+${stats.signups7d} this week` },
        { icon: Sparkles, label: 'Designs generated', value: stats.generationsTotal, sub: `${stats.activeSubscriptions} active plans` },
        { icon: PoundSterling, label: 'Revenue', value: money(stats.revenuePenceTotal / 100), sub: 'all-time, paid' },
        { icon: Ticket, label: 'Open queries', value: stats.openTickets, sub: 'awaiting a reply' },
      ]
    : [];

  const maxDaily = stats ? Math.max(1, ...stats.dailyViews.map((d) => d.count)) : 1;
  const maxKind = stats ? Math.max(1, ...stats.generationsByKind.map((k) => k.count)) : 1;

  return (
    <AdminShell>
      <SEO title="Overview · Admin" description="Traffic, signups and revenue at a glance." />

      <main className="container mx-auto max-w-[1180px] px-6 py-10">
        <div>
          <h1 className="font-display text-[34px] font-normal tracking-[-0.01em] text-foreground">Overview</h1>
          <p className="mt-1.5 text-[13.5px] text-foreground/50">How the product is doing, at a glance.</p>
        </div>

        {isLoading && (
          <div className="mt-16 flex items-center justify-center gap-3 text-foreground/50">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading stats…
          </div>
        )}

        {!isLoading && error && (
          <div className="mt-10 rounded-2xl border border-foreground/[0.09] px-6 py-10 text-center">
            <p className="text-[14.5px] text-foreground/60">
              Couldn't load stats. If this is a fresh setup, run the <code className="rounded bg-foreground/[0.05] px-1.5 py-0.5 text-primary">admin_panel</code> migration in Supabase.
            </p>
          </div>
        )}

        {!isLoading && stats && (
          <>
            <div className="mt-7 grid grid-cols-2 gap-4 lg:grid-cols-5">
              {cards.map((c, i) => {
                const Icon = c.icon;
                return (
                  <motion.div
                    key={c.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="rounded-2xl border border-foreground/[0.09] bg-card p-5"
                  >
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/[0.10]">
                      <Icon className="h-4 w-4 text-primary" />
                    </span>
                    <p className="mt-3 text-[22px] font-bold tracking-[-0.02em] text-foreground">{c.value}</p>
                    <p className="mt-0.5 text-[12px] text-foreground/45">{c.label}</p>
                    <p className="mt-1 text-[11px] text-foreground/35">{c.sub}</p>
                  </motion.div>
                );
              })}
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-[1.3fr_1fr]">
              {/* traffic chart */}
              <div className="rounded-2xl border border-foreground/[0.09] bg-card p-6">
                <h2 className="flex items-center gap-2 text-[14px] font-semibold text-foreground">
                  <TrendingUp className="h-4 w-4 text-primary" /> Page views, last 7 days
                </h2>
                <div className="mt-6 flex h-[140px] items-end gap-3">
                  {stats.dailyViews.map((d) => (
                    <div key={d.day} className="flex flex-1 flex-col items-center gap-2">
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: `${Math.max(4, (d.count / maxDaily) * 110)}px` }}
                        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                        className="w-full rounded-t-md bg-gradient-to-t from-primary/70 to-primary"
                      />
                      <span className="text-[10.5px] text-foreground/40">{dayLabel(d.day)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* generations by kind */}
              <div className="rounded-2xl border border-foreground/[0.09] bg-card p-6">
                <h2 className="text-[14px] font-semibold text-foreground">Designs by type</h2>
                <div className="mt-5 space-y-3.5">
                  {stats.generationsByKind.length === 0 && (
                    <p className="text-[13px] text-foreground/45">No generations yet.</p>
                  )}
                  {stats.generationsByKind.map((k) => (
                    <div key={k.kind}>
                      <div className="flex items-center justify-between text-[12.5px]">
                        <span className="text-foreground/65">{KIND_LABEL[k.kind] ?? k.kind}</span>
                        <span className="font-medium text-foreground">{k.count}</span>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-foreground/[0.06]">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(k.count / maxKind) * 100}%` }}
                          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                          className="h-full rounded-full bg-primary"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
      </main>
    </AdminShell>
  );
}
