import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Brain, Sparkles, Eye, Palette, Wallet, Puzzle, ArrowRight } from 'lucide-react';
import { useState, useEffect } from 'react';

const capabilities = [
  { icon: Eye, label: "Understands room layouts", detail: "Analyses spatial dimensions, lighting conditions, and architectural features" },
  { icon: Palette, label: "Learns your style", detail: "Adapts to your aesthetic preferences over time" },
  { icon: Wallet, label: "Respects your budget", detail: "Suggests options that align with your spending comfort" },
  { icon: Puzzle, label: "Suggests combinations", detail: "Recommends what works well together harmoniously" },
];

const chatMessages = [
  { role: 'user' as const, text: "I want a modern look for my living room" },
  { role: 'ai' as const, text: "I see warm wood flooring and neutral walls. Let me suggest textures that complement your space..." },
  { role: 'ai' as const, text: "Try this matte concrete finish. It pairs beautifully with your existing furniture tones." },
];

export function ManthaSection() {
  const { ref: headerRef, isVisible: headerVisible } = useScrollAnimation();
  const [activeCapability, setActiveCapability] = useState(0);
  const [visibleMessages, setVisibleMessages] = useState(0);
  const [isTyping, setIsTyping] = useState(false);

  // Cycle through capabilities
  useEffect(() => {
    if (!headerVisible) return;
    const interval = setInterval(() => {
      setActiveCapability((prev) => (prev + 1) % capabilities.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [headerVisible]);

  // Animate chat messages
  useEffect(() => {
    if (!headerVisible) return;
    if (visibleMessages >= chatMessages.length) return;

    const timeout = setTimeout(() => {
      setIsTyping(true);
      setTimeout(() => {
        setIsTyping(false);
        setVisibleMessages((prev) => prev + 1);
      }, 1200);
    }, visibleMessages === 0 ? 800 : 2000);

    return () => clearTimeout(timeout);
  }, [headerVisible, visibleMessages]);

  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full bg-primary/5 blur-[120px] animate-[pulse_6s_ease-in-out_infinite]" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full bg-accent/5 blur-[80px] animate-[pulse_4s_ease-in-out_infinite_1s]" />
      </div>

      {/* Floating orbs */}
      <div className="absolute top-20 left-[15%] w-2 h-2 rounded-full bg-primary/40 animate-[pulse_3s_ease-in-out_infinite]" />
      <div className="absolute top-40 right-[20%] w-3 h-3 rounded-full bg-accent/30 animate-[pulse_4s_ease-in-out_infinite_0.5s]" />
      <div className="absolute bottom-32 left-[25%] w-2 h-2 rounded-full bg-primary/30 animate-[pulse_3.5s_ease-in-out_infinite_1s]" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div
            ref={headerRef}
            className={`text-center mb-16 transition-all duration-700 ${
              headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 mb-6">
              <Sparkles className="h-4 w-4" />
              AI Intelligence
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              Meet <span className="text-gradient-primary">Mantha</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              The intelligence behind Think Decor. Mantha doesn't just show decor. It helps you design with clarity and confidence.
            </p>
          </div>

          <div className={`grid lg:grid-cols-2 gap-10 items-start transition-all duration-700 delay-200 ${
            headerVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
            {/* Left: Interactive capabilities */}
            <div className="space-y-6">
              {/* Capability cards */}
              <div className="space-y-3">
                {capabilities.map((cap, index) => {
                  const Icon = cap.icon;
                  const isActive = activeCapability === index;
                  return (
                    <button
                      key={cap.label}
                      onClick={() => setActiveCapability(index)}
                      className={`w-full text-left p-4 rounded-xl border transition-all duration-500 group ${
                        isActive
                          ? 'bg-primary/10 border-primary/30 shadow-[0_0_30px_hsl(var(--primary)/0.1)]'
                          : 'bg-card/30 border-border/30 hover:border-border/60'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-500 ${
                          isActive ? 'bg-primary text-primary-foreground scale-110' : 'bg-primary/10 text-primary'
                        }`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold transition-colors duration-300 ${
                            isActive ? 'text-foreground' : 'text-muted-foreground'
                          }`}>{cap.label}</p>
                          <div className={`overflow-hidden transition-all duration-500 ${
                            isActive ? 'max-h-20 opacity-100 mt-1' : 'max-h-0 opacity-0'
                          }`}>
                            <p className="text-sm text-muted-foreground">{cap.detail}</p>
                          </div>
                        </div>
                        <ArrowRight className={`h-4 w-4 mt-1 flex-shrink-0 transition-all duration-300 ${
                          isActive ? 'text-primary translate-x-0 opacity-100' : 'text-muted-foreground -translate-x-2 opacity-0'
                        }`} />
                      </div>
                      {/* Progress bar */}
                      {isActive && (
                        <div className="mt-3 ml-[60px] h-0.5 rounded-full bg-border/50 overflow-hidden">
                          <div className="h-full bg-primary rounded-full animate-[progress_3s_linear]" style={{ width: '100%' }} />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>

              <p className="text-xl font-bold text-gradient-primary text-center lg:text-left pt-2">
                Design better, not costlier.
              </p>
            </div>

            {/* Right: Simulated AI chat interface */}
            <div className="relative">
              <div className="rounded-2xl border border-border/30 bg-card/60 backdrop-blur-sm overflow-hidden shadow-xl">
                {/* Chat header */}
                <div className="flex items-center gap-3 p-4 border-b border-border/30 bg-card/80">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                      <Brain className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-success border-2 border-card" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Mantha AI</p>
                    <p className="text-xs text-success">Online • Analysing your space</p>
                  </div>
                </div>

                {/* Chat messages */}
                <div className="p-4 space-y-4 min-h-[280px]">
                  {chatMessages.slice(0, visibleMessages).map((msg, i) => (
                    <div
                      key={i}
                      className={`flex animate-fade-in ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                        msg.role === 'user'
                          ? 'bg-primary text-primary-foreground rounded-br-md'
                          : 'bg-secondary/80 text-foreground border border-border/30 rounded-bl-md'
                      }`}>
                        {msg.role === 'ai' && (
                          <div className="flex items-center gap-1.5 mb-1">
                            <Sparkles className="h-3 w-3 text-primary" />
                            <span className="text-xs font-medium text-primary">Mantha</span>
                          </div>
                        )}
                        {msg.text}
                      </div>
                    </div>
                  ))}

                  {/* Typing indicator */}
                  {isTyping && (
                    <div className="flex justify-start animate-fade-in">
                      <div className="bg-secondary/80 border border-border/30 rounded-2xl rounded-bl-md px-4 py-3">
                        <div className="flex items-center gap-1.5 mb-1">
                          <Sparkles className="h-3 w-3 text-primary" />
                          <span className="text-xs font-medium text-primary">Mantha</span>
                        </div>
                        <div className="flex gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-[pulse_1s_ease-in-out_infinite]" />
                          <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-[pulse_1s_ease-in-out_infinite_0.2s]" />
                          <span className="w-2 h-2 rounded-full bg-muted-foreground/60 animate-[pulse_1s_ease-in-out_infinite_0.4s]" />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Input bar */}
                <div className="p-4 border-t border-border/30 bg-card/40">
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary/50 border border-border/30">
                    <span className="text-sm text-muted-foreground flex-1">Ask Mantha anything about your space...</span>
                    <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
                      <ArrowRight className="h-4 w-4 text-primary-foreground" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative glow behind card */}
              <div className="absolute -z-10 inset-0 rounded-2xl bg-primary/5 blur-xl scale-105" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
