import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Play } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

export function LiveDemoSection() {
  const { ref, isVisible } = useScrollAnimation();

  return (
    <section className="py-24 lg:py-32 relative bg-transparent">
      <div className="absolute inset-0 bg-grid opacity-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-glow opacity-40" />

      <div
        ref={ref}
        className={`container relative z-10 mx-auto px-4 sm:px-6 transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="max-w-4xl mx-auto text-center">
          <span className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 mb-6">
            Interactive Experience
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Try the <span className="text-gradient-primary">Live Web Demo</span>
          </h2>
          <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto">
            Experience how decisions feel when you can actually see them. 
            Click on any surface to change colors, textures, and materials in real-time.
          </p>

          <Link to="/demo">
            <Button variant="hero" size="xl" className="text-base sm:text-lg px-8 sm:px-12 py-5 sm:py-7">
              <Play className="h-5 w-5" />
              Launch Live Demo
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>

          <p className="text-sm text-muted-foreground mt-6 mb-12">
            No sign-up required • Works in your browser
          </p>

          {/* Room previews */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[
              { src: "/assets/samples/1.jpg", label: "Living Room" },
              { src: "/assets/samples/3.jpg", label: "Bedroom" },
              { src: "/assets/samples/5.jpg", label: "Kitchen" },
            ].map((room) => (
              <Link to="/demo" key={room.label} className="group relative rounded-xl overflow-hidden border border-border/30 hover:border-primary/40 transition-all duration-300">
                <img
                  src={room.src}
                  alt={room.label}
                  className="w-full aspect-[4/3] object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3 flex items-center justify-between">
                  <span className="text-sm font-medium text-foreground">{room.label}</span>
                  <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
