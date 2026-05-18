import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { PricingSection } from '@/components/landing/PricingSection';
import { CTASection } from '@/components/landing/CTASection';

export default function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24">
        <div className="container mx-auto px-4 sm:px-6 mb-12">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">
              Choose Your <span className="text-gradient-primary">Plan</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Start free and scale as you grow. All plans include core features.
            </p>
          </div>
        </div>
        <PricingSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
