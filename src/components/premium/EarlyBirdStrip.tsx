import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { PHASE1_PLAN, pence, money } from '@/lib/billing';
import { Reveal } from './Motion';

const INTRO = pence(PHASE1_PLAN.introPrice ?? 0.69);
const MONTHLY = money(PHASE1_PLAN.monthly);

/** Thin, high-contrast offer band. Price is read from billing.ts so it can never drift from what Stripe actually charges. */
export function EarlyBirdStrip() {
  return (
    <section className="py-3">
      <div className="container mx-auto max-w-[1200px] px-6 sm:px-8">
        <Reveal>
          <div className="flex flex-col items-center justify-between gap-3 rounded-2xl bg-primary px-6 py-4 text-center sm:flex-row sm:text-left sm:px-8">
            <p className="text-[14px] font-medium text-primary-foreground">
              <span className="font-bold">{INTRO}</span> early-bird price for your first month
              <span className="hidden text-primary-foreground/70 sm:inline"> · then {MONTHLY}/month</span>
            </p>
            <Link
              to="/pricing"
              className="group inline-flex flex-shrink-0 items-center gap-2 rounded-full bg-white px-5 py-2.5 text-[13.5px] font-semibold text-primary shadow-[0_10px_24px_-10px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
            >
              Claim offer
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
