import {
  Bath, BedDouble, ChefHat, Laptop, type LucideIcon, Sofa, UtensilsCrossed,
} from 'lucide-react';
import { Reveal } from '@/components/premium/Motion';
import { ROOM_TYPES, TEMPLATES, type RoomType } from '@/lib/templates';
import { SectionLabel } from './primitives';
import { pad } from './hooks';

const ROOM_ICONS: Record<RoomType, LucideIcon> = {
  living: Sofa,
  bedroom: BedDouble,
  kitchen: ChefHat,
  dining: UtensilsCrossed,
  office: Laptop,
  bathroom: Bath,
};

// The section's own background — the edge fades below match this exactly,
// same trick "trusted by" logo strips use, so a row fades into its band
// rather than into a visible box. Keep this in sync with the section class.
const BAND_BG = 'hsl(168 20% 97%)';

/**
 * Two counter-scrolling rows, edge to edge like the rest of the page's
 * full-bleed sections — not a centred card, which just reads as gaps on a
 * wide screen. Both rows keep moving no matter where the cursor is or
 * whether the OS asks for reduced motion — this is a plain, constant-speed
 * sideways scroll, the same category as a stock ticker or a logo wall, and
 * a soft light sweeps across each every few seconds. Hovering one style
 * card still lifts it clear of its neighbours, so it reads as a real,
 * pickable thing without the row itself needing to stop.
 */
export function StyleMarquee() {
  // Each row renders its list twice so the -50% loop lands on an identical frame.
  const styles = [...TEMPLATES, ...TEMPLATES];
  const rooms = [...ROOM_TYPES, ...ROOM_TYPES, ...ROOM_TYPES];

  return (
    <section
      aria-label="Styles and rooms Mantha designs"
      className="relative overflow-hidden border-y border-foreground/[0.07] py-10 sm:py-12"
      style={{ backgroundColor: BAND_BG }}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[22rem] w-[54rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse,hsl(168_100%_17%/0.05),transparent_65%)] blur-2xl"
      />

      <Reveal className="container relative z-10 mx-auto mb-7 flex max-w-[1240px] flex-wrap items-end justify-between gap-3 px-6 sm:px-8">
        <div>
          <SectionLabel className="text-foreground/50">Every room, every look</SectionLabel>
          <p className="mt-2.5 text-[16px] font-semibold tracking-[-0.01em] text-foreground sm:text-[18px]">
            Designs every room you live in.
          </p>
        </div>
        <span className="rounded-full border border-foreground/[0.08] bg-white/70 px-3.5 py-1.5 font-mono text-[10.5px] uppercase tracking-[0.18em] text-foreground/50 backdrop-blur-sm">
          {TEMPLATES.length} styles · {ROOM_TYPES.length} room types
        </span>
      </Reveal>

      <div className="relative overflow-hidden">
        <div className="animate-marquee-left-live gap-3.5 pr-3.5" style={{ animationDuration: '32s' }}>
          {[...styles, ...styles].map((t, i) => (
            <span
              key={`${t.key}-${i}`}
              className="group flex items-center gap-3 rounded-full border border-foreground/[0.08] bg-white py-1.5 pl-1.5 pr-5 shadow-[0_6px_18px_-12px_hsl(168_30%_15%/0.3)] transition-all duration-300 ease-out hover:z-10 hover:-translate-y-1 hover:scale-[1.035] hover:border-primary/30 hover:shadow-[0_20px_36px_-16px_hsl(168_30%_15%/0.4)]"
            >
              <img
                src={t.image}
                alt=""
                loading="lazy"
                className="h-9 w-9 flex-shrink-0 rounded-full object-cover ring-2 ring-white transition-transform duration-300 group-hover:scale-110"
              />
              <span className="flex flex-col leading-tight">
                <span className="whitespace-nowrap text-[14px] font-semibold text-foreground">{t.label}</span>
                <span className="whitespace-nowrap font-mono text-[9.5px] font-medium uppercase tracking-[0.12em] text-primary/70">
                  {t.tags[0]}
                </span>
              </span>
              <span className="ml-0.5 font-mono text-[10px] tabular-nums text-foreground/30">
                {pad((i % TEMPLATES.length) + 1)}
              </span>
            </span>
          ))}
        </div>
        <ShineSweep delay={0.4} />
        <EdgeFade side="left" />
        <EdgeFade side="right" />
      </div>

      <div className="relative mt-5 overflow-hidden">
        <div className="animate-marquee-right-live gap-3" style={{ animationDuration: '38s' }}>
          {[...rooms, ...rooms].map((r, i) => {
            const Icon = ROOM_ICONS[r.key];
            return (
              <span
                key={`${r.key}-${i}`}
                className="flex items-center gap-2 whitespace-nowrap rounded-full border border-foreground/[0.07] bg-white/70 px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.16em] text-foreground/45 backdrop-blur-sm transition-colors duration-300 hover:border-primary/25 hover:bg-white hover:text-foreground/75"
              >
                <Icon className="h-3 w-3 text-primary/60" />
                {r.label}
              </span>
            );
          })}
        </div>
        <ShineSweep delay={2.6} />
        <EdgeFade side="left" />
        <EdgeFade side="right" />
      </div>
    </section>
  );
}

/** A soft diagonal band of light that glides across a row every few seconds. */
function ShineSweep({ delay = 0 }: { delay?: number }) {
  return (
    <div
      aria-hidden
      className="shine-sweep pointer-events-none absolute inset-y-0 -left-1/4 z-10 w-1/4 -skew-x-12 bg-[linear-gradient(90deg,transparent,hsl(0_0%_100%/0.55),transparent)] mix-blend-overlay"
      style={{ animationDelay: `${delay}s` }}
    />
  );
}

/**
 * Fades a row's edge to the section's own background colour (BAND_BG),
 * not to transparent — an alpha mask barely reads against a light page,
 * and fading to the exact band colour is the same trick "trusted by" logo
 * strips use so the row seems to emerge from the section itself.
 */
function EdgeFade({ side }: { side: 'left' | 'right' }) {
  const dir = side === 'left' ? 'to right' : 'to left';
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-y-0 z-20 w-16 sm:w-28 ${side === 'left' ? 'left-0' : 'right-0'}`}
      style={{ backgroundImage: `linear-gradient(${dir}, ${BAND_BG}, ${BAND_BG} 15%, transparent)` }}
    />
  );
}
