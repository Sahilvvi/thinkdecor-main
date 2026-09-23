import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Search } from 'lucide-react';

import { SEO } from '@/components/shared/SEO';
import { Reveal, Stagger, staggerItem } from '@/components/premium/Motion';
import { TEMPLATES } from '@/lib/templates';

const ALL = 'All';

export default function Templates() {
  const [tag, setTag] = useState(ALL);
  const [query, setQuery] = useState('');

  const tags = useMemo(() => [ALL, ...Array.from(new Set(TEMPLATES.flatMap((t) => t.tags)))], []);

  const visible = TEMPLATES.filter((t) => {
    const matchesTag = tag === ALL || t.tags.includes(tag);
    const q = query.trim().toLowerCase();
    const matchesQuery = !q || t.label.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
    return matchesTag && matchesQuery;
  });

  return (
    <>
      <SEO title="Templates | ThinkDecor" description="Interior styles to start a redesign from." />

      <Reveal>
        <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-primary">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          {TEMPLATES.length} styles
        </p>
        <h1 className="mt-2 font-display text-[clamp(1.9rem,3.4vw,2.6rem)] font-normal tracking-[-0.01em] text-foreground">Templates</h1>
        <p className="mt-1 text-[15px] text-foreground/55">
          Start from a style. You can still describe your own changes on top.
        </p>
      </Reveal>

      <Reveal delay={0.06} className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex flex-wrap gap-2">
          {tags.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTag(t)}
              aria-pressed={tag === t}
              className={`relative rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${
                tag === t ? 'text-primary-foreground' : 'border border-border/70 bg-card text-foreground/65 hover:text-foreground'
              }`}
            >
              {tag === t && (
                <motion.span
                  layoutId="template-tag-active"
                  className="absolute inset-0 rounded-full bg-primary shadow-[0_8px_20px_-8px_hsl(168_100%_17%/0.5)]"
                  transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                />
              )}
              <span className="relative">{t}</span>
            </button>
          ))}
        </div>

        <label className="relative block sm:w-64">
          <span className="sr-only">Search templates</span>
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-foreground/40" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search styles"
            className="w-full rounded-full border border-border/70 bg-card py-2 pl-10 pr-4 text-[13.5px] outline-none transition-colors placeholder:text-foreground/40 focus:border-primary"
          />
        </label>
      </Reveal>

      {visible.length === 0 ? (
        <div className="mt-10 rounded-[22px] border border-dashed border-border px-6 py-12 text-center">
          <p className="text-[15px] font-semibold text-foreground">No styles match that search</p>
          <button
            type="button"
            onClick={() => { setQuery(''); setTag(ALL); }}
            className="mt-2 text-[14px] font-semibold text-primary hover:underline"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <Stagger className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" gap={0.05}>
          {visible.map((t) => (
            <motion.article
              key={t.key}
              variants={staggerItem}
              className="group flex flex-col overflow-hidden rounded-[22px] border border-border/70 bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_22px_50px_-28px_hsl(168_40%_15%/0.45)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={t.image}
                  alt={`${t.label} interior style`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <span className="absolute left-3 top-3 overflow-hidden rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-primary backdrop-blur">
                  {t.featured && (
                    <span
                      aria-hidden
                      className="shine-sweep pointer-events-none absolute inset-y-0 -left-1/4 w-1/4 -skew-x-12 bg-[linear-gradient(90deg,transparent,hsl(168_100%_17%/0.2),transparent)]"
                    />
                  )}
                  <span className="relative">{t.label}</span>
                </span>
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h2 className="text-[16px] font-semibold text-foreground">{t.label}</h2>
                <p className="mt-1 flex-1 text-[13.5px] leading-relaxed text-foreground/55">{t.description}</p>
                <Link
                  to={`/app/create?template=${t.key}`}
                  className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-[13.5px] font-semibold text-primary-foreground transition-transform duration-300 hover:scale-[1.02]"
                >
                  Use this template
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </motion.article>
          ))}
        </Stagger>
      )}
    </>
  );
}
