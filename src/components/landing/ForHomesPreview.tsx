import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Home, Eye, Palette, Wallet, ShieldCheck } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { BeforeAfterSlider } from '@/components/shared/BeforeAfterSlider';

const benefits = [
  { icon: Eye, label: "Visualise decor in your actual space" },
  { icon: Palette, label: "Explore wallpapers, flooring, furniture & more" },
  { icon: Wallet, label: "Get guided suggestions that respect your budget" },
  { icon: ShieldCheck, label: "Avoid costly or unnecessary purchases" },
];

export function ForHomesPreview() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="py-24 lg:py-32 relative">
      <div className="container mx-auto px-4 sm:px-6">
        <div
          ref={ref}
          className={`grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Image - Interactive Before/After */}
          <div className="relative overflow-hidden sm:overflow-visible">
            <div className="rounded-2xl overflow-hidden border border-border/30 shadow-xl">
              <BeforeAfterSlider
                beforeSrc="/assets/samples/empty_room.png"
                afterSrc="/assets/samples/styled_room.png"
                beforeAlt="Empty original room"
                afterAlt="Fully furnished and styled room"
                aspectRatio="aspect-[4/3]"
              />
            </div>
            <div className="hidden sm:block absolute -z-10 -bottom-4 -left-4 w-full h-full rounded-2xl bg-primary/5 border border-primary/10" />
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Home className="h-6 w-6 text-primary" />
              </div>
              <span className="text-sm font-medium text-primary">For Homes</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
              Design your home with confidence,{' '}
              <span className="text-gradient-primary">even on a budget.</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Whether you own or rent, Think Decor helps you make decor decisions that feel right.
            </p>

            <ul className="space-y-3">
              {benefits.map((b) => {
                const Icon = b.icon;
                return (
                  <li key={b.label} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="text-sm text-foreground">{b.label}</span>
                  </li>
                );
              })}
            </ul>

            <Link to="/for-homes" className="inline-block mt-2">
              <Button variant="hero-outline" size="lg">
                Learn More
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
