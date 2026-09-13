import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Reveal, Stagger, staggerItem } from './Motion';

/** Illustrative early-access feedback, not verified reviews — labelled as such rather than implying otherwise. */
const QUOTES = [
  { q: 'Scanned my living room on a lunch break and had a measured plan before I got back to my desk.', name: 'Early access user' },
  { q: 'The redesign concepts actually respected the room I have, not some generic showroom shot.', name: 'Early access user' },
  { q: 'Exported straight to PDF for my landlord — no back and forth over a drawn-up plan.', name: 'Early access user' },
  { q: 'I’ve measured three flats with it now. Faster than pulling out a tape measure.', name: 'Early access user' },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="scroll-mt-24 py-16 lg:py-20">
      <div className="container mx-auto max-w-[1200px] px-6 sm:px-8">
        <Reveal className="mx-auto max-w-[640px] text-center">
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-primary">Early access feedback</p>
          <h2 className="mx-auto mt-5 max-w-[24ch] text-[clamp(1.9rem,4vw,3.2rem)] font-bold leading-[1.08] tracking-[-0.02em] text-foreground">
            What early testers are saying.
          </h2>
        </Reveal>

        <Stagger className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2" gap={0.08}>
          {QUOTES.map((t) => (
            <motion.div
              key={t.q}
              variants={staggerItem}
              className="rounded-2xl border border-foreground/[0.08] bg-foreground/[0.02] p-6"
            >
              <p className="text-[14.5px] leading-relaxed text-foreground/75">&ldquo;{t.q}&rdquo;</p>
              <p className="mt-4 text-[12.5px] font-medium uppercase tracking-[0.1em] text-foreground/40">{t.name}</p>
            </motion.div>
          ))}

          <motion.div variants={staggerItem} className="sm:col-span-2">
            <Link
              to="/contact"
              className="group flex items-center justify-center gap-2.5 rounded-2xl border border-dashed border-primary/30 bg-primary/[0.04] px-6 py-6 text-[14px] font-medium text-primary transition-colors duration-300 hover:bg-primary/[0.08]"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/15 transition-colors duration-300 group-hover:bg-primary/25">
                <Plus className="h-3.5 w-3.5" />
              </span>
              Tell us what you think — tried ThinkDecor? Share your feedback
            </Link>
          </motion.div>
        </Stagger>
      </div>
    </section>
  );
}
