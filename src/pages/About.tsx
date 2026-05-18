import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CTASection } from '@/components/landing/CTASection';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Heart, Shield, Eye, Users, Building2, Home, Sparkles, ArrowRight, Target, Lightbulb, Rocket, Globe, Award, Zap, MessageCircle, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useState, useEffect } from 'react';

const philosophy = [
  { icon: Eye, label: "Clarity matters more than persuasion.", detail: "We show you what things look like. We don't tell you what to buy." },
  { icon: Heart, label: "Guidance works better than pressure.", detail: "Every suggestion is a starting point, not a final answer." },
  { icon: Shield, label: "Trust is built through honesty, not hype.", detail: "No inflated promises. What you see is what you get." },
];

const stats = [
  { value: "10K+", label: "Rooms visualised" },
  { value: "500+", label: "Brand partners" },
  { value: "98%", label: "Customer satisfaction" },
  { value: "40%", label: "Faster decisions" },
];

const team = [
  {
    name: "Arjun Mehta",
    role: "Founder & CEO",
    bio: "Former product lead at a top interior-tech startup. Passionate about making design accessible.",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face",
  },
  {
    name: "Priya Sharma",
    role: "Head of Design",
    bio: "10+ years crafting digital experiences for design-forward brands across Asia and Europe.",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop&crop=face",
  },
  {
    name: "Rohan Kapoor",
    role: "CTO",
    bio: "AI and computer vision expert. Previously built AR systems for global retail brands.",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face",
  },
  {
    name: "Sneha Iyer",
    role: "Head of Partnerships",
    bio: "Connects brands with the right tools. Background in business development for SaaS platforms.",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face",
  },
];

const timeline = [
  { year: "2022", title: "The idea was born", desc: "Frustration with guesswork in home decor led to the first prototype.", icon: Lightbulb },
  { year: "2023", title: "First brand partners", desc: "Onboarded 50+ furniture and decor brands for pilot testing.", icon: Building2 },
  { year: "2024", title: "AI visualisation launch", desc: "Launched Mantha AI, intelligent room visualisation for everyone.", icon: Sparkles },
  { year: "2025", title: "Scaling globally", desc: "Expanded to 10+ countries with enterprise-grade platform.", icon: Globe },
];

const values = [
  { icon: Target, label: "Purpose-driven", desc: "Every feature exists to solve a real problem, not to impress." },
  { icon: Users, label: "Customer-first", desc: "We listen before we build. Feedback shapes our roadmap." },
  { icon: Zap, label: "Speed with care", desc: "Move fast, but never at the cost of quality or trust." },
  { icon: MessageCircle, label: "Transparent", desc: "Open about what we can do and honest about what we can't." },
  { icon: Award, label: "Excellence", desc: "Details matter. We obsess over the experience." },
  { icon: Rocket, label: "Innovation", desc: "We use technology to simplify, not to complicate." },
];

