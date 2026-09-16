import { type LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { Reveal, Stagger, staggerItem } from '@/components/premium/Motion';
import { Tilt } from './primitives';

export type Persona = { icon: LucideIcon; t: string; d: string; image: string };

/* ------------------------------------------------------------------ *
 *  Who it's for — a photo-backed mosaic instead of a bare icon grid.
 *  Every card is a real room, tilted toward the cursor, with the
 *  persona's icon and copy sitting on a gradient over it — so the
 *  section reads as "real work, real rooms" rather than a label list.
 * ------------------------------------------------------------------ */
export function WhoItsFor({ personas }: { personas: Persona[] }) {
  return (
    <section className="relative overflow-hidden border-y border-foreground/[0.07] bg-[hsl(168_20%_97.5%)] py-16 lg:py-20">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(hsl(168_30%_20%/0.035)_1px,transparent_1px),linear-gradient(90deg,hsl(168_30%_20%/0.035)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_75%_60%_at_50%_0%,#000,transparent)]" />
      </div>

      <div className="container relative mx-auto max-w-[1200px] px-6 sm:px-8">
        <Reveal className="mx-auto max-w-[640px] text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-primary">Who it's for</p>
          <h2 className="mx-auto mt-5 max-w-[24ch] text-[clamp(1.9rem,4vw,3.2rem)] font-bold leading-[1.08] tracking-[-0.02em] text-foreground">
            Built for everyone who works in rooms.
          </h2>
          <p className="mx-auto mt-5 max-w-[52ch] text-[15.5px] leading-relaxed text-foreground/55">
            One photo, many jobs — from a first renovation to staging a listing.
          </p>
        </Reveal>

        <Stagger className="mt-12 grid grid-cols-2 gap-3.5 sm:grid-cols-4 sm:gap-5" gap={0.06}>
          {personas.map(({ icon: Icon, t, d, image }) => (
            <motion.div key={t} variants={staggerItem}>
              <Tilt max={7} innerClassName="rounded-2xl">
                <div className="group relative aspect-[4/5] overflow-hidden rounded-2xl border border-foreground/[0.08] shadow-[0_18px_44px_-28px_hsl(168_30%_15%/0.35)] transition-shadow duration-400 hover:shadow-[0_28px_60px_-24px_hsl(168_30%_15%/0.5)]">
                  <img
                    src={image}
                    alt=""
                    loading="lazy"
                    className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/92 via-ink/35 to-ink/5 transition-opacity duration-400 group-hover:from-ink/95" />
                  <div
                    aria-hidden
                    className="shine-sweep pointer-events-none absolute inset-y-0 -left-1/4 w-1/4 -skew-x-12 bg-[linear-gradient(90deg,transparent,hsl(0_0%_100%/0.35),transparent)] mix-blend-overlay"
                  />

                  <div className="absolute inset-0 flex flex-col justify-end p-3.5 sm:p-4">
                    <span className="mb-2.5 flex h-9 w-9 items-center justify-center rounded-xl bg-white/15 ring-1 ring-white/20 backdrop-blur-md transition-all duration-400 group-hover:scale-110 group-hover:bg-mint group-hover:ring-mint/40">
                      <Icon className="h-4 w-4 text-white transition-colors duration-400 group-hover:text-ink" />
                    </span>
                    <p className="text-[13.5px] font-bold leading-tight text-white sm:text-[14px]">{t}</p>
                    <p className="mt-1 text-[11px] leading-snug text-white/70 sm:text-[11.5px]">{d}</p>
                  </div>
                </div>
              </Tilt>
            </motion.div>
          ))}
        </Stagger>
      </div>
    </section>
  );
}
