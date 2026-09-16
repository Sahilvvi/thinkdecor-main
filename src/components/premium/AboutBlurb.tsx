import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import { Magnetic, Reveal } from './Motion';
import { Tilt } from '@/components/motion/primitives';

const STATS = [
  { t: '7', d: 'Interior styles' },
  { t: 'Seconds', d: 'Not hours' },
  { t: 'UK', d: 'Built in Northampton' },
];

/** Short, honest brand explainer — no invented team members or stats, just what the product is. */
export function AboutBlurb() {
  return (
    <section id="about" className="relative scroll-mt-24 overflow-hidden py-16 lg:py-20">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(hsl(168_30%_20%/0.035)_1px,transparent_1px),linear-gradient(90deg,hsl(168_30%_20%/0.035)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_65%_75%_at_20%_50%,#000,transparent)]" />
        <div className="absolute -left-24 top-1/2 h-[24rem] w-[24rem] -translate-y-1/2 rounded-full bg-[radial-gradient(circle,hsl(168_100%_17%/0.06),transparent_65%)] blur-3xl" />
      </div>

      <div className="container relative mx-auto max-w-[1200px] px-6 sm:px-8">
        <div className="grid gap-12 rounded-[32px] border border-foreground/[0.08] bg-white/60 p-8 shadow-[0_30px_70px_-40px_hsl(168_30%_15%/0.3)] backdrop-blur-sm lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:p-14">
          <Reveal>
            <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-primary">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
              </span>
              About ThinkDecor
            </p>
            <h2 className="mt-5 text-[clamp(1.8rem,3.6vw,2.6rem)] font-bold leading-[1.1] tracking-[-0.025em] text-foreground">
              What is ThinkDecor?
            </h2>
            <div className="mt-4 flex items-center gap-1.5 text-[13px] text-foreground/50">
              <MapPin className="h-3.5 w-3.5 text-primary" />
              Northampton, United Kingdom
            </div>

            <p className="mt-6 max-w-[56ch] text-[15.5px] leading-relaxed text-foreground/62">
              ThinkDecor lets you upload a photo of any room and see it redesigned by
              Mantha AI — in the style you choose, keeping the walls and windows you
              already have. Try looks side by side, refine them in plain words, and keep
              every version in your library. Room scanning and measured floor plans are
              on the way.
            </p>

            <div className="mt-8 grid grid-cols-3 gap-3 border-t border-foreground/[0.08] pt-6">
              {STATS.map((s) => (
                <div key={s.d}>
                  <p className="text-[18px] font-bold tracking-[-0.02em] text-foreground">{s.t}</p>
                  <p className="mt-0.5 text-[11px] uppercase tracking-[0.1em] text-foreground/45">{s.d}</p>
                </div>
              ))}
            </div>

            <Magnetic className="mt-8 block w-max">
              <Link
                to="/contact"
                className="group inline-flex items-center gap-2.5 rounded-full bg-foreground px-6 py-3 text-[13.5px] font-semibold text-background transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
              >
                Get in touch
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </Magnetic>
          </Reveal>

          <Reveal y={30} blur={14} delay={0.1}>
            <Tilt max={5} innerClassName="rounded-[26px]">
              <div className="relative aspect-[4/5] overflow-hidden rounded-[26px] border border-foreground/[0.08] shadow-[0_30px_70px_-30px_hsl(168_30%_15%/0.4)] sm:aspect-[5/4] lg:aspect-[4/5]">
                <img
                  src="/assets/samples/styled_room.png"
                  alt="A room redesigned by Mantha AI"
                  loading="lazy"
                  className="absolute inset-0 h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink/75 via-transparent to-transparent" />
                <div
                  aria-hidden
                  className="shine-sweep pointer-events-none absolute inset-y-0 -left-1/4 w-1/4 -skew-x-12 bg-[linear-gradient(90deg,transparent,hsl(0_0%_100%/0.35),transparent)] mix-blend-overlay"
                />
                <div className="absolute bottom-5 left-5 right-5 flex items-center justify-between gap-3">
                  <span className="flex items-center gap-1.5 rounded-full border border-white/20 bg-ink/50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-white/85 backdrop-blur-md">
                    <span className="h-1.5 w-1.5 rounded-full bg-mint" /> Mantha AI
                  </span>
                  <span className="rounded-full border border-primary/30 bg-primary/80 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-primary-foreground backdrop-blur-md">
                    Live today
                  </span>
                </div>
              </div>
            </Tilt>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
