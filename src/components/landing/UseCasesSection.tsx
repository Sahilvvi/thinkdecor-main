import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Home, Building2 } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export function UseCasesSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const { ref: cardsRef, isVisible: cardsVisible } = useScrollAnimation({ threshold: 0.1 });

  return (
    <section className="py-24 lg:py-32 relative bg-transparent">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div
          ref={headerRef}
          className={`text-center max-w-3xl mx-auto mb-16 transition-all duration-700 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            AI Interior Design for
            <span className="text-gradient-primary"> Homeowners &amp; Brands</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Whether you're redesigning your own room or helping customers visualize your products — ThinkDecor's AI home design tool works for you
          </p>
        </div>

        {/* Use Case Cards */}
        <div
          ref={cardsRef}
          className={`grid md:grid-cols-2 gap-8 max-w-5xl mx-auto transition-all duration-700 ${
            cardsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'
          }`}
        >
          {/* Personal Use */}
          <div 
            className="relative group transition-all duration-500"
            style={{ transitionDelay: '100ms' }}
          >
            <div className="relative rounded-2xl overflow-hidden border border-border/50 bg-card/50 hover:border-primary/30 transition-all duration-300">
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=500&fit=crop"
                  alt="Homeowner using AI interior design tool to redesign living room online"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
              </div>
              
              {/* Content */}
              <div className="p-5 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Home className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">Personal Use</h3>
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Upload your room photo and instantly visualize furniture, paint, flooring, and home décor with AI. Redesign any room online — free to start, no design experience needed.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Upload photo to redesign any room online
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Visualize paint colors, flooring &amp; furniture with AI
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Make confident home décor decisions before buying
                  </li>
                </ul>
                <Link to="/demo">
                  <Button variant="outline" className="w-full">
                    Start Designing
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Professional Use */}
          <div 
            className="relative group transition-all duration-500"
            style={{ transitionDelay: '200ms' }}
          >
            <div className="relative rounded-2xl overflow-hidden border border-primary/30 bg-card/50 hover:border-primary/50 transition-all duration-300 shadow-glow">
              {/* Popular badge */}
              <div className="absolute top-4 right-4 z-10">
                <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                  Pro
                </span>
              </div>
              
              {/* Image */}
              <div className="relative aspect-[16/10] overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=500&fit=crop"
                  alt="Professional interior designer using AI room design software for client projects"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-card via-transparent to-transparent" />
              </div>
              
              {/* Content */}
              <div className="p-5 sm:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-2xl font-bold">Professional Use</h3>
                </div>
                <p className="text-muted-foreground mb-6 leading-relaxed">
                  Impress clients with stunning visualizations. Create multiple design concepts in minutes, 
                  not hours. Streamline your workflow and close deals faster.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground mb-6">
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Unlimited projects & high-res exports
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Client collaboration tools
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    Commercial usage rights
                  </li>
                </ul>
                <Link to="/demo">
                  <Button variant="hero" className="w-full">
                    Start Pro Trial
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}