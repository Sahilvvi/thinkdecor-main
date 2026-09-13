import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bot, Eye, Wand2, Wallet, Layers, ArrowRight, Sparkles } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { ManthaBot } from './ManthaBot';

const capabilities = [
  { icon: Eye, label: 'Understands room layouts', detail: 'Analyses your customer’s space — dimensions, lighting, architecture.' },
  { icon: Wand2, label: 'Recommends your products', detail: 'Suggests best-fit items from your catalogue for every room.' },
  { icon: Wallet, label: 'Respects customer budgets', detail: 'Guides shoppers to options they can actually afford.' },
  { icon: Layers, label: 'Raises order value', detail: 'Pairs complementary products so carts grow naturally.' },
];

const chat = [
  { role: 'user' as const, text: 'Can my customers see this sofa in their own living room?' },
  { role: 'ai' as const, text: 'Yes — they upload a room photo and I place your sofa in it, true to scale and lighting.' },
  { role: 'ai' as const, text: 'I’ll also suggest matching pieces from your catalogue to raise order value.' },
];

/** Foyr-style AI character promo — Mantha as the animated assistant. */
export function ManthaShowcase() {
  const { ref, isVisible } = useScrollAnimation();
  const [activeCap, setActiveCap] = useState(0);
  const [visibleMsgs, setVisibleMsgs] = useState(0);
  const [typing, setTyping] = useState(false);

  useEffect(() => {
    if (!isVisible) return;
    const id = setInterval(() => setActiveCap((p) => (p + 1) % capabilities.length), 3000);
    return () => clearInterval(id);
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible || visibleMsgs >= chat.length) return;
    const t = setTimeout(() => {
      setTyping(true);
      setTimeout(() => {
        setTyping(false);
        setVisibleMsgs((p) => p + 1);
      }, 1100);
    }, visibleMsgs === 0 ? 700 : 1800);
    return () => clearTimeout(t);
  }, [isVisible, visibleMsgs]);

  return (
    <section className="py-20 lg:py-28 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[600px] rounded-full bg-primary/[0.06] blur-[130px] animate-[pulse_6s_ease-in-out_infinite]" />
      </div>
      {/* Floating orbs */}
      <div className="absolute top-20 left-[15%] w-2 h-2 rounded-full bg-primary/40 animate-[pulse_3s_ease-in-out_infinite]" />
      <div className="absolute top-40 right-[18%] w-3 h-3 rounded-full bg-accent/30 animate-[pulse_4s_ease-in-out_infinite_0.5s]" />
      <div className="absolute bottom-24 left-[28%] w-2 h-2 rounded-full bg-primary/30 animate-[pulse_3.5s_ease-in-out_infinite_1s]" />

      <div
        ref={ref}
        className={`container relative z-10 mx-auto px-4 sm:px-6 max-w-6xl transition-all duration-700 ${
          isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
        }`}
      >
        <div className="relative rounded-3xl border border-primary/20 bg-gradient-card overflow-hidden p-8 sm:p-12">
          <div className="absolute inset-0 bg-grid opacity-[0.04]" />
          <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-primary/10 blur-3xl" />

          <div className="relative grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: copy + capabilities */}
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 mb-6">
                <Sparkles className="h-4 w-4" />
                Powered by Mantha AI
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Meet <span className="text-gradient-primary">Mantha</span> — the AI that sells for you
              </h2>
              <p className="text-muted-foreground mb-8">
                Mantha lives inside your store, guiding every shopper from &quot;not sure&quot; to
                &quot;add to cart&quot; with visual proof and smart recommendations.
              </p>
              <div className="space-y-3">
                {capabilities.map((c, i) => {
                  const Icon = c.icon;
                  const isActive = activeCap === i;
                  return (
                    <button
                      key={c.label}
                      onMouseEnter={() => setActiveCap(i)}
                      onClick={() => setActiveCap(i)}
                      className={`w-full text-left flex items-center gap-4 p-4 rounded-xl border transition-all duration-500 ${
                        isActive
                          ? 'bg-primary/[0.08] border-primary/30 shadow-[0_0_30px_hsl(var(--primary)/0.08)] scale-[1.02]'
                          : 'bg-card/30 border-border/20'
                      }`}
                    >
                      <span className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                        isActive ? 'bg-primary text-primary-foreground' : 'bg-primary/10 text-primary'
                      }`}>
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="flex-1">
                        <span className={`block font-semibold text-sm transition-colors ${isActive ? 'text-foreground' : 'text-muted-foreground'}`}>
                          {c.label}
                        </span>
                        <span className={`block overflow-hidden transition-all duration-500 text-xs text-muted-foreground ${
                          isActive ? 'max-h-10 opacity-100 mt-0.5' : 'max-h-0 opacity-0'
                        }`}>
                          {c.detail}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
              <Link to="/demo" className="inline-block mt-8">
                <Button variant="hero" size="lg" className="group">
                  See AI in Action
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>

            {/* Right: animated chat */}
            <div className="relative">
              <ManthaBot className="absolute -top-24 -right-2 z-20 hidden md:block" />
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-b from-primary/20 via-transparent to-transparent blur-2xl opacity-60" />
              <div className="relative rounded-2xl bg-card/80 backdrop-blur-xl border border-border/50 shadow-2xl overflow-hidden">
                {/* Chat header */}
                <div className="flex items-center gap-3 px-5 py-4 border-b border-border/40 bg-card/90">
                  <div className="relative w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center pulse-glow">
                    <Bot className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-foreground">Mantha AI</p>
                    <p className="text-[11px] text-success flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                      Online — analysing your catalogue
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground/60 uppercase">Live demo</span>
                </div>
                {/* Messages */}
                <div className="p-5 space-y-4 min-h-[260px]">
                  {chat.slice(0, visibleMsgs).map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} fade-in-up`}>
                      <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-muted/60 border border-border/40 text-foreground rounded-bl-md'
                      }`}>
                        {m.text}
                      </div>
                    </div>
                  ))}
                  {typing && (
                    <div className="flex justify-start">
                      <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-muted/60 border border-border/40 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" />
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: '0.15s' }} />
                        <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/60 animate-bounce" style={{ animationDelay: '0.3s' }} />
                      </div>
                    </div>
                  )}
                </div>
                {/* Input bar */}
                <div className="px-5 pb-5">
                  <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-background/60 border border-border/40">
                    <span className="text-sm text-muted-foreground/60 flex-1">Ask Mantha about your catalogue…</span>
                    <span className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                      <ArrowRight className="h-4 w-4 text-primary-foreground" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
