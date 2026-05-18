import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Sparkles, ArrowRight, CheckCircle2, Calendar, Building2, Globe, Users, Shield, Eye } from 'lucide-react';

const companySizes = ['1–50', '51–200', '200+'];
const industries = ['Furniture', 'Home Decor', 'Flooring & Tiles', 'Wallpaper & Surfaces', 'Interior Design', 'Real Estate', 'Architecture', 'Other'];
const regions = ['Asia', 'Europe', 'North America', 'Middle East & Africa', 'Latin America', 'India'];

const benefits = [
  { icon: Eye, text: "Live product visualisation demo" },
  { icon: Shield, text: "See how it fits your catalogue" },
  { icon: Users, text: "Understand the customer journey" },
  { icon: Globe, text: "Explore integration options" },
];

export default function BookDemo() {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { ref: formRef, isVisible: formVisible } = useScrollAnimation();
  const [loading, setLoading] = useState(false);
  const [activeHighlight, setActiveHighlight] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveHighlight(prev => (prev + 1) % benefits.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Demo request submitted! We'll be in touch within 24 hours.");
      (e.target as HTMLFormElement).reset();
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24">
        {/* Hero section */}
        <section className="py-16 lg:py-28 relative overflow-hidden">
          {/* Background effects */}
          <div className="absolute inset-0">
            <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[150px]" />
            <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[120px]" />
          </div>
          <div className="absolute inset-0 bg-grid opacity-[0.03]" />

          <div
            ref={heroRef}
            className={`container relative z-10 mx-auto px-4 sm:px-6 transition-all duration-700 ${
              heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
              {/* Left: copy */}
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 mb-6">
                  <Calendar className="h-4 w-4" />
                  Book a Demo
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  Experience{' '}
                  <span className="text-gradient-primary">Think Decor</span>{' '}
                  in action.
                </h1>
                <p className="text-lg text-muted-foreground max-w-lg mb-10">
                  See how our visualisation platform helps your customers make confident decisions, personalised to your products and industry.
                </p>

                {/* Interactive benefit highlights */}
                <div className="space-y-3">
                  {benefits.map((b, i) => {
                    const Icon = b.icon;
                    const isActive = activeHighlight === i;
                    return (
                      <div
                        key={b.text}
                        className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 cursor-default ${
                          isActive
                            ? 'bg-primary/[0.08] border-primary/30 shadow-[0_0_30px_hsl(var(--primary)/0.08)] scale-[1.02]'
                            : 'bg-card/30 border-border/20'
                        }`}
                        onMouseEnter={() => setActiveHighlight(i)}
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                          isActive ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                        }`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <span className={`font-medium text-sm transition-colors duration-300 ${
                          isActive ? 'text-foreground' : 'text-muted-foreground'
                        }`}>
                          {b.text}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right: Form */}
              <div
                ref={formRef}
                className={`transition-all duration-700 delay-200 ${
                  formVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                }`}
              >
                <div className="relative">
                  {/* Glow behind form */}
                  <div className="absolute -inset-1 rounded-3xl bg-gradient-to-b from-primary/20 via-primary/5 to-transparent blur-xl opacity-50" />

                  <form
                    onSubmit={handleSubmit}
                    className="relative rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 p-8 space-y-5 shadow-2xl"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                        <Sparkles className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">Schedule your demo</h3>
                        <p className="text-xs text-muted-foreground">Takes under 2 minutes</p>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name" className="text-sm text-muted-foreground">Name</Label>
                        <Input id="name" placeholder="Your name" required className="bg-background/50 border-border/50 focus:border-primary/50" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email" className="text-sm text-muted-foreground">Email Address</Label>
                        <Input id="email" type="email" placeholder="you@company.com" required className="bg-background/50 border-border/50 focus:border-primary/50" />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="text-sm text-muted-foreground">Phone Number</Label>
                        <Input id="phone" type="tel" placeholder="+91 98765 43210" className="bg-background/50 border-border/50 focus:border-primary/50" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="company" className="text-sm text-muted-foreground">Company</Label>
                        <Input id="company" placeholder="Company name" required className="bg-background/50 border-border/50 focus:border-primary/50" />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Company Size</Label>
                        <Select>
                          <SelectTrigger className="bg-background/50 border-border/50">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {companySizes.map(s => (
                              <SelectItem key={s} value={s}>{s}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Industry</Label>
                        <Select>
                          <SelectTrigger className="bg-background/50 border-border/50">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {industries.map(i => (
                              <SelectItem key={i} value={i}>{i}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-sm text-muted-foreground">Region</Label>
                        <Select>
                          <SelectTrigger className="bg-background/50 border-border/50">
                            <SelectValue placeholder="Select" />
                          </SelectTrigger>
                          <SelectContent>
                            {regions.map(r => (
                              <SelectItem key={r} value={r}>{r}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      variant="hero"
                      size="lg"
                      className="w-full text-base"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="flex items-center gap-2">
                          <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                          Submitting...
                        </span>
                      ) : (
                        <span className="flex items-center gap-2">
                          Schedule Demo
                          <ArrowRight className="h-4 w-4" />
                        </span>
                      )}
                    </Button>

                    <p className="text-xs text-muted-foreground text-center">
                      No commitment required. We'll reach out within 24 hours.
                    </p>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <section className="py-12 border-t border-border/20">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex flex-wrap items-center justify-center gap-8 text-muted-foreground">
              {[
                { icon: Building2, text: "Trusted by leading brands" },
                { icon: Shield, text: "Enterprise-grade security" },
                { icon: Globe, text: "Available worldwide" },
                { icon: CheckCircle2, text: "No setup required" },
              ].map((item, i) => {
                const Icon = item.icon;
                return (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <Icon className="h-4 w-4 text-primary/60" />
                    <span>{item.text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
