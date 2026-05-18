import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CTASection } from '@/components/landing/CTASection';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Home, Eye, Palette, Wallet, ShieldCheck, Heart, Lightbulb, Sparkles, CheckCircle2 } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useState } from 'react';

const struggles = [
  { text: "Visualising how products will look together", icon: Eye },
  { text: "Knowing if something will feel right in their own space", icon: Home },
  { text: "Deciding whether the cost is justified", icon: Wallet },
  { text: "Feeling confident before committing", icon: ShieldCheck },
];

const benefits = [
  { icon: Eye, label: "See decor ideas placed in your own space", detail: "Upload a photo of your room and instantly see how different products look in your actual environment." },
  { icon: Palette, label: "Explore different styles without pressure", detail: "Try dozens of combinations of colours, textures, and furniture without spending a rupee." },
  { icon: Lightbulb, label: "Understand how choices change the feel", detail: "See how a warm wood floor vs cool marble completely transforms your room's mood." },
  { icon: Heart, label: "Compare options calmly before deciding", detail: "Save your favourite combinations and compare them side by side at your own pace." },
];

const principles = [
  { text: "No commitment to purchase", icon: ShieldCheck },
  { text: "No pressure to overspend", icon: Wallet },
  { text: "No assumptions about your taste", icon: Heart },
];

