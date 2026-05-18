import { useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HeroSection } from '@/components/landing/HeroSection';
import { ProblemSection } from '@/components/landing/ProblemSection';
import { ThinkDecorWaySection } from '@/components/landing/ThinkDecorWaySection';
import { ForHomesPreview } from '@/components/landing/ForHomesPreview';
import { LiveDemoSection } from '@/components/landing/LiveDemoSection';
import { ManthaSection } from '@/components/landing/ManthaSection';
import { UseCasesSection } from '@/components/landing/UseCasesSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { CTASection } from '@/components/landing/CTASection';
import { useAuthStore } from '@/stores/authStore';

const Index = () => {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main>
        <HeroSection />
        <ProblemSection />
        <ThinkDecorWaySection />
        <ForHomesPreview />
        <LiveDemoSection />
        <ManthaSection />
        <UseCasesSection />
        <TestimonialsSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;