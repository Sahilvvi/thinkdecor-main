import {
  createContext, useCallback, useContext, useEffect, useId, useLayoutEffect, useRef,
  type ReactNode, type RefObject,
} from 'react';
import { useInView } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Stacking panels — the landing page's signature scroll mechanic.
 *
 * Every <StackPanel> sticks to the top of the viewport, and the next one
 * slides up over it. While a panel is being covered it scales down slightly
 * and darkens, so the sections read as a deck of cards being dealt over one
 * another rather than a flat scroll.
 *
 * Ported from the design prototype (prototype.html), keeping its geometry
 * exactly: a panel shorter than the free viewport height sticks under the
 * header; a taller one sticks once its bottom reaches the screen bottom, so
 * you always see a panel's end before the next one starts covering it.
 *
 * Coverage is written to a `--cov` custom property (0 → 1) and read by CSS
 * for the dimming overlay, so the per-frame work stays a single style write
 * per panel.
 *
 * The sticky/scale/dimming geometry below is tuned for desktop panel
 * proportions and assumes a panel is short relative to viewport height.
 * Below `DESKTOP_QUERY`, most of these sections collapse to a single
 * stacked column (see their own `lg:grid-cols-...` classes) and get much
 * taller than the viewport, which pushes this math into ranges it was
 * never designed for — panels barely stick before the next one starts
 * covering them, reading as overlapping, half-loaded cards under a
 * flickering dark veil. Rather than re-derive per-breakpoint geometry, the
 * whole mechanic is switched off below that width: panels render in plain
 * document flow with no sticky/scale/dimming at all.
 */

const GAP = 16;
/** How much a fully covered panel shrinks. */
const SCALE = 0.045;
/** Space kept clear at the top for the fixed header. */
const HEADER_OFFSET = 84;
/** Matches the `lg` breakpoint these sections already collapse to a single column at. */
const DESKTOP_QUERY = '(min-width: 1024px)';

/**
 * True for anything rendered inside a <StackPanel>. Framer Motion's
 * useInView (the hook behind <Reveal>/<RevealWords>/<Stagger>) never
 * reports true for content this deep in a sticky ancestor — verified with
 * a plain IntersectionObserver on the same element reporting
 * isIntersecting:true, ratio:1 while Framer's hook stayed stuck false — so
 * content here leans on the panel's own stacking/covering motion instead
 * of a redundant, broken scroll-fade. See Motion.tsx for the opt-out.
 */
const IsStackedContext = createContext(false);
export const useIsStacked = () => useContext(IsStackedContext);

/**
 * Drop-in replacement for framer-motion's useInView: identical outside a
 * <StackPanel>, but treats the element as always in view inside one (see
 * useIsStacked's doc comment for why the real observer can't be trusted
 * there).
 */
export function useInViewOrStacked(
  ref: RefObject<Element>,
  options?: Parameters<typeof useInView>[1],
) {
  const stacked = useIsStacked();
  const observed = useInView(ref, options);
  return stacked || observed;
}

interface StackContext {
  register: (el: HTMLElement) => () => void;
}

const Ctx = createContext<StackContext | null>(null);

