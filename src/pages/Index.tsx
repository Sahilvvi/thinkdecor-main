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
import { CTASection } from '@/components/landing/CTASection';
import { SEO } from '@/components/shared/SEO';
import { useAuthStore } from '@/stores/authStore';

const Index = () => {
  const { initialize } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="ThinkDecor | AI Interior Design Tool — Redesign Your Room Online Free"
        description="Upload your room photo and instantly visualize furniture, paint, flooring, and décor with AI. ThinkDecor is the free AI interior design tool and room design app for every home."
        canonical="https://thinkdecor.app/"
      />
      <Navbar />
      <main>
        <HeroSection />
        <ProblemSection />
        <ThinkDecorWaySection />
        <ForHomesPreview />
        <LiveDemoSection />
        <ManthaSection />
        <UseCasesSection />
        <CTASection />
      </main>
      <Footer />
    </div>
  );
};

export default Index;