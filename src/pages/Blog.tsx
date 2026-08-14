import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Clock, PenLine, Mail } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SEO } from '@/components/shared/SEO';
import { Reveal, Stagger, staggerItem } from '@/components/premium/Motion';
import { listPublished, type BlogPost } from '@/lib/blog';

const FALLBACK_COVER = '/assets/samples/styled_room.png';

function fmt(d: string | null) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState<string>('All');

  useEffect(() => {
    // Single source of truth: the database. No frontend fallback, so what a
    // visitor sees is always exactly what the admin panel can edit.
    listPublished()
      .then(setPosts)
      .catch((e: Error) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  const tags = useMemo(() => {
    const t = new Set<string>();
    posts.forEach((p) => p.tag && t.add(p.tag));
    return ['All', ...Array.from(t)];
  }, [posts]);

  const visible = useMemo(
    () => (filter === 'All' ? posts : posts.filter((p) => p.tag === filter)),
    [posts, filter],
  );

  const [lead, ...rest] = visible;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Journal | ThinkDecor"
        description="Notes on spatial intelligence, AI measurement and interior design from the ThinkDecor team."
        canonical="https://thinkdecor.app/blog"
      />
      <Navbar />

      <main className="relative z-10 pt-28">
        {/* ---------------- HEADER ---------------- */}
        <section className="relative overflow-hidden pb-10 pt-8 lg:pb-14">
          <div className="pointer-events-none absolute -top-32 left-1/2 h-[480px] w-[880px] -translate-x-1/2 rounded-full bg-primary/[0.05] blur-[150px]" />
          <div className="container relative mx-auto max-w-[1120px] px-6 sm:px-8">
            <Reveal>
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-primary">Journal</p>
              <h1 className="mt-5 max-w-[15ch] text-[clamp(2.3rem,5.4vw,4rem)] font-bold leading-[1.03] tracking-[-0.035em] text-foreground">
                Notes on spatial intelligence.
              </h1>
              <p className="mt-5 max-w-[52ch] text-[15.5px] leading-relaxed text-foreground/58">
                How AI is changing the way rooms get measured, designed and sold — written by the
                people building it.
              </p>
            </Reveal>

            {/* filter chips */}
            {!loading && !err && tags.length > 2 && (
              <Reveal delay={0.12}>
                <div className="mt-9 flex flex-wrap gap-2">
                  {tags.map((t) => {
                    const active = filter === t;
                    return (
                      <button
                        key={t}
                        onClick={() => setFilter(t)}
                        className={`relative rounded-full px-4 py-2 text-[12.5px] font-medium transition-all duration-350 ${
                          active
                            ? 'text-primary-foreground'
                            : 'border border-foreground/[0.12] bg-card text-foreground/60 hover:-translate-y-0.5 hover:border-primary/30 hover:text-foreground'
                        }`}
                      >
                        {active && (
                          <motion.span
                            layoutId="blog-filter-pill"
                            className="absolute inset-0 rounded-full bg-primary"
                            transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                          />
                        )}
                        <span className="relative z-10">{t}</span>
                      </button>
                    );
                  })}
                </div>
              </Reveal>
            )}
          </div>
        </section>

        {/* ---------------- LOADING ---------------- */}
        {loading && (
          <div className="container mx-auto max-w-[1120px] px-6 pb-28 sm:px-8">
            <div className="grid gap-6 lg:grid-cols-2">
              {[0, 1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse space-y-4 rounded-3xl border border-foreground/[0.08] bg-card p-5">
                  <div className="h-48 rounded-2xl bg-foreground/[0.045]" />
                  <div className="h-4 w-2/3 rounded bg-foreground/[0.05]" />
                  <div className="h-3 w-1/2 rounded bg-foreground/[0.035]" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ---------------- ERROR ---------------- */}
        {!loading && err && (
          <div className="container mx-auto max-w-[1120px] px-6 pb-28 sm:px-8">
            <div className="rounded-[26px] border border-foreground/[0.09] bg-card px-8 py-14 text-center shadow-[0_20px_60px_-40px_hsl(168_30%_12%/0.3)]">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/[0.09] text-primary">
                <PenLine className="h-5 w-5" />
              </span>
              <h2 className="mt-5 text-[19px] font-bold tracking-[-0.02em] text-foreground">The journal isn't live yet</h2>
              <p className="mx-auto mt-3 max-w-[46ch] text-[14px] leading-relaxed text-foreground/55">
                We couldn't reach the article store. If you're setting this up, run the
                <code className="mx-1.5 rounded bg-foreground/[0.05] px-1.5 py-0.5 text-[12.5px] text-primary">blog_posts</code>
                migration in Supabase and refresh.
              </p>
              <p className="mt-4 text-[12px] text-foreground/38">{err}</p>
            </div>
          </div>
        )}

        {/* ---------------- EMPTY ---------------- */}
        {!loading && !err && visible.length === 0 && (
          <div className="container mx-auto max-w-[1120px] px-6 pb-28 sm:px-8">
            <div className="rounded-[26px] border border-foreground/[0.09] bg-card px-8 py-16 text-center shadow-[0_20px_60px_-40px_hsl(168_30%_12%/0.3)]">
              <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/[0.09] text-primary">
                <PenLine className="h-5 w-5" />
              </span>
              <h2 className="mt-5 text-[19px] font-bold tracking-[-0.02em] text-foreground">
                {filter === 'All' ? 'First article coming soon.' : `Nothing filed under ${filter} yet.`}
              </h2>
              <p className="mx-auto mt-3 max-w-[44ch] text-[14px] leading-relaxed text-foreground/55">
                We're writing about how rooms get measured, how the models see space, and what we get
                wrong along the way.
              </p>
              <Link
                to="/contact"
                className="group mt-8 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-[14px] font-semibold text-primary-foreground transition-transform duration-300 hover:scale-[1.03]"
              >
                <Mail className="h-4 w-4" />
                Tell me when it's up
              </Link>
            </div>
          </div>
        )}

        {/* ---------------- FEATURED ---------------- */}
        <AnimatePresence mode="wait">
          {!loading && !err && lead && (
            <motion.section
              key={`lead-${filter}-${lead.id}`}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="pb-14"
            >
              <div className="container mx-auto max-w-[1120px] px-6 sm:px-8">
                <Link
                  to={`/blog/${lead.slug}`}
                  className="group block overflow-hidden rounded-[28px] border border-foreground/[0.09] bg-card shadow-[0_10px_34px_-24px_hsl(168_20%_10%/0.4)] transition-all duration-500 hover:-translate-y-1 hover:border-primary/28 hover:shadow-[0_36px_80px_-44px_hsl(168_60%_15%/0.35)]"
                >
                  <div className="grid lg:grid-cols-[1.1fr_0.9fr]">
                    <div className="relative aspect-[16/10] overflow-hidden lg:aspect-auto lg:min-h-[380px]">
                      <img
                        src={lead.cover_url || FALLBACK_COVER}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.05]"
                      />
                      <span className="absolute left-5 top-5 rounded-full bg-background/92 px-3.5 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-primary shadow-sm backdrop-blur-md">
                        {lead.tag ?? 'Featured'}
                      </span>
                    </div>
                    <div className="flex flex-col justify-center gap-5 p-8 lg:p-10">
                      <span className="flex items-center gap-3">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/[0.12] text-[11px] font-bold text-primary">
                          {(lead.author_name ?? 'T').slice(0, 1)}
                        </span>
                        <span className="text-[12.5px] text-foreground/50">
                          {lead.author_name ?? 'ThinkDecor'}
                          <span className="mx-2 text-foreground/25">·</span>
                          {fmt(lead.published_at)}
                        </span>
                      </span>
                      <h2 className="text-[clamp(1.5rem,2.6vw,2.15rem)] font-bold leading-[1.14] tracking-[-0.025em] text-foreground transition-colors duration-400 group-hover:text-primary">
                        {lead.title}
                      </h2>
                      {lead.excerpt && (
                        <p className="max-w-[46ch] text-[15px] leading-relaxed text-foreground/58">{lead.excerpt}</p>
                      )}
                      <span className="mt-1 flex items-center gap-5 text-[12.5px] text-foreground/45">
                        <span className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5" />
                          {lead.read_minutes ?? 4} min read
                        </span>
                        <span className="flex items-center gap-1.5 font-semibold text-primary">
                          Read article
                          <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                        </span>
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        {/* ---------------- GRID ---------------- */}
        {!loading && !err && rest.length > 0 && (
          <section className="pb-24 lg:pb-32">
            <div className="container mx-auto max-w-[1120px] px-6 sm:px-8">
              <Stagger className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3" gap={0.07}>
                {rest.map((p) => (
                  <motion.div key={p.id} variants={staggerItem}>
                    <Link
                      to={`/blog/${p.slug}`}
                      className="group flex h-full flex-col overflow-hidden rounded-[22px] border border-foreground/[0.08] bg-card shadow-[0_8px_26px_-20px_hsl(168_20%_10%/0.4)] transition-all duration-500 hover:-translate-y-1.5 hover:border-primary/28 hover:shadow-[0_28px_60px_-36px_hsl(168_60%_15%/0.34)]"
                    >
                      <div className="relative aspect-[16/10] overflow-hidden">
                        <img
                          src={p.cover_url || FALLBACK_COVER}
                          alt=""
                          loading="lazy"
                          className="absolute inset-0 h-full w-full object-cover transition-transform duration-[1100ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.07]"
                        />
                        {p.tag && (
                          <span className="absolute left-4 top-4 rounded-full bg-background/92 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-primary shadow-sm backdrop-blur-md">
                            {p.tag}
                          </span>
                        )}
                      </div>
                      <div className="flex flex-1 flex-col gap-3 p-6">
                        <h3 className="text-[16.5px] font-semibold leading-snug tracking-[-0.01em] text-foreground transition-colors duration-300 group-hover:text-primary">
                          {p.title}
                        </h3>
                        {p.excerpt && (
                          <p className="line-clamp-3 text-[13.5px] leading-relaxed text-foreground/55">{p.excerpt}</p>
                        )}
                        <span className="mt-auto flex items-center gap-2.5 border-t border-foreground/[0.07] pt-4 text-[12px] text-foreground/42">
                          <span>{fmt(p.published_at)}</span>
                          <span className="h-1 w-1 rounded-full bg-foreground/20" />
                          <span>{p.read_minutes ?? 4} min</span>
                          <ArrowRight className="ml-auto h-3.5 w-3.5 text-primary opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100" />
                        </span>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </Stagger>
            </div>
          </section>
        )}

        {/* ---------------- CLOSING STRIP ---------------- */}
        {!loading && (
          <section className="pb-24 lg:pb-32">
            <div className="container mx-auto max-w-[1120px] px-6 sm:px-8">
              <Reveal y={30}>
                <div className="relative overflow-hidden rounded-[28px] bg-primary px-8 py-14 sm:px-12 lg:px-16">
                  <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-white/[0.07] blur-3xl" />
                  <div className="pointer-events-none absolute -bottom-32 -left-24 h-80 w-80 rounded-full bg-white/[0.05] blur-3xl" />
                  <div className="relative flex flex-col items-start gap-8 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-primary-foreground/60">
                        Early access
                      </p>
                      <h2 className="mt-4 max-w-[18ch] text-[clamp(1.5rem,2.8vw,2.2rem)] font-bold leading-[1.12] tracking-[-0.03em] text-primary-foreground">
                        Read it here first. Then measure your own room.
                      </h2>
                      <p className="mt-4 max-w-[46ch] text-[15px] leading-relaxed text-primary-foreground/70">
                        Join the waitlist and we&apos;ll send new writing and early builds as soon as
                        your region opens up.
                      </p>
                    </div>
                    <Link
                      to="/pricing"
                      className="group inline-flex flex-shrink-0 items-center gap-2.5 rounded-full bg-background px-8 py-4 text-[15px] font-semibold text-primary transition-transform duration-300 hover:scale-[1.03]"
                    >
                      Start for 69p
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
