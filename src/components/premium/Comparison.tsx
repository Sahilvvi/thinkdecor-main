import { useRef, useState } from 'react';
import {
  AnimatePresence, motion, useInView, useMotionTemplate, useMotionValue, useReducedMotion,
} from 'framer-motion';
import { Crown, Layers, UserRound, X as XIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Reveal } from './Motion';
import { Tilt } from '../motion/primitives';

/* ------------------------------------------------------------------ *
 *  Why ThinkDecor — a dark, glass comparison against the two ways
 *  people plan a room today. The ThinkDecor column is lit as the
 *  winner, marks spring in on scroll, and "Highlight differences"
 *  narrows the list to what only ThinkDecor offers. Phones compare
 *  against one alternative at a time.
 * ------------------------------------------------------------------ */

type Competitor = 'moodBoards' | 'designer';
type Row = { feature: string; thinkdecor: boolean } & Record<Competitor, boolean>;

const ROWS: Row[] = [
  { feature: 'Starts from a photo of your own room', thinkdecor: true, moodBoards: false, designer: true },
  { feature: 'A finished redesign in seconds', thinkdecor: true, moodBoards: false, designer: false },
  { feature: 'Try several styles on the same room', thinkdecor: true, moodBoards: false, designer: false },
  { feature: 'Describe changes in plain words', thinkdecor: true, moodBoards: false, designer: true },
  { feature: 'Costs less than a tin of paint', thinkdecor: true, moodBoards: true, designer: false },
];

const COMPETITORS: { key: Competitor; label: string; icon: typeof Layers }[] = [
  { key: 'moodBoards', label: 'Mood boards', icon: Layers },
  { key: 'designer', label: 'Hiring a designer', icon: UserRound },
];

const DESKTOP_COLS = 'grid-cols-[1.7fr_1fr_1fr_1fr]';
const MOBILE_COLS = 'grid-cols-[1fr_4.75rem_4.75rem]';

const score = (key: 'thinkdecor' | Competitor) => ROWS.filter((r) => r[key]).length;
const onlyThinkDecor = (row: Row, against: Competitor[]) => against.every((c) => !row[c]);

export function Comparison() {
  const viewRef = useRef<HTMLDivElement>(null);
  const play = useInView(viewRef, { once: true, margin: '-15% 0px' });
  const [highlight, setHighlight] = useState(false);
  const [competitor, setCompetitor] = useState<Competitor>('moodBoards');

  const allCompetitors = COMPETITORS.map((c) => c.key);
  const desktopRows = highlight ? ROWS.filter((r) => onlyThinkDecor(r, allCompetitors)) : ROWS;
  const mobileRows = highlight ? ROWS.filter((r) => onlyThinkDecor(r, [competitor])) : ROWS;

  return (
    <section id="comparison" className="relative scroll-mt-24 overflow-hidden bg-ink py-20 text-white lg:py-28">
      {/* cinematic lighting */}
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-18rem] h-[36rem] w-[64rem] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse,hsl(162_72%_46%/0.18),transparent_65%)] blur-2xl" />
        <div className="absolute bottom-[-12rem] right-[-8rem] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(circle,hsl(168_100%_25%/0.3),transparent_65%)] blur-2xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_40%,#000,transparent)]" />
      </div>

      <div className="container relative mx-auto max-w-[1140px] px-6 sm:px-8">
        <Reveal className="mx-auto max-w-[720px] text-center">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.24em] text-mint backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-mint shadow-[0_0_10px_hsl(var(--mint))]" />
            Why ThinkDecor
          </p>
          <h2 className="mx-auto mt-6 max-w-[20ch] text-[clamp(2.1rem,4.6vw,3.8rem)] font-bold leading-[1.03] tracking-[-0.04em]">
            See the redesign before{' '}
            <span className="bg-[linear-gradient(100deg,#fff,hsl(160_80%_72%)_60%,hsl(162_72%_46%))] bg-clip-text text-transparent">
              you buy a thing.
            </span>
          </h2>
        </Reveal>

        <Reveal delay={0.1} className="mt-12 flex flex-col items-center justify-between gap-4 sm:flex-row">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={highlight ? 'diff' : 'all'}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-white/45"
              aria-live="polite"
            >
              {highlight ? 'Only what ThinkDecor offers' : `Comparing ${ROWS.length} features`}
            </motion.p>
          </AnimatePresence>
          <DiffToggle on={highlight} onChange={setHighlight} />
        </Reveal>

        <div ref={viewRef} className="mt-5">
          <Reveal delay={0.15} y={36} blur={14}>
            <DesktopTable rows={desktopRows} play={play} />
            <MobileTable rows={mobileRows} play={play} competitor={competitor} onCompetitor={setCompetitor} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Desktop: full four-column table with a spotlit ThinkDecor column    */
