import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';

import { SEO } from '@/components/shared/SEO';
import { Reveal, Stagger, staggerItem } from '@/components/premium/Motion';
import { BeforeAfterSlider } from '@/components/shared/BeforeAfterSlider';
import { TEMPLATES } from '@/lib/templates';

/**
 * Explore — a lookbook, not another picker. Templates.tsx is for "I know
 * roughly what I want, apply it to my photo"; this is "show me what's
 * possible" before that. The hero slider is a real before/after pair (the
 * same room, empty vs. redesigned — see src/components/premium/DesignGenerator.tsx
 * for the same verified pair used on the marketing site), not a claim about
 * any specific template photo below it.
 */
export default function Explore() {
  return (
    <>
      <SEO title="Explore | ThinkDecor" description="See what Mantha AI can do before you try it on your own room." />

      <Reveal>
        <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-primary">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          Explore
        </p>
        <h1 className="mt-2 font-display text-[clamp(1.9rem,3.4vw,2.6rem)] font-normal tracking-[-0.01em] text-foreground">
          See what's possible
        </h1>
        <p className="mt-1 max-w-[56ch] text-[15px] text-foreground/55">
          A real room, the same walls and windows, one before and after. Drag to compare — then try it on
          your own.
        </p>
      </Reveal>

      <Reveal delay={0.08} y={24} className="mt-7">
        <div className="overflow-hidden rounded-[26px] border border-border/70 bg-card">
          <BeforeAfterSlider
            beforeSrc="/assets/samples/empty_room.png"
            afterSrc="/assets/samples/styled_room.png"
            beforeAlt="An empty room before a Mantha redesign"
            afterAlt="The same room, redesigned by Mantha AI"
            aspectRatio="aspect-[16/9]"
          />
          <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4">
            <span className="inline-flex items-center gap-1.5 text-[12.5px] text-foreground/55">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              Same architecture, same light — only the surfaces changed.
            </span>
            <Link
              to="/app/create"
              className="inline-flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[13px] font-semibold text-primary-foreground transition-transform duration-300 hover:scale-[1.03]"
            >
              Try it on your room <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </Reveal>

      {/* ---------------- lookbook ---------------- */}
      <div className="mt-14">
        <Reveal>
          <h2 className="text-[13px] font-medium uppercase tracking-[0.2em] text-foreground/45">
            {TEMPLATES.length} looks to start from
          </h2>
        </Reveal>

        <Stagger className="mt-6 flex flex-col gap-4">
          {TEMPLATES.map((t, i) => (
            <motion.article
              key={t.key}
              variants={staggerItem}
              className={`group grid gap-0 overflow-hidden rounded-[26px] border border-border/70 bg-card transition-all duration-300 hover:border-primary/30 hover:shadow-[0_28px_60px_-36px_hsl(168_40%_15%/0.4)] sm:grid-cols-2 ${
                i % 2 === 1 ? 'sm:[direction:rtl]' : ''
              }`}
            >
              <div className="relative aspect-[4/3] overflow-hidden sm:aspect-auto" style={{ direction: 'ltr' }}>
                <img
                  src={t.image}
                  alt={`${t.label} interior style`}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              </div>
              <div className="flex flex-col justify-center gap-4 p-8" style={{ direction: 'ltr' }}>
                {t.featured && (
                  <span className="inline-flex w-max items-center rounded-full bg-primary/10 px-2.5 py-1 text-[11px] font-semibold text-primary">
                    Popular
                  </span>
                )}
                <h3 className="font-display text-[28px] font-medium leading-[1.1] text-foreground">{t.label}</h3>
                <p className="max-w-[46ch] text-[15px] leading-relaxed text-foreground/58">{t.description}</p>
                <div className="flex flex-wrap gap-1.5">
                  {t.tags.map((tagName) => (
                    <span key={tagName} className="rounded-full bg-secondary px-2.5 py-1 text-[11.5px] text-foreground/60">
                      {tagName}
                    </span>
                  ))}
                </div>
                <Link
                  to={`/app/create?template=${t.key}`}
                  className="mt-1 inline-flex w-max items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-[13.5px] font-semibold text-primary-foreground transition-transform duration-300 hover:scale-[1.03]"
                >
                  Try {t.label} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </motion.article>
          ))}
        </Stagger>
      </div>
    </>
  );
}