export default function ForHomes() {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { ref: struggleRef, isVisible: struggleVisible } = useScrollAnimation();
  const { ref: benefitRef, isVisible: benefitVisible } = useScrollAnimation();
  const { ref: principleRef, isVisible: principleVisible } = useScrollAnimation();
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollAnimation();
  const [activeBenefit, setActiveBenefit] = useState(0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24">
        {/* Hero */}
        <section className="py-20 lg:py-32 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[150px]" />
          </div>
          <div className="absolute inset-0 bg-grid opacity-[0.03]" />

          <div
            ref={heroRef}
            className={`container relative z-10 mx-auto px-4 sm:px-6 transition-all duration-700 ${
              heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="max-w-5xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
              <div className="text-center lg:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 mb-6">
                  <Home className="h-4 w-4" />
                  For Homes
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  Design your space with{' '}
                  <span className="text-gradient-primary">clarity, not guesswork.</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl">
                  Decor decisions feel difficult because you're asked to imagine outcomes before you see them. 
                  Think Decor removes that uncertainty.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-4 lg:justify-start justify-center">
                  <Link to="/demo">
                    <Button variant="hero" size="xl" className="text-base sm:text-lg px-6 sm:px-8 w-full sm:w-auto">
                      Try the Live Demo
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative overflow-hidden sm:overflow-visible">
                <div className="rounded-2xl overflow-hidden border border-border/30 shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=600&fit=crop"
                    alt="Beautiful modern living room"
                    className="w-full aspect-[4/3] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                </div>
                <div className="hidden sm:block absolute -z-10 -bottom-4 -right-4 w-full h-full rounded-2xl bg-primary/5 border border-primary/10" />
                {/* Floating badge */}
                <div className="absolute bottom-3 left-3 sm:-bottom-4 sm:-left-4 glass rounded-xl p-2 sm:p-3 shadow-lg border border-border/30 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-3 sm:h-4 w-3 sm:w-4 text-primary" />
                    <span className="text-[10px] sm:text-xs font-semibold text-foreground">AI-Powered Visualisation</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why decor decisions feel hard */}
        <section className="py-20 lg:py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-card/30" />
          <div className="absolute inset-0 bg-grid opacity-[0.03]" />
          
          <div
            ref={struggleRef}
            className={`container relative z-10 mx-auto px-4 sm:px-6 max-w-5xl transition-all duration-700 ${
              struggleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                  Why decor decisions <span className="text-gradient-primary">feel hard</span> today
                </h2>
                <p className="text-muted-foreground mb-8">
                  When decorating a home, people usually struggle with:
                </p>
                <div className="space-y-4">
                  {struggles.map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={i}
                        className={`flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/50 hover:border-primary/30 transition-all duration-500 group ${
                          struggleVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-8'
                        }`}
                        style={{ transitionDelay: `${i * 150}ms` }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0 group-hover:bg-destructive/20 transition-colors">
                          <Icon className="h-5 w-5 text-destructive/70" />
                        </div>
                        <p className="text-foreground font-medium">{item.text}</p>
                      </div>
                    );
                  })}
                </div>
                <p className="text-muted-foreground mt-6 italic text-sm">
                  These doubts are normal, and they're exactly what Think Decor is built to address.
                </p>
              </div>
              <div className="relative hidden lg:block">
                <div className="rounded-2xl overflow-hidden border border-border/30 shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=600&fit=crop"
                    alt="Person choosing decor"
                    className="w-full aspect-[4/3] object-cover"
                  />
                </div>
                <div className="hidden sm:block absolute -z-10 -bottom-4 -left-4 w-full h-full rounded-2xl bg-primary/5 border border-primary/10" />
              </div>
            </div>
          </div>
        </section>

        {/* How Think Decor helps - interactive */}
        <section className="py-20 lg:py-28 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px]" />
          
          <div
            ref={benefitRef}
            className={`container relative z-10 mx-auto px-4 sm:px-6 max-w-5xl transition-all duration-700 ${
              benefitVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                How Think Decor <span className="text-gradient-primary">helps you decide</span>
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Think Decor is not about rushing you to buy. It's about helping you understand your options clearly.
              </p>
            </div>

            <div className="grid lg:grid-cols-2 gap-8 items-start">
              {/* Benefit list */}
              <div className="space-y-3">
                {benefits.map((b, index) => {
                  const Icon = b.icon;
                  const isActive = activeBenefit === index;
                  return (
                    <button
                      key={b.label}
                      onClick={() => setActiveBenefit(index)}
                      className={`w-full text-left p-5 rounded-xl border transition-all duration-500 ${
                        isActive
                          ? 'bg-primary/[0.08] border-primary/30 shadow-[0_0_30px_hsl(var(--primary)/0.08)]'
                          : 'bg-card/30 border-border/30 hover:border-border/60'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                          isActive ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <p className={`font-semibold transition-colors ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {b.label}
                          </p>
                          <div className={`overflow-hidden transition-all duration-500 ${isActive ? 'max-h-20 opacity-100 mt-1' : 'max-h-0 opacity-0'}`}>
                            <p className="text-sm text-muted-foreground">{b.detail}</p>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Visual preview */}
              <div className="relative">
                <div className="rounded-2xl overflow-hidden border border-border/30 shadow-xl sticky top-32">
                  <img
                    src={[
                      "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&h=600&fit=crop",
                      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop",
                      "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop",
                      "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
                    ][activeBenefit]}
                    alt={benefits[activeBenefit].label}
                    className="w-full aspect-[4/3] object-cover transition-opacity duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="glass rounded-lg px-4 py-3">
                      <p className="text-sm font-medium text-foreground">{benefits[activeBenefit].label}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-center text-xl font-bold text-gradient-primary mt-12">
              You move forward only when things feel right.
            </p>
          </div>
        </section>

        {/* Real homes, real budgets */}
        <section className="py-20 lg:py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-card/30" />
          
          <div
            ref={principleRef}
            className={`container relative z-10 mx-auto px-4 sm:px-6 max-w-5xl transition-all duration-700 ${
              principleVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative order-2 lg:order-1">
                <div className="rounded-2xl overflow-hidden border border-border/30 shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop"
                    alt="Cozy home interior"
                    className="w-full aspect-[4/3] object-cover"
                  />
                </div>
                <div className="hidden sm:block absolute -z-10 -bottom-4 -right-4 w-full h-full rounded-2xl bg-primary/5 border border-primary/10" />
              </div>
              
              <div className="order-1 lg:order-2">
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                  Designed for <span className="text-gradient-primary">real homes</span> and real budgets
                </h2>
                <p className="text-muted-foreground mb-8">
                  Whether you live in a rented apartment or your own home, Think Decor adapts to your situation.
                </p>
                <div className="space-y-4">
                  {principles.map((p, i) => {
                    const Icon = p.icon;
                    return (
                      <div
                        key={p.text}
                        className={`flex items-center gap-4 p-4 rounded-xl bg-card/50 border border-border/50 transition-all duration-500 ${
                          principleVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                        }`}
                        style={{ transitionDelay: `${i * 150}ms` }}
                      >
                        <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-5 w-5 text-success" />
                        </div>
                        <span className="text-foreground font-medium">{p.text}</span>
                      </div>
                    );
                  })}
                </div>
                <p className="text-muted-foreground mt-6 italic text-sm">
                  Your preferences guide the experience, not trends or templates.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 lg:py-28 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-gradient-glow opacity-40" />

          <div
            ref={ctaRef}
            className={`container relative z-10 mx-auto px-4 sm:px-6 max-w-3xl text-center transition-all duration-700 ${
              ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">
              You stay <span className="text-gradient-primary">in control</span>
            </h2>
            <p className="text-lg text-muted-foreground mb-4">
              Think Decor supports your decisions. It doesn't replace them.
            </p>
            <p className="text-muted-foreground mb-10">
              The goal is clarity, not persuasion.
            </p>
            <Link to="/demo">
              <Button variant="hero" size="xl" className="text-base sm:text-lg px-6 sm:px-10 w-full sm:w-auto">
                Try the Live Web Demo
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <p className="text-sm text-muted-foreground mt-4">
              See decor ideas in context before you decide.
            </p>
          </div>
        </section>

        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