/* ------------------------------------------------------------------ */

function DesktopTable({ rows, play }: { rows: Row[]; play: boolean }) {
  const reduce = useReducedMotion();
  const tableRef = useRef<HTMLDivElement>(null);
  const [spot, setSpot] = useState(false);
  const pointerY = useMotionValue(0);
  const spotlight = useMotionTemplate`radial-gradient(180px circle at 50% ${pointerY}px, hsl(162 72% 60% / 0.22), transparent 70%)`;
  const spotOn = { onMouseEnter: () => setSpot(true), onMouseLeave: () => setSpot(false) };

  return (
    <Tilt max={2.5} innerClassName="rounded-[30px]" className="relative hidden md:block">
      <div className="relative rounded-[30px] border border-white/10 bg-white/[0.03] px-3 pb-3 pt-9 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.85)] backdrop-blur-xl">
      <div
        ref={tableRef}
        className="relative"
        onMouseMove={(e) => {
          const top = tableRef.current?.getBoundingClientRect().top ?? 0;
          pointerY.set(e.clientY - top);
        }}
      >
        {/* ThinkDecor column: glow panel, light beam, cursor spotlight, badge */}
        <div aria-hidden className={cn('pointer-events-none absolute inset-0 grid', DESKTOP_COLS)}>
          <div className="relative col-start-2 mx-1.5">
            <motion.div
              className="absolute -top-24 left-1/2 h-48 w-[170%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(ellipse_at_50%_100%,hsl(162_72%_60%/0.4),transparent_65%)] blur-2xl"
              animate={{ opacity: spot ? 1 : 0.35 }}
              transition={{ duration: 0.5 }}
            />
            <div className="absolute inset-0 overflow-hidden rounded-[22px]">
              <div className="absolute inset-0 border border-mint/25 bg-[linear-gradient(180deg,hsl(162_72%_46%/0.16),hsl(162_72%_46%/0.03))] shadow-[0_0_60px_-14px_hsl(162_72%_46%/0.45)]" />
              <motion.div
                className="absolute inset-0 bg-[linear-gradient(180deg,hsl(162_72%_65%/0.28),transparent_60%)]"
                animate={{ opacity: spot ? 1 : 0 }}
                transition={{ duration: 0.45 }}
              />
              {!reduce && (
                <motion.div
                  className="absolute inset-0"
                  style={{ background: spotlight }}
                  animate={{ opacity: spot ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                />
              )}
              <motion.div
                animate={{ borderColor: spot ? 'hsl(162 72% 55% / 0.6)' : 'hsl(162 72% 55% / 0)' }}
                className="absolute inset-0 rounded-[22px] border"
              />
              <div
                aria-hidden
                className="shine-sweep pointer-events-none absolute inset-y-0 -left-1/4 w-1/4 -skew-x-12 bg-[linear-gradient(90deg,transparent,hsl(0_0%_100%/0.5),transparent)] mix-blend-overlay"
                style={{ animationDelay: '1.8s' }}
              />
            </div>
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-mint px-3 py-1 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-ink shadow-[0_8px_24px_-6px_hsl(162_72%_46%/0.7)]">
              Best value
            </span>
          </div>
        </div>

        <div role="table" aria-label="ThinkDecor compared with mood boards and hiring a designer" className="relative">
          <div role="row" className={cn('grid items-end pb-4', DESKTOP_COLS)}>
            <div role="columnheader" className="px-6 font-mono text-[11px] uppercase tracking-[0.2em] text-white/40">
              Features
            </div>
            <div role="columnheader" className="cursor-default px-4 pt-3 text-center" {...spotOn}>
              <p className="flex items-center justify-center gap-1.5 text-[17px] font-bold tracking-[-0.01em] text-white">
                <Crown className="h-4 w-4 text-mint" />
                ThinkDecor
              </p>
              <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.16em] text-mint">
                {score('thinkdecor')}/{ROWS.length} features
              </p>
              <ScoreBar value={score('thinkdecor')} total={ROWS.length} tone="mint" />
            </div>
            {COMPETITORS.map((c) => {
              const Icon = c.icon;
              return (
                <div key={c.key} role="columnheader" className="px-4 pt-3 text-center">
                  <p className="flex items-center justify-center gap-1.5 text-[15px] font-medium text-white/65">
                    <Icon className="h-3.5 w-3.5 text-white/40" />
                    {c.label}
                  </p>
                  <p className="mt-1 font-mono text-[10.5px] uppercase tracking-[0.16em] text-white/35">
                    {score(c.key)}/{ROWS.length} features
                  </p>
                  <ScoreBar value={score(c.key)} total={ROWS.length} tone="dim" />
                </div>
              );
            })}
          </div>

          <div role="rowgroup">
            <AnimatePresence mode="popLayout" initial={false}>
              {rows.map((row, i) => {
                const unique = onlyThinkDecor(row, COMPETITORS.map((c) => c.key));
                return (
                  <motion.div
                    key={row.feature}
                    role="row"
                    layout={!reduce}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
                    whileHover={reduce ? undefined : { scale: 1.012 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                    className={cn(
                      'group relative grid items-center rounded-2xl',
                      'before:absolute before:inset-x-6 before:top-0 before:h-px before:bg-white/[0.07] first:before:hidden',
                      DESKTOP_COLS,
                    )}
                  >
                    <span
                      aria-hidden
                      className="absolute inset-0 rounded-2xl bg-white/[0.05] opacity-0 shadow-[0_22px_60px_-24px_hsl(162_72%_46%/0.45)] ring-1 ring-white/10 transition-opacity duration-300 group-hover:opacity-100"
                    />
                    <div role="rowheader" className="relative flex flex-wrap items-center gap-x-3 gap-y-1.5 px-6 py-5">
                      <span className="text-[15px] text-white/75 transition-colors duration-300 group-hover:text-white">
                        {row.feature}
                      </span>
                      {unique && (
                        <span className="rounded-full border border-mint/30 bg-mint/10 px-2 py-0.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-mint">
                          Only ThinkDecor
                        </span>
                      )}
                    </div>
                    <div role="cell" className="relative flex justify-center py-5" {...spotOn}>
                      <span className="transition-transform duration-300 group-hover:scale-110">
                        <Mark yes={row.thinkdecor} hero play={play} delay={0.1 + i * 0.12} label="ThinkDecor" />
                      </span>
                    </div>
                    {COMPETITORS.map((c, ci) => (
                      <div key={c.key} role="cell" className="relative flex justify-center py-5">
                        <Mark yes={row[c.key]} play={play} delay={0.18 + i * 0.12 + ci * 0.08} label={c.label} />
                      </div>
                    ))}
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
      </div>
      {/* ground shadow reinforcing the tilt, same trick the other floating cards use */}
      <div aria-hidden className="pointer-events-none absolute inset-x-[14%] -bottom-6 -z-10 h-10 rounded-[50%] bg-[hsl(162_72%_46%/0.18)] blur-2xl" />
    </Tilt>
  );
}

/* ------------------------------------------------------------------ */
/* Mobile: ThinkDecor against one alternative at a time                */
/* ------------------------------------------------------------------ */

function MobileTable({
  rows, play, competitor, onCompetitor,
}: { rows: Row[]; play: boolean; competitor: Competitor; onCompetitor: (c: Competitor) => void }) {
  const reduce = useReducedMotion();
  const current = COMPETITORS.find((c) => c.key === competitor)!;

  return (
    <div className="md:hidden">
      <div role="tablist" aria-label="Compare ThinkDecor with" className="grid grid-cols-2 gap-1 rounded-full border border-white/10 bg-white/[0.04] p-1">
        {COMPETITORS.map((c) => {
          const active = c.key === competitor;
          return (
            <button
              key={c.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => onCompetitor(c.key)}
              className={cn('relative rounded-full px-2 py-2.5 text-[12.5px] font-medium transition-colors', active ? 'text-white' : 'text-white/50')}
            >
              {active && (
                <motion.span
                  layoutId="comparison-competitor"
                  className="absolute inset-0 rounded-full bg-white/[0.12] ring-1 ring-white/15"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative">vs {c.label}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-4 rounded-[24px] border border-white/10 bg-white/[0.03] px-2 pb-2 pt-7 backdrop-blur-xl">
        <div className="relative">
          <div aria-hidden className={cn('pointer-events-none absolute inset-0 grid', MOBILE_COLS)}>
            <div className="relative col-start-2 mx-0.5">
              <div className="absolute inset-0 rounded-2xl border border-mint/30 bg-[linear-gradient(180deg,hsl(162_72%_46%/0.18),hsl(162_72%_46%/0.03))] shadow-[0_0_40px_-12px_hsl(162_72%_46%/0.5)]" />
              <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-mint px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.12em] text-ink">
                Best value
              </span>
            </div>
          </div>

          <div role="table" aria-label={`ThinkDecor compared with ${current.label.toLowerCase()}`} className="relative">
            <div role="row" className={cn('grid items-end pb-3', MOBILE_COLS)}>
              <div role="columnheader" className="px-3 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">Features</div>
              <div role="columnheader" className="px-1 pt-2 text-center text-[12px] font-bold text-white">ThinkDecor</div>
              <div role="columnheader" className="px-1 pt-2 text-center text-[11.5px] font-medium leading-tight text-white/55">{current.label}</div>
            </div>

            <div role="rowgroup">
              <AnimatePresence mode="popLayout" initial={false}>
                {rows.map((row, i) => (
                  <motion.div
                    key={row.feature}
                    role="row"
                    layout={!reduce}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8, transition: { duration: 0.18 } }}
                    transition={{ type: 'spring', stiffness: 320, damping: 28 }}
                    className={cn(
                      'relative grid items-center rounded-xl active:bg-white/[0.05]',
                      'before:absolute before:inset-x-3 before:top-0 before:h-px before:bg-white/[0.07] first:before:hidden',
                      MOBILE_COLS,
                    )}
                  >
                    <div role="rowheader" className="px-3 py-4 text-[13.5px] leading-snug text-white/80">{row.feature}</div>
                    <div role="cell" className="flex justify-center py-4">
                      <Mark yes={row.thinkdecor} hero play={play} delay={0.1 + i * 0.1} label="ThinkDecor" />
                    </div>
                    <div role="cell" className="flex justify-center py-4">
                      {/* Re-keyed so the mark springs again when the comparison switches. */}
                      <Mark key={competitor} yes={row[competitor]} play={play} delay={0.16 + i * 0.1} label={current.label} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Shared pieces                                                       */
/* ------------------------------------------------------------------ */

/** Thin fill bar under a column's score — turns the fraction into something you can read at a glance. */
function ScoreBar({ value, total, tone }: { value: number; total: number; tone: 'mint' | 'dim' }) {
  const reduce = useReducedMotion();
  return (
    <span className="mt-2 block h-[3px] w-full overflow-hidden rounded-full bg-white/10">
      <motion.span
        className={cn('block h-full rounded-full', tone === 'mint' ? 'bg-mint shadow-[0_0_10px_-1px_hsl(162_72%_46%/0.9)]' : 'bg-white/35')}
        initial={reduce ? false : { scaleX: 0 }}
        whileInView={{ scaleX: value / total }}
        viewport={{ once: true }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.2 }}
        style={{ transformOrigin: 'left' }}
      />
    </span>
  );
}

function DiffToggle({ on, onChange }: { on: boolean; onChange: (on: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={cn(
        'inline-flex items-center gap-3 rounded-full border py-1.5 pl-4 pr-1.5 text-[13px] font-medium backdrop-blur transition-all duration-300',
        on ? 'border-mint/40 bg-mint/[0.08] text-white shadow-[0_0_24px_-8px_hsl(162_72%_46%/0.6)]' : 'border-white/10 bg-white/[0.04] text-white/80 hover:border-mint/40 hover:text-white',
      )}
    >
      Highlight differences
      <span
        className={cn(
          'flex h-6 w-11 items-center rounded-full p-0.5 transition-colors duration-300',
          on ? 'justify-end bg-mint shadow-[0_0_14px_-2px_hsl(162_72%_46%/0.9)]' : 'justify-start bg-white/15',
        )}
      >
        <motion.span layout transition={{ type: 'spring', stiffness: 500, damping: 32 }} className="h-5 w-5 rounded-full bg-white shadow-md" />
      </span>
    </button>
  );
}

/** A check that springs in and draws its stroke, or a dash that slides open. */
function Mark({
  yes, hero = false, play, delay, label,
}: { yes: boolean; hero?: boolean; play: boolean; delay: number; label: string }) {
  const reduce = useReducedMotion();

  if (yes) {
    return (
      <motion.span
        initial={reduce ? false : { scale: 0, rotate: -45, opacity: 0 }}
        animate={play ? { scale: 1, rotate: 0, opacity: 1 } : undefined}
        transition={{ type: 'spring', stiffness: 460, damping: 15, delay }}
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full',
          hero
            ? 'bg-mint text-ink shadow-[0_0_26px_-2px_hsl(162_72%_46%/0.75)]'
            : 'border border-white/15 bg-white/[0.08] text-white/85',
        )}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <motion.path
            d="M5 12.5l4.5 4.5L19 7.5"
            initial={reduce ? false : { pathLength: 0 }}
            animate={play ? { pathLength: 1 } : undefined}
            transition={{ duration: 0.35, delay: delay + 0.12, ease: 'easeOut' }}
          />
        </svg>
        <span className="sr-only">{label}: yes</span>
      </motion.span>
    );
  }

  return (
    <motion.span
      initial={reduce ? false : { scale: 0, opacity: 0 }}
      animate={play ? { scale: 1, opacity: 1 } : undefined}
      transition={{ type: 'spring', stiffness: 460, damping: 18, delay }}
      className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.03]"
    >
      <XIcon className="h-3.5 w-3.5 text-white/25" strokeWidth={2.5} aria-hidden />
      <span className="sr-only">{label}: no</span>
    </motion.span>
  );
}
