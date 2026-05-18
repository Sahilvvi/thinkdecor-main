import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Building2, Camera, Eye, ShoppingCart, TrendingUp, Percent } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { BeforeAfterSlider } from '@/components/shared/BeforeAfterSlider';

const benefits = [
  { icon: Camera, label: "Create AR-ready digital product catalogues" },
  { icon: Eye, label: "Let customers see products in their own space" },
  { icon: ShoppingCart, label: "Sell directly through your own website" },
  { icon: TrendingUp, label: "Reduce hesitation and improve conversion rates" },
  { icon: Percent, label: "Keep 100% of your revenue (zero commission)" },
];

export function ForBrandsPreview() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="py-24 lg:py-32 relative bg-card/30">
      <div className="container mx-auto px-4 sm:px-6">
        <div
          ref={ref}
          className={`grid lg:grid-cols-2 gap-16 items-center max-w-6xl mx-auto transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          {/* Content */}
          <div className="space-y-6 lg:order-1">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Building2 className="h-6 w-6 text-primary" />
              </div>
              <span className="text-sm font-medium text-primary">For Brands</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold leading-tight">
              Help customers decide faster.{' '}
              <span className="text-gradient-primary">Sell with confidence.</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Think Decor helps brands present products in context so customers understand before they buy.
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

            <Link to="/for-brands" className="inline-block mt-2">
              <Button variant="hero" size="lg">
                Partner with Think Decor
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          {/* Image - Interactive Before/After */}
          <div className="relative lg:order-2 overflow-hidden sm:overflow-visible">
            <div className="rounded-2xl overflow-hidden border border-border/30 shadow-xl">
              <BeforeAfterSlider
                beforeSrc="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop"
                afterSrc="https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=800&h=600&fit=crop"
                beforeAlt="Original showroom"
                afterAlt="Enhanced showroom with Think Decor"
                aspectRatio="aspect-[4/3]"
              />
            </div>
            <div className="hidden sm:block absolute -z-10 -bottom-4 -right-4 w-full h-full rounded-2xl bg-primary/5 border border-primary/10" />
          </div>
        </div>
      </div>
    </section>
  );
}
