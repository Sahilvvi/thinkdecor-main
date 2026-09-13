import { Link } from 'react-router-dom';
import { ArrowRight, MapPin } from 'lucide-react';
import { Reveal } from './Motion';

/** Short, honest brand explainer — no invented team members or stats, just what the product is. */
export function AboutBlurb() {
  return (
    <section id="about" className="scroll-mt-24 py-16 lg:py-20">
      <div className="container mx-auto max-w-[1200px] px-6 sm:px-8">
        <Reveal>
          <div className="grid gap-10 rounded-[28px] border border-foreground/[0.09] bg-foreground/[0.02] p-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:p-12">
            <div>
              <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-primary">About ThinkDecor</p>
              <h2 className="mt-5 text-[clamp(1.8rem,3.6vw,2.6rem)] font-bold leading-[1.1] tracking-[-0.025em] text-foreground">
                What is ThinkDecor?
              </h2>
              <div className="mt-4 flex items-center gap-1.5 text-[13px] text-foreground/50">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                Northampton, United Kingdom
              </div>
            </div>

            <div>
              <p className="max-w-[56ch] text-[15.5px] leading-relaxed text-foreground/62">
                ThinkDecor lets you upload a photo of any room and see it redesigned by
                Mantha AI — in the style you choose, keeping the walls and windows you
                already have. Try looks side by side, refine them in plain words, and keep
                every version in your library. Room scanning and measured floor plans are
                on the way.
              </p>

              <Link
                to="/contact"
                className="group mt-6 inline-flex items-center gap-2 text-[14px] font-semibold text-primary"
              >
                Get in touch
                <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
