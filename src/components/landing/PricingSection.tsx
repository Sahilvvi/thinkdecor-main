import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Check } from 'lucide-react';

const plans = [
  {
    name: 'Free',
    price: '$0',
    period: 'forever',
    description: 'Perfect for trying out Viz2D',
    features: [
      'Up to 5 projects',
      'Up to 10 layers per project',
      '1x export resolution',
      'Basic blend modes',
      'Community support',
    ],
    cta: 'Get Started',
    variant: 'hero-outline' as const,
    popular: false,
  },
  {
    name: 'Pro',
    price: '$12',
    period: '/month',
    description: 'For serious creators and professionals',
    features: [
      'Unlimited projects',
      'Unlimited layers',
      'Up to 4x export resolution',
      'All blend modes',
      'Priority support',
      'Custom templates',
      'Team collaboration',
      'API access',
    ],
    cta: 'Start Pro Trial',
    variant: 'hero' as const,
    popular: true,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="py-24 relative">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-glow opacity-30" />
      
      <div className="container relative z-10 mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Simple,
            <span className="text-gradient-primary"> Transparent Pricing</span>
          </h2>
          <p className="text-muted-foreground text-lg">
            Start free and upgrade when you need more power. No hidden fees.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative p-8 rounded-2xl ${
                plan.popular
                  ? 'bg-card border-2 border-primary/50 shadow-glow'
                  : 'bg-card/50 border border-border/50'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="px-4 py-1 rounded-full bg-gradient-primary text-primary-foreground text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-gradient-primary">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <p className="text-muted-foreground mt-2">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <div className="w-5 h-5 rounded-full bg-success/20 flex items-center justify-center flex-shrink-0">
                      <Check className="h-3 w-3 text-success" />
                    </div>
                    <span className="text-sm text-foreground">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link to="/demo" className="block">
                <Button variant={plan.variant} className="w-full" size="lg">
                  {plan.cta}
                </Button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}