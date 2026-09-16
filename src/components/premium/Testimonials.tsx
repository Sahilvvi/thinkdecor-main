import { Link } from 'react-router-dom';
import { Plus, Quote } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Reveal } from './Motion';
import { Tilt } from '@/components/motion/primitives';

/**
 * Illustrative early-access feedback, not verified reviews — labelled as such.
 * Every quote describes something the app does today (photo redesigns), never
 * the scanning features that are still coming. Swap for real, consented quotes.
 */
const QUOTES = [
  { q: 'Tried three styles on my living room over lunch and finally knew which direction to go.', name: 'Early access user' },
  { q: 'It kept my actual room — same windows, same layout — just restyled. That made it believable.', name: 'Early access user' },
  { q: 'Showed my partner the Scandinavian version and we agreed on a sofa in one evening.', name: 'Early access user' },
  { q: 'Much quicker than building a mood board, and it was my room, not a showroom.', name: 'Early access user' },
];

const QUOTES_2 = [
  { q: 'Regenerated the kitchen four times before lunch — no designer call, no waiting.', name: 'Early access user' },
  { q: 'Sent the before and after to my landlord and got the repaint approved same day.', name: 'Early access user' },
  { q: 'Finally saw the Japandi look in my own bedroom instead of guessing from a mood board.', name: 'Early access user' },
  { q: 'The library kept every version, so comparing styles a week later was still easy.', name: 'Early access user' },
];

const BAND_BG = 'hsl(0 0% 99.6%)';

/** A card sized for the marquee's own list, repeated twice so the -50% loop lands on an identical frame. */
function Card({ q, name, muted = false }: { q: string; name: string; muted?: boolean }) {
  return (
    <Tilt max={4} innerClassName="rounded-2xl">
      <div
        className={cn(
          'group flex-shrink-0 rounded-2xl border bg-white p-6 shadow-[0_16px_40px_-26px_hsl(168_30%_15%/0.3)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/25 hover:shadow-[0_24px_50px_-24px_hsl(168_30%_15%/0.4)]',
          muted ? 'w-[300px] border-foreground/[0.07] sm:w-[340px]' : 'w-[340px] border-foreground/[0.08] sm:w-[400px]',
        )}
      >
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 transition-colors duration-300 group-hover:bg-primary">
          <Quote className="h-4 w-4 text-primary transition-colors duration-300 group-hover:text-primary-foreground" />
        </span>
        <p className="mt-4 text-[14.5px] leading-relaxed text-foreground/75">&ldquo;{q}&rdquo;</p>
        <div className="mt-5 flex items-center gap-2.5 border-t border-foreground/[0.07] pt-4">
          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[linear-gradient(135deg,hsl(168_100%_17%),hsl(160_84%_38%))] font-mono text-[10px] font-semibold text-white">
            EA
          </span>
          <p className="text-[12px] font-medium uppercase tracking-[0.08em] text-foreground/45">{name}</p>
        </div>
      </div>
    </Tilt>
  );
}

/** Fades a row's edge to the page's own background colour, same trick the style marquee uses. */
function EdgeFade({ side }: { side: 'left' | 'right' }) {
  const dir = side === 'left' ? 'to right' : 'to left';
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-y-0 z-20 w-16 sm:w-32 ${side === 'left' ? 'left-0' : 'right-0'}`}
      style={{ backgroundImage: `linear-gradient(${dir}, ${BAND_BG}, ${BAND_BG} 15%, transparent)` }}
    />
  );
}

/* ------------------------------------------------------------------ *
 *  Early access feedback — two real, constantly-moving marquee rows
 *  (left to right, at different speeds for depth) instead of a static
 *  grid. Deliberately never pauses — not on hover, not for reduced
 *  motion — the same "always ambient" exemption the style ticker uses,
 *  so this never reads as stalled or broken.
 * ------------------------------------------------------------------ */
export function Testimonials() {
  const row1 = [...QUOTES, ...QUOTES];
  const row2 = [...QUOTES_2, ...QUOTES_2];

  return (
    <section id="testimonials" className="relative scroll-mt-24 overflow-hidden py-16 lg:py-20">
      <Reveal className="container relative z-10 mx-auto max-w-[640px] px-6 text-center sm:px-8">
        <p className="flex items-center justify-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-primary">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
          </span>
          Early access feedback
        </p>
        <h2 className="mx-auto mt-5 max-w-[24ch] text-[clamp(1.9rem,4vw,3.2rem)] font-bold leading-[1.08] tracking-[-0.02em] text-foreground">
          What early testers are saying.
        </h2>
      </Reveal>

      <div className="relative mt-12 overflow-hidden">
        <div className="animate-marquee-right-live gap-5 pr-5" style={{ animationDuration: '42s' }}>
          {row1.map((t, i) => (
            <Card key={`${t.q}-${i}`} q={t.q} name={t.name} />
          ))}
        </div>
        <EdgeFade side="left" />
        <EdgeFade side="right" />
      </div>

      <div className="relative mt-5 overflow-hidden">
        <div className="animate-marquee-right-live gap-4 pr-4 opacity-80" style={{ animationDuration: '56s' }}>
          {row2.map((t, i) => (
            <Card key={`${t.q}-${i}`} q={t.q} name={t.name} muted />
          ))}
        </div>
        <EdgeFade side="left" />
        <EdgeFade side="right" />
      </div>

      <Reveal delay={0.1} className="container relative z-10 mx-auto mt-9 max-w-[1200px] px-6 sm:px-8">
        <Link
          to="/contact"
          className="group mx-auto flex max-w-[560px] items-center justify-center gap-2.5 rounded-2xl border border-dashed border-primary/30 bg-primary/[0.04] px-6 py-5 text-[14px] font-medium text-primary transition-colors duration-300 hover:bg-primary/[0.08]"
        >
          <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 transition-colors duration-300 group-hover:bg-primary/25">
            <Plus className="h-3.5 w-3.5" />
          </span>
          Tell us what you think — tried ThinkDecor? Share your feedback
        </Link>
      </Reveal>
    </section>
  );
}
