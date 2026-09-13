import { Link } from 'react-router-dom';
import { ArrowRight, Images, LayoutGrid, Plus, Sparkles, Wand2 } from 'lucide-react';

import { SEO } from '@/components/shared/SEO';
import { Skeleton } from '@/components/ui/skeleton';
import { StoredImage } from '@/components/app/StoredImage';
import { useDisplayName } from '@/hooks/useProfile';
import {
  FREE_SIGNUP_CREDITS, formatDate, isSetupError, useCreditBalance, useGenerations,
} from '@/lib/generation';
import { TEMPLATES, roomLabel, templateByKey } from '@/lib/templates';
import { PHASE1_PLAN, pence } from '@/lib/billing';

const INTRO = pence(PHASE1_PLAN.introPrice ?? 0.69);

export default function Overview() {
  const { firstName } = useDisplayName();
  const { data: credits, error: creditsError } = useCreditBalance();
  const { data: recent, isLoading: recentLoading, error: recentError } = useGenerations(6);
  const { data: all } = useGenerations();

  const setupPending = isSetupError(creditsError) || isSetupError(recentError);
  const empty = credits !== undefined && credits <= 0;
  const featured = TEMPLATES.filter((t) => t.featured);

  return (
    <>
      <SEO title="Overview | ThinkDecor" description="Your ThinkDecor workspace." />

      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-[clamp(1.7rem,3vw,2.3rem)] font-bold tracking-[-0.025em] text-foreground">
            Hello, {firstName}
          </h1>
          <p className="mt-1 text-[15px] text-foreground/55">Pick up a design or start a new room.</p>
        </div>
        <Link
          to="/app/create"
          className="inline-flex items-center gap-2 self-start rounded-full bg-primary px-5 py-2.5 text-[14px] font-semibold text-primary-foreground transition-transform duration-300 hover:scale-[1.03] sm:self-auto"
        >
          <Plus className="h-4 w-4" /> New design
        </Link>
      </div>

      {setupPending && (
        <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/[0.07] px-5 py-4 text-[14px] text-amber-800">
          Your workspace is almost ready — credits and design history switch on once the latest database update is applied.
        </div>
      )}

      {/* Stats */}
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard
          icon={Sparkles}
          label="Credits remaining"
          value={credits === undefined ? '—' : String(credits)}
          hint={
            empty ? (
              <Link to="/pricing" className="font-semibold text-primary hover:underline">
                Upgrade — {INTRO} first month
              </Link>
            ) : (
              'Each redesign uses 1 credit'
            )
          }
        />
        <StatCard
          icon={Images}
          label="Designs created"
          value={all === undefined ? '—' : String(all.length)}
          hint={<Link to="/app/library" className="font-semibold text-primary hover:underline">Open library</Link>}
        />
        <StatCard
          icon={LayoutGrid}
          label="Templates"
          value={String(TEMPLATES.length)}
          hint={<Link to="/app/templates" className="font-semibold text-primary hover:underline">Browse styles</Link>}
        />
      </div>

      {/* Create tile */}
      <Link
        to="/app/create"
        className="group mt-6 grid overflow-hidden rounded-[26px] bg-primary text-primary-foreground shadow-[0_30px_70px_-34px_hsl(168_100%_17%/0.6)] md:grid-cols-[1.1fr_0.9fr]"
      >
        <div className="relative p-7 lg:p-9">
          <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/[0.08] blur-3xl" />
          <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15">
            <Wand2 className="h-5 w-5" />
          </span>
          <h2 className="relative mt-5 text-[clamp(1.4rem,2.4vw,1.9rem)] font-bold tracking-[-0.02em]">Redesign a room</h2>
          <p className="relative mt-2 max-w-[42ch] text-[15px] leading-relaxed text-primary-foreground/75">
            Upload a photo, choose a style, and describe what you want changed. Mantha AI does the rest.
          </p>
          <span className="relative mt-6 inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[14px] font-semibold text-primary">
            Start creating
            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
        <div className="relative hidden min-h-[220px] md:block">
          <img src="/assets/samples/styled_room.png" alt="" className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/20 to-transparent" />
        </div>
      </Link>

      {/* Quick start */}
      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-foreground">Quick start</h2>
          <Link to="/app/templates" className="text-[13.5px] font-semibold text-primary hover:underline">
            All templates
          </Link>
        </div>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          {featured.map((t) => (
            <Link
              key={t.key}
              to={`/app/create?template=${t.key}`}
              className="group overflow-hidden rounded-2xl border border-border/70 bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_18px_40px_-24px_hsl(168_40%_15%/0.4)]"
            >
              <div className="aspect-[4/3] overflow-hidden">
                <img
                  src={t.image}
                  alt={`${t.label} style`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-4">
                <p className="text-[14.5px] font-semibold text-foreground">{t.label}</p>
                <p className="mt-0.5 line-clamp-1 text-[13px] text-foreground/55">{t.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Recent designs */}
      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-foreground">Recent designs</h2>
          {recent && recent.length > 0 && (
            <Link to="/app/library" className="text-[13.5px] font-semibold text-primary hover:underline">
              View all
            </Link>
          )}
        </div>

        {recentLoading ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[4/3] rounded-2xl" />
            ))}
          </div>
        ) : recent && recent.length > 0 ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recent.map((g) => (
              <Link
                key={g.id}
                to="/app/library"
                className="group overflow-hidden rounded-2xl border border-border/70 bg-card transition-colors hover:border-primary/30"
              >
                <div className="aspect-[4/3] overflow-hidden bg-secondary">
                  <StoredImage
                    src={g.output_image_url ?? g.input_image_url}
                    alt="Generated design"
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-semibold text-foreground">
                      {templateByKey(g.template_key)?.label ?? 'Custom'}
                      {roomLabel(g.room_type) ? ` · ${roomLabel(g.room_type)}` : ''}
                    </p>
                    <p className="text-[12.5px] text-foreground/50">{formatDate(g.created_at)}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="mt-4 flex flex-col items-center rounded-[22px] border border-dashed border-border px-6 py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <Sparkles className="h-5 w-5 text-primary" />
            </span>
            <p className="mt-4 text-[16px] font-semibold text-foreground">No designs yet</p>
            <p className="mt-1 max-w-[40ch] text-[14px] text-foreground/55">
              {credits && credits > 0
                ? `You have ${credits} free ${credits === 1 ? 'redesign' : 'redesigns'} — try one on any room photo.`
                : `Every new account starts with ${FREE_SIGNUP_CREDITS} free redesigns.`}
            </p>
            <Link
              to="/app/create"
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[14px] font-semibold text-primary-foreground"
            >
              <Plus className="h-4 w-4" /> Create your first design
            </Link>
          </div>
        )}
      </section>
    </>
  );
}

function StatCard({
  icon: Icon, label, value, hint,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  hint: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-border/70 bg-card p-5">
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <Icon className="h-4 w-4 text-primary" />
        </span>
        <span className="text-[12.5px] font-medium text-foreground/55">{label}</span>
      </div>
      <p className="mt-3 text-[30px] font-bold leading-none tracking-[-0.03em] text-foreground">{value}</p>
      <p className="mt-2 text-[13px] text-foreground/55">{hint}</p>
    </div>
  );
}