export default function About() {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { ref: whyRef, isVisible: whyVisible } = useScrollAnimation();
  const { ref: timelineRef, isVisible: timelineVisible } = useScrollAnimation();
  const { ref: builtRef, isVisible: builtVisible } = useScrollAnimation();
  const { ref: philRef, isVisible: philVisible } = useScrollAnimation();
  const { ref: valuesRef, isVisible: valuesVisible } = useScrollAnimation();

  const [activeTimelineIdx, setActiveTimelineIdx] = useState(-1);

  // Sequential timeline reveal
  useEffect(() => {
    if (!timelineVisible) return;
    setActiveTimelineIdx(-1);
    let i = 0;
    const interval = setInterval(() => {
      setActiveTimelineIdx(i);
      i++;
      if (i >= timeline.length) clearInterval(interval);
    }, 500);
    return () => clearInterval(interval);
  }, [timelineVisible]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24">
        {/* Hero */}
        <section className="py-20 lg:py-32 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/5 blur-[150px]" />
            <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[120px]" />
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
                  <Sparkles className="h-4 w-4" />
                  About Think Decor
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                  Helping people and brands make{' '}
                  <span className="text-gradient-primary">better decor decisions.</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-xl">
                  Think Decor was created to solve a simple but widespread problem: 
                  Decor decisions are hard because people are asked to imagine outcomes before they can see them.
                </p>
                <div className="mt-8">
                  <Link to="/book-demo">
                    <Button variant="hero" size="lg">
                      Get in touch
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>
              <div className="relative overflow-hidden sm:overflow-visible">
                <div className="rounded-2xl overflow-hidden border border-border/30 shadow-2xl">
                  <img
                    src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&h=600&fit=crop"
                    alt="Beautiful interior design"
                    className="w-full aspect-[4/3] object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-transparent to-transparent" />
                </div>
                <div className="hidden sm:block absolute -z-10 -bottom-4 -right-4 w-full h-full rounded-2xl bg-primary/5 border border-primary/10" />
              </div>
            </div>

            {/* Stats bar */}
            <div className="max-w-4xl mx-auto mt-16 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {stats.map((stat, i) => (
                <div
                  key={stat.label}
                  className={`text-center p-5 rounded-xl bg-card/50 border border-border/30 hover:border-primary/30 hover:shadow-[0_0_25px_hsl(var(--primary)/0.06)] transition-all duration-500 group ${
                    heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${400 + i * 100}ms` }}
                >
                  <p className="text-2xl sm:text-3xl font-bold text-gradient-primary">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1 group-hover:text-foreground/70 transition-colors">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Why we built it */}
        <section className="py-20 lg:py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-card/30" />
          <div className="absolute inset-0 bg-grid opacity-[0.03]" />

          <div
            ref={whyRef}
            className={`container relative z-10 mx-auto px-4 sm:px-6 max-w-5xl transition-all duration-700 ${
              whyVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="grid lg:grid-cols-2 gap-16 items-center">
              <div className="relative">
                <div className="rounded-2xl overflow-hidden border border-border/30 shadow-xl">
                  <img
                    src="https://images.unsplash.com/photo-1493809842364-78817add7ffb?w=800&h=600&fit=crop"
                    alt="Interior design process"
                    className="w-full aspect-[4/3] object-cover"
                  />
                </div>
                <div className="hidden sm:block absolute -z-10 -bottom-4 -left-4 w-full h-full rounded-2xl bg-primary/5 border border-primary/10" />
                <div className="absolute bottom-3 right-3 sm:-bottom-4 sm:-right-4 glass rounded-xl p-2 sm:p-3 shadow-lg border border-border/30">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground">Decision Clarity</span>
                  </div>
                </div>
              </div>
              <div>
                <h2 className="text-3xl sm:text-4xl font-bold mb-6">
                  Why we built <span className="text-gradient-primary">Think Decor</span>
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  Most decor platforms focus on inspiration or sales. Very few focus on decision clarity.
                </p>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  We built Think Decor to bridge that gap by helping people and brands understand how 
                  decor looks and feels in real spaces, before committing.
                </p>
                <div className="p-5 rounded-xl bg-primary/[0.06] border border-primary/20 mt-6">
                  <p className="text-lg font-semibold text-foreground">
                    "The goal is not to push choices. The goal is to support better ones."
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Our Journey - Timeline */}
        <section className="py-20 lg:py-28 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[150px]" />

          <div
            ref={timelineRef}
            className={`container relative z-10 mx-auto px-4 sm:px-6 max-w-4xl transition-all duration-700 ${
              timelineVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Our <span className="text-gradient-primary">journey</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">From a simple frustration to a platform trusted by hundreds of brands.</p>
            </div>

            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-6 sm:left-1/2 sm:-translate-x-px top-0 bottom-0 w-0.5 bg-border/30" />
              {/* Animated progress line */}
              <div
                className="absolute left-6 sm:left-1/2 sm:-translate-x-px top-0 w-0.5 bg-primary transition-all duration-1000 ease-out"
                style={{ height: activeTimelineIdx >= 0 ? `${Math.min(100, ((activeTimelineIdx + 1) / timeline.length) * 100)}%` : '0%' }}
              />

              <div className="space-y-12">
                {timeline.map((item, i) => {
                  const Icon = item.icon;
                  const isRevealed = activeTimelineIdx >= i;
                  const isEven = i % 2 === 0;
                  return (
                    <div
                      key={item.year}
                      className={`relative flex items-start ${isEven ? 'sm:flex-row' : 'sm:flex-row-reverse'} flex-row`}
                    >
                      {/* Dot */}
                      <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 z-10">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all duration-500 ${
                          isRevealed
                            ? 'bg-primary border-primary shadow-[0_0_25px_hsl(var(--primary)/0.3)]'
                            : 'bg-card border-border/50'
                        }`}>
                          <Icon className={`h-5 w-5 transition-colors duration-500 ${isRevealed ? 'text-primary-foreground' : 'text-muted-foreground'}`} />
                        </div>
                      </div>

                      {/* Content */}
                      <div className={`ml-16 sm:ml-0 flex-1 ${isEven ? 'sm:w-1/2 sm:pr-16' : 'sm:w-1/2 sm:pl-16'} ${!isEven ? 'sm:ml-auto' : ''}`}>
                        <div
                          className={`p-5 rounded-xl border transition-all duration-500 ${
                            isRevealed
                              ? 'bg-card/60 border-primary/20 opacity-100 translate-y-0'
                              : 'bg-card/20 border-border/20 opacity-0 translate-y-4'
                          }`}
                        >
                          <span className={`text-sm font-mono font-bold transition-colors duration-500 ${isRevealed ? 'text-primary' : 'text-muted-foreground'}`}>
                            {item.year}
                          </span>
                          <h3 className="font-bold text-foreground mt-1">{item.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">{item.desc}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Built for */}
        <section className="py-20 lg:py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-card/30" />

          <div
            ref={builtRef}
            className={`container relative z-10 mx-auto px-4 sm:px-6 max-w-5xl transition-all duration-700 ${
              builtVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Built for <span className="text-gradient-primary">homes and brands</span>
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <Link to="/for-homes" className="group">
                <div className="relative rounded-2xl overflow-hidden border border-border/30 hover:border-primary/30 hover:shadow-[0_0_40px_hsl(var(--primary)/0.08)] transition-all duration-500 h-full">
                  <img
                    src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=800&h=500&fit=crop"
                    alt="Home interior"
                    className="w-full aspect-[16/10] object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                        <Home className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground">For Individuals</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Decorating homes they live in, owned or rented. See how changes feel before committing.
                    </p>
                    <div className="flex items-center gap-2 mt-3 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-2 transition-all duration-300">
                      Learn more <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>

              <Link to="/for-brands" className="group">
                <div className="relative rounded-2xl overflow-hidden border border-border/30 hover:border-primary/30 hover:shadow-[0_0_40px_hsl(var(--primary)/0.08)] transition-all duration-500 h-full">
                  <img
                    src="https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=500&fit=crop"
                    alt="Brand showroom"
                    className="w-full aspect-[16/10] object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center group-hover:bg-primary transition-colors duration-300">
                        <Building2 className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
                      </div>
                      <h3 className="text-xl font-bold text-foreground">For Brands</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Selling products that depend on how they look in real spaces. Reduce hesitation, increase trust.
                    </p>
                    <div className="flex items-center gap-2 mt-3 text-primary text-sm font-medium opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-2 transition-all duration-300">
                      Learn more <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Philosophy */}
        <section className="py-20 lg:py-28 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[120px]" />

          <div
            ref={philRef}
            className={`container relative z-10 mx-auto px-4 sm:px-6 max-w-5xl transition-all duration-700 ${
              philVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Our <span className="text-gradient-primary">philosophy</span>
              </h2>
            </div>
            <div className="grid sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
              {philosophy.map((p, i) => {
                const Icon = p.icon;
                return (
                  <div
                    key={p.label}
                    className={`group p-6 rounded-2xl bg-card/50 border border-border/50 hover:border-primary/30 hover:bg-primary/[0.04] hover:shadow-[0_0_30px_hsl(var(--primary)/0.06)] transition-all duration-500 text-center ${
                      philVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                    style={{ transitionDelay: `${i * 150}ms` }}
                  >
                    <div className="w-14 h-14 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-5 group-hover:bg-primary group-hover:scale-110 transition-all duration-500">
                      <Icon className="h-7 w-7 text-primary group-hover:text-primary-foreground transition-colors" />
                    </div>
                    <h3 className="font-bold text-foreground mb-2">{p.label}</h3>
                    <p className="text-sm text-muted-foreground">{p.detail}</p>
                  </div>
                );
              })}
            </div>
            <p className="text-center text-muted-foreground mt-8 italic">
              Technology plays a supporting role, never the spotlight.
            </p>
          </div>
        </section>

        {/* Our Values */}
        <section className="py-20 lg:py-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-card/30" />
          <div className="absolute inset-0 bg-grid opacity-[0.03]" />

          <div
            ref={valuesRef}
            className={`container relative z-10 mx-auto px-4 sm:px-6 max-w-5xl transition-all duration-700 ${
              valuesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                What we <span className="text-gradient-primary">stand for</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">The principles that guide every decision we make.</p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
              {values.map((v, i) => {
                const Icon = v.icon;
                return (
                  <div
                    key={v.label}
                    className={`group p-5 rounded-xl bg-card/50 border border-border/30 hover:border-primary/20 hover:shadow-[0_0_25px_hsl(var(--primary)/0.05)] transition-all duration-500 ${
                      valuesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'
                    }`}
                    style={{ transitionDelay: `${i * 100}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-primary group-hover:scale-105 transition-all duration-300">
                        <Icon className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">{v.label}</h3>
                        <p className="text-sm text-muted-foreground">{v.desc}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>



        <CTASection />
      </main>
      <Footer />
    </div>
  );
}
