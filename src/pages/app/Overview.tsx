import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Images, LayoutGrid, Plus, Wand2, Zap } from 'lucide-react';

import { SEO } from '@/components/shared/SEO';
import { Skeleton } from '@/components/ui/skeleton';
import { StoredImage } from '@/components/app/StoredImage';
import { Magnetic, Reveal, Stagger, staggerItem } from '@/components/premium/Motion';
import { Tilt } from '@/components/motion/primitives';
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

      <Reveal className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-primary">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Your workspace
          </p>
          <h1 className="mt-2 text-[clamp(1.7rem,3vw,2.3rem)] font-bold tracking-[-0.025em] text-foreground">
            Hello, {firstName}
          </h1>
          <p className="mt-1 text-[15px] text-foreground/55">Pick up a design or start a new room.</p>
        </div>
        <Magnetic className="self-start sm:self-auto">
          <Link
            to="/app/create"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-primary px-5 py-2.5 text-[14px] font-semibold text-primary-foreground transition-transform duration-300 hover:scale-[1.03]"
          >
            <span
              aria-hidden
              className="absolute inset-0 -translate-x-full bg-[linear-gradient(100deg,transparent,rgba(255,255,255,0.25),transparent)] transition-transform duration-700 group-hover:translate-x-full"
            />
            <Plus className="relative h-4 w-4" /> <span className="relative">New design</span>
          </Link>
        </Magnetic>
      </Reveal>

      {setupPending && (
        <div className="mt-6 rounded-2xl border border-amber-500/30 bg-amber-500/[0.07] px-5 py-4 text-[14px] text-amber-800">
          Your workspace is almost ready — credits and design history switch on once the latest database update is applied.
        </div>
      )}

      {/* Stats */}
      <Stagger className="mt-8 grid gap-4 sm:grid-cols-3" gap={0.08}>
        <StatCard
          icon={Zap}
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
          hint={<Link to="/app/library" className="font-semibold text-primary hover:underline">Open projects</Link>}
        />
        <StatCard
          icon={LayoutGrid}
          label="Templates"
          value={String(TEMPLATES.length)}
          hint={<Link to="/app/templates" className="font-semibold text-primary hover:underline">Browse styles</Link>}
        />
      </Stagger>

      {/* Create tile */}
      <Reveal delay={0.08} y={28} className="mt-6">
        <Tilt max={2.5} innerClassName="rounded-[26px]">
          <Link
            to="/app/create"
            className="group relative grid overflow-hidden rounded-[26px] bg-[linear-gradient(150deg,hsl(168_100%_14%),hsl(168_85%_20%)_60%,hsl(166_70%_27%))] text-primary-foreground shadow-[0_30px_70px_-34px_hsl(168_100%_17%/0.6)] md:grid-cols-[1.1fr_0.9fr]"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_70%_100%_at_0%_0%,#000,transparent)]"
            />
            <div
              aria-hidden
              className="shine-sweep pointer-events-none absolute inset-y-0 -left-1/4 w-1/4 -skew-x-12 bg-[linear-gradient(90deg,transparent,hsl(0_0%_100%/0.18),transparent)] mix-blend-overlay"
            />
            <div className="relative p-7 lg:p-9">
              <div className="pointer-events-none absolute -left-16 -top-16 h-56 w-56 rounded-full bg-white/[0.08] blur-3xl" />
              <span className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 transition-transform duration-400 group-hover:scale-110">
                <Wand2 className="h-5 w-5" />
              </span>
              <h2 className="relative mt-5 text-[clamp(1.4rem,2.4vw,1.9rem)] font-bold tracking-[-0.02em]">Redesign a room</h2>
              <p className="relative mt-2 max-w-[42ch] text-[15px] leading-relaxed text-primary-foreground/75">
                Upload a photo, choose a style, and describe what you want changed. Mantha AI does the rest.
              </p>
              <span className="group/btn relative mt-6 inline-flex items-center gap-2 overflow-hidden rounded-full bg-white px-5 py-2.5 text-[14px] font-semibold text-primary">
                <span
                  aria-hidden
                  className="absolute inset-0 -translate-x-full bg-[linear-gradient(100deg,transparent,hsl(168_100%_17%/0.1),transparent)] transition-transform duration-700 group-hover:translate-x-full"
                />
                <span className="relative">Start creating</span>
                <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </div>
            <div className="relative hidden min-h-[220px] md:block">
              <img
                src="/assets/samples/styled_room.png"
                alt=""
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/20 to-transparent" />
            </div>
          </Link>
        </Tilt>
      </Reveal>

      {/* Quick start */}
      <section className="mt-10">
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-[18px] font-semibold tracking-[-0.01em] text-foreground">Quick start</h2>
          <Link to="/app/templates" className="text-[13.5px] font-semibold text-primary hover:underline">
            All templates
          </Link>
        </div>
        <Stagger className="mt-4 grid gap-4 sm:grid-cols-3" gap={0.07}>
          {featured.map((t) => (
            <motion.div key={t.key} variants={staggerItem}>
              <Tilt max={5} innerClassName="rounded-2xl">
                <Link
                  to={`/app/create?template=${t.key}`}
                  className="group block overflow-hidden rounded-2xl border border-border/70 bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_18px_40px_-24px_hsl(168_40%_15%/0.4)]"
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
              </Tilt>
            </motion.div>
          ))}
        </Stagger>
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
          <Stagger className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" gap={0.06}>
            {recent.map((g) => (
              <motion.div key={g.id} variants={staggerItem}>
                <Tilt max={4} innerClassName="rounded-2xl">
                  <Link
                    to="/app/library"
                    className="group block overflow-hidden rounded-2xl border border-border/70 bg-card transition-colors hover:border-primary/30"
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
                </Tilt>
              </motion.div>
            ))}
          </Stagger>
        ) : (
          <div className="mt-4 flex flex-col items-center rounded-[22px] border border-dashed border-border px-6 py-12 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <Wand2 className="h-5 w-5 text-primary" />
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
    <motion.div
      variants={staggerItem}
      className="group rounded-2xl border border-border/70 bg-card p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-[0_18px_40px_-26px_hsl(168_30%_15%/0.35)]"
    >
      <div className="flex items-center gap-2.5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 transition-all duration-400 group-hover:scale-110 group-hover:bg-primary">
          <Icon className="h-4 w-4 text-primary transition-colors duration-400 group-hover:text-primary-foreground" />
        </span>
        <span className="text-[12.5px] font-medium text-foreground/55">{label}</span>
      </div>
      <p className="mt-3 text-[30px] font-bold leading-none tracking-[-0.03em] text-foreground">{value}</p>
      <p className="mt-2 text-[13px] text-foreground/55">{hint}</p>
    </motion.div>
  );
}
