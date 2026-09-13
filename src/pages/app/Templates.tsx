import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Search } from 'lucide-react';

import { SEO } from '@/components/shared/SEO';
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

      <div>
        <h1 className="text-[clamp(1.7rem,3vw,2.3rem)] font-bold tracking-[-0.025em] text-foreground">Templates</h1>
        <p className="mt-1 text-[15px] text-foreground/55">
          Start from a style. You can still describe your own changes on top.
        </p>
      </div>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {tags.map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTag(t)}
              aria-pressed={tag === t}
              className={`rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${
                tag === t
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border/70 bg-card text-foreground/65 hover:text-foreground'
              }`}
            >
              {t}
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
      </div>

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
        <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((t) => (
            <article
              key={t.key}
              className="group flex flex-col overflow-hidden rounded-[22px] border border-border/70 bg-card transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_22px_50px_-28px_hsl(168_40%_15%/0.45)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={t.image}
                  alt={`${t.label} interior style`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {t.featured && (
                  <span className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-primary backdrop-blur">
                    Featured
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-5">
                <h2 className="text-[16px] font-semibold text-foreground">{t.label}</h2>
                <p className="mt-1 text-[13.5px] leading-relaxed text-foreground/55">{t.description}</p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {t.tags.map((tagName) => (
                    <span key={tagName} className="rounded-full bg-secondary px-2.5 py-1 text-[11.5px] text-foreground/60">
                      {tagName}
                    </span>
                  ))}
                </div>
                <Link
                  to={`/app/create?template=${t.key}`}
                  className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-[13.5px] font-semibold text-primary-foreground transition-transform duration-300 hover:scale-[1.02]"
                >
                  Use this template
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </>
  );
}
