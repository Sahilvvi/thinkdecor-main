import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Check, ArrowRight, Mail, Loader2 } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SEO } from '@/components/shared/SEO';

export default function CheckoutSuccess() {
  const [params] = useSearchParams();
  const sessionId = params.get('session_id');
  // Stripe redirects back before the webhook has necessarily landed, so give
  // it a beat rather than telling someone their purchase failed.
  const [settling, setSettling] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setSettling(false), 1600);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Payment complete | ThinkDecor" description="Your ThinkDecor purchase is confirmed." />
      <Navbar />

      <main className="relative pt-28">
        <section className="relative overflow-hidden py-20 lg:py-28">
          <div className="pointer-events-none absolute -top-24 left-1/2 h-[500px] w-[860px] -translate-x-1/2 rounded-full bg-primary/[0.06] blur-[150px]" />

          <div className="container relative mx-auto max-w-[620px] px-6 text-center sm:px-8">
            <motion.span
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 18 }}
              className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground"
            >
              {settling ? <Loader2 className="h-7 w-7 animate-spin" /> : <Check className="h-7 w-7" />}
            </motion.span>

            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            >
              <h1 className="mt-8 text-[clamp(1.9rem,4vw,2.8rem)] font-bold leading-[1.08] tracking-[-0.03em] text-foreground">
                {settling ? 'Confirming your payment…' : "You're in."}
              </h1>
              <p className="mx-auto mt-5 max-w-[44ch] text-[15.5px] leading-relaxed text-foreground/58">
                {settling
                  ? 'This takes a second — please don’t close the page.'
                  : 'Payment received and your receipt is on its way by email. Your room designs are ready to use.'}
              </p>

              {!settling && (
                <>
                  <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                    <Link
                      to="/"
                      className="group inline-flex items-center gap-2.5 rounded-full bg-primary px-8 py-4 text-[15px] font-semibold text-primary-foreground transition-transform duration-300 hover:scale-[1.03]"
                    >
                      Start designing
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                    <Link
                      to="/contact"
                      className="inline-flex items-center gap-2 rounded-full border border-foreground/[0.14] px-7 py-4 text-[14.5px] font-medium text-foreground/70 transition-colors hover:border-primary/40 hover:text-primary"
                    >
                      <Mail className="h-4 w-4" /> Need help?
                    </Link>
                  </div>

                  {sessionId && (
                    <p className="mt-10 font-mono text-[11px] text-foreground/32">
                      Reference {sessionId.slice(0, 28)}…
                    </p>
                  )}
                </>
              )}
            </motion.div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
