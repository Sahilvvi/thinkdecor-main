import { Logo } from '@/components/brand/Logo';
import { Link } from 'react-router-dom';
import { Linkedin, Instagram, MapPin, Mail } from 'lucide-react';
import { PHASE1_PLAN, money, pence } from '@/lib/billing';

// Read from the billing config so the footer can never quote a stale price.
const INTRO = pence(PHASE1_PLAN.introPrice ?? 0.69);
const MONTHLY = money(PHASE1_PLAN.monthly);

// Phase 1: Features · Pricing · FAQ · Contact. Every target below exists —
// #features and #faq are real sections on the homepage.
const exploreLinks = [
  { label: 'Features', href: '/#features' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'FAQ', href: '/#faq' },
  { label: 'Contact', href: '/contact' },
];

const legalLinks = [
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Refund Policy', href: '/refunds' },
];

// Only routes that actually exist in App.tsx. About.tsx, Careers.tsx and
// BookDemo.tsx exist as files but are NOT routed, so linking them would
// bounce the visitor to the homepage via the catch-all.
const companyLinks = [
  { label: 'Blog', href: '/blog' },
];

export function Footer() {
  return (
    <footer className="relative border-t border-border bg-card/50 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-[0.02]" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full bg-primary/[0.07] blur-[120px]" />
      <div className="container relative mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="col-span-2">
            <Logo />
            <p className="mt-4 text-sm text-muted-foreground max-w-xs">
              Decor that thinks before you buy.
            </p>
            <div className="flex items-center gap-1.5 mt-4 text-xs text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              <span>Northampton, United Kingdom</span>
            </div>
            <a
              href="mailto:info@thinkdecor.app"
              className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Mail className="h-3.5 w-3.5 text-primary flex-shrink-0" />
              <span>info@thinkdecor.app</span>
            </a>
            <div className="flex gap-4 mt-5">
              <a
                href="https://www.instagram.com/thinkdecor.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-border/60 flex items-center justify-center text-muted-foreground hover:text-primary-foreground hover:bg-primary hover:border-primary hover:scale-110 transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://www.linkedin.com/company/thinkdecor/?viewAsMember=true"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-full border border-border/60 flex items-center justify-center text-muted-foreground hover:text-primary-foreground hover:bg-primary hover:border-primary hover:scale-110 transition-all duration-300"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Explore */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Explore</h4>
            <ul className="space-y-3">
              {exploreLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 inline-block transition-all duration-300">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-3">
              {companyLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="text-sm text-muted-foreground hover:text-primary hover:translate-x-1 inline-block transition-all duration-300">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Get started */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Get started</h4>
            <p className="text-sm text-muted-foreground max-w-[22ch]">
              Your first month is {INTRO}, then {MONTHLY} a month.
            </p>
            <Link
              to="/pricing"
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-transform duration-300 hover:scale-[1.03]"
            >
              Start for {INTRO}
            </Link>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-border/60 flex flex-col gap-5">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 sm:justify-start">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-xs text-muted-foreground transition-colors hover:text-primary"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Think Decor Ltd. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground/70 uppercase tracking-[0.2em]">
            Decor that thinks before you buy
          </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
