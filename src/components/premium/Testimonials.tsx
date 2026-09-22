import { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Star } from 'lucide-react';
import { Reveal } from './Motion';

/** Sample quotes, not verified reviews — labelled as such, same as elsewhere on the site. */
const SLIDES = [
  {
    image: '/assets/rooms/t-teal.jpg', caption: 'Harbour Teal · Living room', stars: 5,
    quote: "I was about to buy four litres of teal on a hunch. Saw it on my own wall first and went two shades lighter. Best 69p I've spent.",
    name: 'Priya', role: 'Homeowner, Leeds',
  },
  {
    image: '/assets/rooms/room-bedroom.jpg', caption: 'Evening Noir · Bedroom', stars: 5,
    quote: 'Tapping the bed to see what it cost was the bit that sold me. I priced the whole room before leaving the sofa.',
    name: 'Tom', role: 'Renter, Bristol',
  },
  {
    image: '/assets/rooms/s-scandi.jpg', caption: 'Scandinavian · Dining', stars: 5,
    quote: 'I send clients a preview instead of a mood board now. They say yes faster because it\'s their room, not a stock photo.',
    name: 'Aisha', role: 'Interior designer, London',
  },
  {
    image: '/assets/rooms/room-kitchen.jpg', caption: 'Warm Oak · Kitchen', stars: 4,
    quote: 'The floor swap is uncanny. The tiles follow the angle of the room, and the chairs stayed exactly where they were.',
    name: 'Daniel', role: 'Homeowner, Manchester',
  },
  {
    image: '/assets/rooms/tpl-wallpaper.jpg', caption: 'Star wallpaper · Nursery', stars: 5,
    quote: 'Wallpaper is expensive to get wrong. Being able to try three patterns on the nursery wall saved us a very awkward weekend.',
    name: 'Meera', role: 'Parent, Birmingham',
  },
  {
    image: '/assets/rooms/room-hall.jpg', caption: 'Maximalism · Hall', stars: 5,
    quote: "My hallway is tiny, so I wanted to be sure dark walls wouldn't shrink it. They didn't. Painted it the next Saturday.",
    name: 'Hannah', role: 'Homeowner, Glasgow',
  },
];

/**
 * Testimonials — a horizontal, scroll-snapped card track (not a grid):
 * prev/next buttons, dot indicators, autoplay every 5s that pauses on
 * hover/focus, and loops at either end. Sample quotes, not verified
 * reviews, same disclosure as the rest of the site's social proof.
 */
export function Testimonials() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const perView = usePerView();

  const scrollToIndex = useCallback((i: number) => {
    const track = trackRef.current;
    if (!track) return;
    const card = track.children[i] as HTMLElement | undefined;
    if (card) track.scrollTo({ left: card.offsetLeft - track.offsetLeft, behavior: 'smooth' });
  }, []);

  const go = useCallback(
    (dir: 1 | -1) => {
      const maxIndex = Math.max(0, SLIDES.length - perView);
      let next = active + dir;
      if (next < 0) next = maxIndex;
      if (next > maxIndex) next = 0;
      setActive(next);
      scrollToIndex(next);
    },
    [active, perView, scrollToIndex],
  );

  // Sync the active dot to whatever the user actually scrolled/swiped to.
  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const card = track.children[0] as HTMLElement | undefined;
        const step = card ? card.offsetWidth + 20 : 1;
        setActive(Math.round(track.scrollLeft / step));
      });
    };
    track.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      track.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => go(1), 5000);
    return () => clearInterval(id);
  }, [paused, go]);

  const dotCount = Math.max(1, SLIDES.length - perView + 1);

  return (
    <section
      id="testimonials"
      aria-roledescription="carousel"
      aria-label="Testimonials"
      className="relative scroll-mt-24 overflow-hidden py-16 lg:py-20"
    >
      <Reveal className="container relative z-10 mx-auto flex max-w-[1200px] flex-wrap items-end justify-between gap-6 px-6 sm:px-8">
        <div>
          <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-primary">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            From early users · sample quotes
          </p>
          <h2 className="mt-4 font-display text-[clamp(1.9rem,4vw,3.2rem)] font-medium leading-[1.05] text-foreground">
            Testimo<em className="text-primary not-italic font-normal italic">nials</em>
          </h2>
        </div>
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous testimonial"
            className="grid h-[52px] w-[52px] place-items-center rounded-full bg-card text-primary shadow-[inset_0_0_0_1.5px_hsl(var(--primary))] transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next testimonial"
            className="grid h-[52px] w-[52px] place-items-center rounded-full bg-card text-primary shadow-[inset_0_0_0_1.5px_hsl(var(--primary))] transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </Reveal>

      <div
        ref={trackRef}
        tabIndex={0}
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowRight') { e.preventDefault(); go(1); }
          if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); }
        }}
        className="container mx-auto mt-10 grid auto-cols-[calc((100%-40px)/3)] grid-flow-col gap-5 overflow-x-auto px-6 pb-1 [scroll-snap-type:x_mandatory] [scrollbar-width:none] max-[1000px]:auto-cols-[calc((100%-20px)/2)] max-[640px]:auto-cols-[88%] sm:px-8 [&::-webkit-scrollbar]:hidden"
      >
        {SLIDES.map((s) => (
          <article
            key={s.name}
            className="flex flex-col overflow-hidden rounded-[22px] bg-card shadow-[inset_0_0_0_1px_hsl(var(--border))] [scroll-snap-align:start]"
          >
            <figure className="relative m-0 aspect-video overflow-hidden">
              <img src={s.image} alt="" className="h-full w-full object-cover" />
              <figcaption className="absolute bottom-3 left-3 rounded-full bg-[hsl(168_100%_17%/0.8)] px-2.5 py-1.5 font-label text-[10.5px] font-medium uppercase tracking-[0.08em] text-white">
                {s.caption}
              </figcaption>
            </figure>
            <div className="flex flex-1 flex-col gap-3.5 p-6">
              <p aria-label={`${s.stars} out of 5`} className="flex gap-0.5 text-primary">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5" fill={i < s.stars ? 'currentColor' : 'none'} />
                ))}
              </p>
              <blockquote className="flex-1 font-display text-[20px] leading-[1.35] text-primary">
                &ldquo;{s.quote}&rdquo;
              </blockquote>
              <div className="flex items-center gap-3 border-t border-border pt-3.5">
                <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-[hsl(var(--primary))] font-display text-[18px] text-white">
                  {s.name[0]}
                </span>
                <span>
                  <b className="block font-label text-[15.5px] font-bold text-primary">{s.name}</b>
                  <span className="text-[13.5px] leading-[1.3] text-muted-foreground">{s.role}</span>
                </span>
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 flex justify-center gap-2" aria-hidden="true">
        {Array.from({ length: dotCount }).map((_, i) => (
          <button
            key={i}
            type="button"
            tabIndex={-1}
            onClick={() => { setActive(i); scrollToIndex(i); }}
            className={`h-2 rounded-full transition-all duration-300 ${i === Math.min(active, dotCount - 1) ? 'w-7 bg-primary' : 'w-2 bg-border'}`}
          />
        ))}
      </div>
    </section>
  );
}

/** Matches the track's own responsive auto-cols breakpoints, so dots/indices line up with what's actually visible. */
function usePerView() {
  const [perView, setPerView] = useState(3);
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setPerView(w <= 640 ? 1 : w <= 1000 ? 2 : 3);
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return perView;
}