export function StackPanelGroup({ children, className }: { children: ReactNode; className?: string }) {
  const panels = useRef<HTMLElement[]>([]);
  const frame = useRef(0);
  const isDesktopRef = useRef(
    typeof window !== 'undefined' ? window.matchMedia(DESKTOP_QUERY).matches : true,
  );

  const reduce =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /** Clears any sticky/scale/dimming inline styles so panels sit in plain flow. */
  const resetPanels = useCallback(() => {
    panels.current.forEach((p) => {
      p.style.top = '';
      p.style.zIndex = '';
      p.style.transform = '';
      p.style.transformOrigin = '';
      p.style.setProperty('--cov', '0');
      delete p.dataset.stackTop;
    });
  }, []);

  /** Coverage pass: runs per scroll frame, one style write per panel. */
  const cover = useCallback(() => {
    if (!isDesktopRef.current) return;
    const H = window.innerHeight;
    panels.current.forEach((p, i) => {
      const next = panels.current[i + 1];
      const top = Number(p.dataset.stackTop) || 0;
      let c = 0;
      if (next) {
        const r = next.getBoundingClientRect().top;
        c = Math.max(0, Math.min(1, (H - r) / (H - Math.max(top, 0))));
      }
      p.style.setProperty('--cov', c.toFixed(3));
      if (!reduce) {
        p.style.transformOrigin = `50% ${-top + H / 2}px`;
        p.style.transform = c > 0.002 ? `scale(${(1 - SCALE * c).toFixed(4)})` : '';
      }
    });
  }, [reduce]);

  /** Layout pass: decides where each panel sticks, then re-runs coverage. */
  const layout = useCallback(() => {
    if (!isDesktopRef.current) { resetPanels(); return; }
    const H = window.innerHeight;
    panels.current.forEach((p, i) => {
      const h = p.offsetHeight;
      const top = h <= H - HEADER_OFFSET ? HEADER_OFFSET : H - h;
      p.style.top = `${top}px`;
      p.dataset.stackTop = String(top);
      p.style.zIndex = String(i + 1);
    });
    cover();
  }, [cover, resetPanels]);

  const register = useCallback(
    (el: HTMLElement) => {
      panels.current = [...panels.current, el].sort((a, b) =>
        a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
      );
      layout();
      return () => {
        panels.current = panels.current.filter((p) => p !== el);
        layout();
      };
    },
    [layout],
  );

  useEffect(() => {
    const onScroll = () => {
      if (frame.current) return;
      frame.current = requestAnimationFrame(() => {
        frame.current = 0;
        cover();
      });
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', layout);

    // Panels change height as images load and as content reflows, and a stale
    // sticky offset is what makes this effect look broken, so re-measure.
    const ro = new ResizeObserver(() => layout());
    panels.current.forEach((p) => ro.observe(p));

    // Crossing the desktop breakpoint (resize, rotate, devtools) flips the
    // mechanic on/off — re-layout so panels pick up the right mode.
    const mq = window.matchMedia(DESKTOP_QUERY);
    const onMqChange = () => { isDesktopRef.current = mq.matches; layout(); };
    mq.addEventListener('change', onMqChange);

    layout();
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', layout);
      ro.disconnect();
      mq.removeEventListener('change', onMqChange);
      if (frame.current) cancelAnimationFrame(frame.current);
    };
  }, [cover, layout]);

  return (
    <Ctx.Provider value={{ register }}>
      <div className={cn('stack-group', className)} style={{ ['--stack-gap' as string]: `${GAP}px` }}>
        {children}
      </div>
    </Ctx.Provider>
  );
}

export function StackPanel({
  children,
  className,
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const ctx = useContext(Ctx);
  const fallbackId = useId();

  useLayoutEffect(() => {
    if (!ref.current || !ctx) return;
    return ctx.register(ref.current);
  }, [ctx]);

  return (
    <section
      ref={ref}
      id={id ?? fallbackId}
      className={cn(
        // bg-background: every panel needs an opaque fill of its own — most
        // of these sections were built for a flat page sharing one
        // background, so without this default a panel with no full-bleed
        // background of its own (e.g. DesignGenerator) goes see-through at
        // its edges and shows whatever is stacked underneath as you scroll.
        // A panel with its own background (a className passed in) overrides
        // this via twMerge below.
        'stack-panel relative isolate overflow-hidden rounded-[28px] bg-background',
        // The covering panel casts a shadow up onto the one beneath it.
        '[&:not(:first-child)]:shadow-[0_-26px_50px_-18px_rgba(0,40,35,0.45),0_-1px_0_rgba(255,255,255,0.55)]',
        className,
      )}
    >
      <IsStackedContext.Provider value={true}>{children}</IsStackedContext.Provider>
      {/* Dimming veil, driven by --cov from the coverage pass. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[90] rounded-[inherit] bg-[#001F1B]"
        style={{ opacity: 'calc(var(--cov, 0) * 0.5)' }}
      />
    </section>
  );
}
