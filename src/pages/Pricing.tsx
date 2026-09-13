import { useState } from 'react';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { Check, ArrowRight, Loader2, ShieldCheck, CreditCard, AlertTriangle } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SEO } from '@/components/shared/SEO';
import { Reveal } from '@/components/premium/Motion';
import { PHASE1_PLAN, money, pence } from '@/lib/billing';
import { startCheckout, CheckoutError } from '@/lib/checkout';
import { useAuthStore } from '@/stores/authStore';

const FAQS = [
  {
    q: 'What do I pay, and when?',
    a: 'You pay 69p today for your first month. After that it renews at £4.99 a month until you cancel.',
  },
  {
    q: 'Can I cancel any time?',
    a: 'Yes. Cancel from your account and the plan stays active until the end of the period you have already paid for. No exit fee, no notice period.',
  },
  {
    q: 'Is there a refund policy?',
    a: 'If ThinkDecor does not work for your rooms, email us within 14 days of your first payment and we will refund it in full.',
  },
  {
    q: 'Do I need any special equipment?',
    a: 'No. A photo of your room from any phone is enough — no LiDAR, laser measures or special hardware.',
  },
];

export default function Pricing() {
  const [busy, setBusy] = useState(false);
  const [params] = useSearchParams();
  const cancelled = params.get('checkout') === 'cancelled';
  // Affiliate / influencer links look like /pricing?ref=INFLUENCER10.
  // Resolved server-side against live Stripe promotion codes — an unknown
  // or mistyped code is silently ignored and the standard 69p offer applies.
  const promoCode = params.get('ref') ?? params.get('promo') ?? undefined;

  const [failure, setFailure] = useState<{ title: string; detail?: string } | null>(null);

  const plan = PHASE1_PLAN;
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const go = async () => {
    // Credits are granted to an account by the Stripe webhook. A buyer with no
    // account has nowhere for them to land, so checkout needs one first. The
    // return path keeps any ?ref= promo code intact.
    if (!user) {
      toast('Create a free account first — your plan and credits attach to it.');
      navigate('/signup', { state: { from: { pathname: '/pricing', search: location.search } } });
      return;
    }

    setBusy(true);
    setFailure(null);
    try {
      await startCheckout(plan.key, 'month', promoCode);
      // On success the browser navigates to Stripe, so nothing runs after this.
    } catch (e) {
      const err = e as CheckoutError;
      // Toasts get missed. A dead button on a pricing page needs to say why.
      setFailure({ title: err.message, detail: err.detail });
      toast.error(err.message);
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Pricing | ThinkDecor"
        description="Start for 69p, then £4.99 a month. Scan a room, get an accurate floor plan, then let Mantha AI redesign it — furniture, materials, palette and budget. Cancel anytime."
        canonical="https://thinkdecor.app/pricing"
      />
      <Navbar />

      <main className="relative pt-28">
        {/* ---------------- HEADER ---------------- */}
        <section className="relative overflow-hidden pb-10 pt-8">
          <div className="pointer-events-none absolute -top-32 left-1/2 h-[500px] w-[900px] -translate-x-1/2 rounded-full bg-primary/[0.05] blur-[150px]" />
          <div className="container relative mx-auto max-w-[1120px] px-6 text-center sm:px-8">
            <Reveal>
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-primary">Early access</p>
              <h1 className="mx-auto mt-5 max-w-[16ch] text-[clamp(2.2rem,5vw,3.7rem)] font-bold leading-[1.04] tracking-[-0.035em] text-foreground">
                Start for 69p.
              </h1>
              <p className="mx-auto mt-5 max-w-[46ch] text-[15.5px] leading-relaxed text-foreground/58">
                One plan, everything included. Your first month is 69p,
                then £4.99 a month. Cancel anytime.
              </p>
            </Reveal>

            {failure && (
              <Reveal>
                <div className="mx-auto mt-8 max-w-[560px] rounded-2xl border border-destructive/25 bg-destructive/[0.04] px-6 py-5 text-left">
                  <p className="flex items-center gap-2 text-[14px] font-semibold text-foreground">
                    <AlertTriangle className="h-4 w-4 flex-shrink-0 text-destructive" />
                    {failure.title}
                  </p>
                  {failure.detail && (
                    <p className="mt-2 pl-6 text-[13px] leading-relaxed text-foreground/60">
                      {failure.detail}
                    </p>
                  )}
                  <p className="mt-2 pl-6 text-[12.5px] text-foreground/45">
                    Nothing was charged. Full details are in the browser console.
                  </p>
                </div>
              </Reveal>
            )}

            {cancelled && (
              <Reveal delay={0.05}>
                <p className="mx-auto mt-7 inline-flex items-center gap-2 rounded-full border border-foreground/[0.12] bg-card px-5 py-2.5 text-[13px] text-foreground/60">
                  Checkout cancelled — nothing was charged.
                </p>
              </Reveal>
            )}

            {promoCode && (
              <Reveal delay={0.05}>
                <p className="mx-auto mt-7 inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/[0.06] px-5 py-2.5 text-[13px] text-foreground/70">
                  Promo code <span className="font-semibold text-foreground">{promoCode}</span> will be applied at checkout.
                </p>
              </Reveal>
            )}
          </div>
        </section>

        {/* ---------------- THE ONE PLAN ---------------- */}
        <section className="pb-16">
          <div className="container mx-auto max-w-[560px] px-6 sm:px-8">
            <Reveal delay={0.1}>
              <div className="relative rounded-[28px] border border-primary/35 bg-card p-8 shadow-[0_30px_70px_-38px_hsl(168_70%_18%/0.42)] lg:p-10">
                {/* intro price */}
                <div className="text-center">
                  <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-primary">
                    First month
                  </p>
                  <div className="mt-3 flex items-end justify-center gap-2">
                    <span className="text-[64px] font-bold leading-none tracking-[-0.04em] text-foreground">
                      {pence(plan.introPrice ?? 0.69)}
                    </span>
                  </div>
                  <p className="mt-4 text-[15px] text-foreground/55">
                    then <span className="font-semibold text-foreground">{money(plan.monthly)}</span> a month
                  </p>
                  <p className="mt-1.5 text-[13px] text-foreground/45">Cancel anytime</p>
                </div>

                {/* what you get */}
                <ul className="mt-9 grid gap-3 border-t border-foreground/[0.08] pt-8 sm:grid-cols-2">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5 text-[13.5px] leading-snug text-foreground/70">
                      <Check className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-primary" />
                      {f}
                    </li>
                  ))}
                </ul>

                <button
                  onClick={go}
                  disabled={busy}
                  className="group mt-9 flex w-full items-center justify-center gap-2 rounded-full bg-primary py-4 text-[15px] font-semibold text-primary-foreground transition-all duration-300 hover:shadow-[0_18px_40px_-16px_hsl(168_100%_17%/0.6)] disabled:opacity-60"
                >
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  {busy ? 'Opening checkout…' : plan.cta}
                  {!busy && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />}
                </button>
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <p className="mt-8 flex flex-wrap items-center justify-center gap-x-7 gap-y-2 text-[12.5px] text-foreground/45">
                <span className="flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-primary" /> Secure payment by Stripe</span>
                <span className="flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5 text-primary" /> Cancel any time</span>
                <span className="flex items-center gap-1.5"><Check className="h-3.5 w-3.5 text-primary" /> 14-day refund</span>
              </p>
            </Reveal>
          </div>
        </section>

        {/* ---------------- FAQ ---------------- */}
        <section className="pb-24 lg:pb-32">
          <div className="container mx-auto max-w-[820px] px-6 sm:px-8">
            <Reveal>
              <h2 className="text-[clamp(1.5rem,2.6vw,2.1rem)] font-bold tracking-[-0.03em] text-foreground">
                Billing questions.
              </h2>
            </Reveal>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {FAQS.map((f, i) => (
                <Reveal key={f.q} delay={i * 0.05}>
                  <div className="h-full rounded-[18px] border border-foreground/[0.08] bg-card p-6 shadow-[0_6px_20px_-14px_hsl(168_20%_10%/0.35)]">
                    <p className="text-[14.5px] font-semibold text-foreground">{f.q}</p>
                    <p className="mt-2.5 text-[13.5px] leading-relaxed text-foreground/55">{f.a}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
