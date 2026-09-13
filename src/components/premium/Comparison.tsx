import { Check, Minus } from 'lucide-react';
import { Reveal } from './Motion';

type Mark = 'yes' | 'partly' | 'no';

// Only claims the app backs up today — room scanning and plans are labelled
// "coming soon" elsewhere and deliberately left out of this table.
const ROWS: { feature: string; us: Mark; a: Mark; b: Mark }[] = [
  { feature: 'Starts from a photo of your own room', us: 'yes', a: 'no', b: 'yes' },
  { feature: 'A finished redesign in seconds', us: 'yes', a: 'no', b: 'no' },
  { feature: 'Try several styles on the same room', us: 'yes', a: 'partly', b: 'partly' },
  { feature: 'Describe changes in plain words', us: 'yes', a: 'no', b: 'yes' },
  { feature: 'Costs less than a tin of paint', us: 'yes', a: 'yes', b: 'no' },
];

const COLUMNS = [
  { key: 'us' as const, label: 'ThinkDecor', us: true },
  { key: 'a' as const, label: 'Mood boards' },
  { key: 'b' as const, label: 'Hiring a designer' },
];

const MARK_LABEL: Record<Mark, string> = { yes: 'Yes', partly: 'Partly', no: 'No' };

/** Icon-only cell — the mark IS the content here (no adjacent text), so it needs a real
 *  text alternative for screen readers and colour-blind users, not just colour + shape. */
function MarkIcon({ mark }: { mark: Mark }) {
  const label = <span className="sr-only">{MARK_LABEL[mark]}</span>;

  if (mark === 'yes') {
    return (
      <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-full bg-primary">
        <Check className="h-3.5 w-3.5 text-primary-foreground" />
        {label}
      </span>
    );
  }
  if (mark === 'partly') {
    return (
      <span className="mx-auto flex h-6 w-6 items-center justify-center rounded-full border border-foreground/20">
        <Minus className="h-3.5 w-3.5 text-foreground/45" />
        {label}
      </span>
    );
  }
  return (
    <span className="mx-auto block h-6 w-6 text-center text-[14px] leading-6 text-foreground/25">
      —{label}
    </span>
  );
}

/** Why ThinkDecor — a plain comparison against the two ways people plan a room today. */
export function Comparison() {
  return (
    <section id="comparison" className="scroll-mt-24 border-y border-foreground/[0.07] py-16 lg:py-20">
      <div className="container mx-auto max-w-[1200px] px-6 sm:px-8">
        <Reveal className="mx-auto max-w-[640px] text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-primary">Why ThinkDecor</p>
          <h2 className="mx-auto mt-5 max-w-[26ch] text-[clamp(1.9rem,4vw,3.2rem)] font-bold leading-[1.08] tracking-[-0.02em] text-foreground">
            See the redesign before you buy a thing.
          </h2>
        </Reveal>

        <Reveal delay={0.12} y={30} className="mt-12 overflow-x-auto">
          <table className="w-full min-w-[560px] border-collapse overflow-hidden rounded-[22px] border border-foreground/[0.09]">
            <thead>
              <tr>
                <th scope="col" className="bg-foreground/[0.02] px-5 py-4 text-left text-[13px] font-medium text-foreground/55" />
                {COLUMNS.map((c) => (
                  <th
                    key={c.key}
                    scope="col"
                    className={`px-5 py-4 text-center text-[13.5px] font-semibold ${
                      c.us ? 'bg-primary/10 text-primary' : 'bg-foreground/[0.02] text-foreground/60'
                    }`}
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.feature} className="border-t border-foreground/[0.07]">
                  <td className="px-5 py-4 text-[13.5px] text-foreground/75">{row.feature}</td>
                  {COLUMNS.map((c) => (
                    <td key={c.key} className={`px-5 py-4 ${c.us ? 'bg-primary/[0.04]' : ''}`}>
                      <MarkIcon mark={row[c.key]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </Reveal>
      </div>
    </section>
  );
}
