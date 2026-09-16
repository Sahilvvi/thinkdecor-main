import { Link } from 'react-router-dom';
import { ArrowRight, Check, CreditCard, ShieldCheck } from 'lucide-react';
import { PHASE1_PLAN, money, pence } from '@/lib/billing';
import { Magnetic, Reveal } from './Motion';
import { Tilt } from '@/components/motion/primitives';

/* ------------------------------------------------------------------ *
 *  Pricing — one real plan, shown the way the rest of the homepage
 *  looks: a dark glass hero card, not a form. Numbers come straight
 *  from billing.ts so this can never drift from what Stripe charges.
 * ------------------------------------------------------------------ */
export function PricingTeaser() {
  const plan = PHASE1_PLAN;

  return (
    <section id="pricing" className="relative scroll-mt-24 overflow-hidden py-16 lg:py-24">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[linear-gradient(hsl(168_30%_20%/0.035)_1px,transparent_1px),linear-gradient(90deg,hsl(168_30%_20%/0.035)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,#000,transparent)]" />
      </div>

      <div className="container relative mx-auto max-w-[1100px] px-6 sm:px-8">
        <Reveal className="mx-auto max-w-[640px] text-center">
          <p className="flex items-center justify-center gap-2 text-[11px] font-medium uppercase tracking-[0.24em] text-primary">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-primary" />
            </span>
            Pricing
          </p>
          <h2 className="mx-auto mt-5 max-w-[22ch] text-[clamp(1.9rem,4vw,3.2rem)] font-bold leading-[1.08] tracking-[-0.02em] text-foreground">
            One simple plan. Everything included.
          </h2>
          <p className="mx-auto mt-5 max-w-[46ch] text-[15.5px] leading-relaxed text-foreground/55">
            No tiers to compare, no add-ons to hunt for — just {plan.credits} room designs a month.
          </p>
        </Reveal>

        <Reveal delay={0.1} y={36} blur={14} className="mt-12">
          <Tilt max={2.5} innerClassName="rounded-[32px]">
            <div className="relative rounded-[32px] bg-[linear-gradient(150deg,hsl(168_100%_14%),hsl(168_85%_20%)_55%,hsl(166_70%_27%))] text-white shadow-[0_40px_100px_-36px_hsl(168_100%_17%/0.55)]">
              {/* decorative background lives in its own clipped layer so the "Early
                  access price" badge below can float half outside the card's top
                  edge without being sliced off by this layer's own rounding */}
              <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-[32px]">
                <div
                  aria-hidden
                  className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] bg-[size:56px_56px] [mask-image:radial-gradient(ellipse_75%_90%_at_80%_20%,#000,transparent)]"
                />
                <div aria-hidden className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-white/[0.08] blur-3xl" />
                <div aria-hidden className="absolute -bottom-24 right-0 h-96 w-96 rounded-full bg-[hsl(160_84%_45%)]/25 blur-3xl" />
                <div
                  aria-hidden
                  className="shine-sweep pointer-events-none absolute inset-y-0 -left-1/4 w-1/4 -skew-x-12 bg-[linear-gradient(90deg,transparent,hsl(0_0%_100%/0.22),transparent)] mix-blend-overlay"
                  style={{ animationDelay: '1.6s' }}
                />
              </div>

              <span className="absolute left-1/2 top-0 z-10 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-mint px-4 py-1.5 text-[10.5px] font-semibold uppercase tracking-[0.16em] text-ink shadow-[0_10px_26px_-6px_hsl(162_72%_46%/0.7)]">
                Early access price
              </span>

              <div className="relative grid gap-10 px-7 py-14 sm:px-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:px-14 lg:py-16">
                <div className="text-center lg:text-left">
                  <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/55">First month</p>
                  <div className="mt-3 flex items-end justify-center gap-2 lg:justify-start">
                    <span className="text-[76px] font-bold leading-none tracking-[-0.04em]">
                      {pence(plan.introPrice ?? 0.69)}
                    </span>
                  </div>
                  <p className="mt-4 text-[15px] text-white/70">
                    then <span className="font-semibold text-white">{money(plan.monthly)}</span> a month
                  </p>
                  <p className="mt-1.5 text-[13px] text-white/45">Cancel anytime · no card tricks</p>

                  <div className="mt-8 flex justify-center lg:justify-start">
                    <Magnetic>
                      <Link
                        to="/pricing"
                        className="group relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-white px-8 py-4 text-[14.5px] font-semibold text-primary shadow-[0_16px_36px_-12px_rgba(0,0,0,0.4)] transition-transform duration-300 hover:scale-[1.03] active:scale-[0.98]"
                      >
                        <span
                          aria-hidden
                          className="absolute inset-0 -translate-x-full bg-[linear-gradient(100deg,transparent,hsl(168_100%_17%/0.1),transparent)] transition-transform duration-700 group-hover:translate-x-full"
                        />
                        <span className="relative">{plan.cta}</span>
                        <ArrowRight className="relative h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>
                    </Magnetic>
                  </div>

                  <div className="mt-7 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-[12px] text-white/50 lg:justify-start">
                    <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-mint" /> Secure payment by Stripe</span>
                    <span className="flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5 text-mint" /> Cancel any time</span>
                  </div>
                </div>

                <div className="border-t border-white/10 pt-8 lg:border-l lg:border-t-0 lg:pl-12 lg:pt-0">
                  <ul className="grid gap-3.5 sm:grid-cols-2">
                    {plan.features.map((f) => (
                      <li key={f} className="group flex items-start gap-2.5 text-[13.5px] leading-snug text-white/75">
                        <span className="mt-0.5 flex h-4.5 w-4.5 flex-shrink-0 items-center justify-center rounded-full bg-mint/20 transition-colors duration-300 group-hover:bg-mint">
                          <Check className="h-2.5 w-2.5 text-mint transition-colors duration-300 group-hover:text-ink" />
                        </span>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </Tilt>
        </Reveal>
      </div>
    </section>
  );
}
