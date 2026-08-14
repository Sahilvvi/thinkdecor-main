import { useEffect, useState, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { Button } from '@/components/ui/button';
import { Armchair, Paintbrush, Home, Quote, BadgeCheck, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

const testimonials = [
  {
    icon: Armchair, industry: 'Furniture Retailer', role: 'Retail Operations Manager',
    quote: 'ThinkDecor helped us create an immersive shopping experience where customers could visualize furniture in their own homes before buying. It has completely changed how customers interact with our products online.',
  },
  {
    icon: Paintbrush, industry: 'Paint Brand', role: 'Digital Commerce Head',
    quote: 'Our customers can now confidently select paint colours after seeing them in their own spaces. The AI visualization experience has become one of the most engaging features on our website.',
  },
  {
    icon: Home, industry: 'Home Improvement Brand', role: 'Head of Digital Transformation',
    quote: 'The implementation was seamless, and the platform helped us showcase products in a much more interactive way. ThinkDecor has strengthened our digital customer experience.',
  },
];

/** Draggable, auto-playing success-stories carousel (Embla). */
export function StoriesCarousel() {
  const { ref, isVisible } = useScrollAnimation();
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: 'center' });
  const [selected, setSelected] = useState(0);

  useEffect(() => {
    if (!emblaApi) return;
    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on('select', onSelect);
    return () => {
      emblaApi.off('select', onSelect);
    };
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi || !isVisible) return;
    const id = setInterval(() => emblaApi.scrollNext(), 5000);
    return () => clearInterval(id);
  }, [emblaApi, isVisible, selected]);

  const scrollTo = useCallback((i: number) => emblaApi?.scrollTo(i), [emblaApi]);

  return (
    <section id="stories" className="py-20 lg:py-28 relative overflow-hidden scroll-mt-16">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-glow opacity-40" />
      <div
        ref={ref}
        className={`container relative z-10 mx-auto px-4 sm:px-6 max-w-4xl transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 mb-6">
            <Quote className="h-4 w-4" />
            What Brands Say
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Customer <span className="text-gradient-primary">Success Stories</span>
          </h2>
          <p className="text-sm text-muted-foreground">Drag, swipe, or sit back — the stories rotate on their own.</p>
        </div>

        {/* Tab pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {testimonials.map((t, i) => {
            const Icon = t.icon;
            const isActive = selected === i;
            return (
              <button
                key={t.industry}
                onClick={() => scrollTo(i)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full border text-sm font-medium transition-all duration-300 ${
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary shadow-glow scale-105'
                    : 'bg-card/50 text-muted-foreground border-border/50 hover:border-primary/40 hover:text-foreground hover:-translate-y-0.5'
                }`}
              >
                <Icon className="h-4 w-4" />
                {t.industry}
              </button>
            );
          })}
        </div>

        {/* Carousel */}
        <div className="relative">
          <div className="overflow-hidden cursor-grab active:cursor-grabbing" ref={emblaRef}>
            <div className="flex">
              {testimonials.map((t, i) => {
                const Icon = t.icon;
                return (
                  <div key={t.industry} className="flex-[0_0_92%] sm:flex-[0_0_86%] min-w-0 px-2">
                    <div className={`relative rounded-2xl gradient-border bg-card/60 backdrop-blur-xl p-8 sm:p-12 shadow-xl overflow-hidden min-h-[260px] transition-all duration-500 ${
                      selected === i ? 'opacity-100 scale-100' : 'opacity-40 scale-[0.96]'
                    }`}>
                      <Quote className="absolute top-6 left-6 h-14 w-14 text-primary/10 -scale-x-100" />
                      <Quote className="absolute bottom-6 right-6 h-14 w-14 text-primary/10" />
                      <p className="text-lg sm:text-xl text-foreground leading-relaxed mb-8 relative z-10">
                        "{t.quote}"
                      </p>
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12 rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center">
                          <Icon className="h-5 w-5 text-primary" />
                          <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-success border-2 border-card flex items-center justify-center">
                            <BadgeCheck className="h-2.5 w-2.5 text-success-foreground" />
                          </span>
                        </div>
                        <div>
                          <p className="font-semibold text-foreground text-sm">{t.role}</p>
                          <p className="text-xs text-muted-foreground">{t.industry}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Arrows */}
          <button
            onClick={() => emblaApi?.scrollPrev()}
            aria-label="Previous story"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 sm:-translate-x-5 w-10 h-10 rounded-full glass border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary-foreground hover:bg-primary hover:border-primary transition-all duration-300"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            onClick={() => emblaApi?.scrollNext()}
            aria-label="Next story"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 sm:translate-x-5 w-10 h-10 rounded-full glass border border-border/50 flex items-center justify-center text-muted-foreground hover:text-primary-foreground hover:bg-primary hover:border-primary transition-all duration-300"
          >
            <ChevronRight className="h-5 w-5" />
          </button>

          {/* Auto-rotate progress */}
          <div className="mt-6 mx-auto max-w-[200px] h-0.5 rounded-full bg-border/30 overflow-hidden">
            <div
              key={selected}
              className="h-full bg-gradient-to-r from-primary to-accent"
              style={{ animation: isVisible ? 'progress 5s linear' : 'none' }}
            />
          </div>
        </div>

        <div className="text-center mt-8">
          <a href="#lead-form">
            <Button variant="hero-outline" size="lg" className="group">
              Become Our Next Success Story
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}
