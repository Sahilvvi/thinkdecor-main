import { useState, useEffect, useRef } from 'react';
import { Eye, Lightbulb, Palette, CheckCircle, Sparkles, Sliders, MessageSquare, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const doubts = [
  {
    icon: Eye,
    title: "Understand Your Space",
    tagline: "AI SPATIAL MAPPING",
    description: "ThinkDecor's engine analyzes your uploaded room photos, instantly calculating depth, lighting angles, and spatial proportions.",
    visualType: "scan"
  },
  {
    icon: Palette,
    title: "Visualise Options",
    tagline: "SPATIAL THEME INJECTOR",
    description: "Swap furniture, test flooring textures, and explore completely different interior aesthetics in real-time, rendered directly in your room.",
    visualType: "visualize"
  },
  {
    icon: Lightbulb,
    title: "Get Guided Suggestions",
    tagline: "MANTHA ASSISTANT",
    description: "Get curated suggestions from Mantha, our AI design companion. She designs within your specific room mood and budget boundaries.",
    visualType: "ai"
  },
  {
    icon: CheckCircle,
    title: "Decide with Confidence",
    tagline: "ZERO REGRET CHECKOUT",
    description: "Compare your final styled space side-by-side with your original room. Order with absolute certainty that every item fits and matches.",
    visualType: "checkout"
  },
];

export function ThinkDecorWaySection() {
  const [activeStep, setActiveStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const startAutoplay = (stepIndex: number) => {
    stopAutoplay();
    setActiveStep(stepIndex);
    setProgress(0);

    // Dynamic progress bar filling (6000ms duration per step)
    const stepDuration = 6000;
    const intervalTime = 50; // Update progress every 50ms
    const totalTicks = stepDuration / intervalTime;
    let currentTick = 0;

    progressIntervalRef.current = setInterval(() => {
      currentTick += 1;
      const currentPercent = (currentTick / totalTicks) * 100;
      setProgress(Math.min(currentPercent, 100));
    }, intervalTime);

    intervalRef.current = setTimeout(() => {
      const nextStep = (stepIndex + 1) % doubts.length;
      startAutoplay(nextStep);
    }, stepDuration);
  };

  const stopAutoplay = () => {
    if (intervalRef.current) clearTimeout(intervalRef.current);
    if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
  };

  useEffect(() => {
    startAutoplay(0);
    return () => stopAutoplay();
  }, []);

  const handleStepClick = (index: number) => {
    startAutoplay(index);
  };

  return (
    <section className="py-24 sm:py-32 bg-transparent relative overflow-hidden">
      {/* Background visual treatments */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-[#053b34]/10 blur-[150px]" />
        <div className="absolute inset-0 bg-grid opacity-[0.02]" />
      </div>

      <div className="container relative z-10 px-4 sm:px-6 mx-auto">
        
        {/* Section Header (Apple-styled) */}
        <div className="max-w-3xl mb-16 md:mb-24 text-left">
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-primary text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase mb-3"
          >
            The Styling Paradigm Shift
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6"
          >
            The <span className="text-gradient-primary">Think Decor</span> Way
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-base sm:text-lg md:text-xl text-white/50 font-light"
          >
            A smarter, AI-driven approach to decorating. Moving you smoothly from spatial uncertainty to design clarity.
          </motion.p>
        </div>

        {/* Master Apple Split Dashboard Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-stretch max-w-6xl mx-auto">
          
          {/* Left Column: Premium Stepper Timeline */}
          <div className="lg:col-span-5 flex flex-col justify-center space-y-4">
            {doubts.map((step, index) => {
              const IconComponent = step.icon;
              const isActive = activeStep === index;
              
              return (
                <div
                  key={index}
                  onClick={() => handleStepClick(index)}
                  className={`relative p-5 sm:p-6 rounded-2xl border transition-all duration-500 cursor-pointer flex gap-5 text-left items-start group select-none ${
                    isActive 
                      ? 'bg-white/[0.03] border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)]'
                      : 'bg-transparent border-transparent hover:bg-white/[0.01] hover:border-white/5'
                  }`}
                >
                  
                  {/* Left edge animated progress bar */}
                  {isActive && (
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-white/10 rounded-full overflow-hidden">
                      <div 
                        className="w-full bg-primary rounded-full transition-all duration-75 ease-linear"
                        style={{ height: `${progress}%` }}
                      />
                    </div>
                  )}

                  {/* Icon Box */}
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 transition-all duration-500 ${
                    isActive 
                      ? 'bg-primary text-[#011411] shadow-[0_0_20px_rgba(0,229,204,0.35)]'
                      : 'bg-white/5 text-white/50 group-hover:text-white/80'
                  }`}>
                    <IconComponent className="w-5.5 h-5.5 sm:w-6 sm:h-6" />
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <span className={`text-[10px] sm:text-xs font-semibold tracking-wider transition-colors duration-500 ${
                      isActive ? 'text-primary' : 'text-white/30'
                    }`}>
                      {step.tagline}
                    </span>
                    <h3 className="text-white font-semibold text-lg sm:text-xl mt-1 tracking-tight">
                      {step.title}
                    </h3>
                    
                    {/* Collapsible description details */}
                    <div className={`overflow-hidden transition-all duration-500 ease-in-out ${
                      isActive ? 'max-h-24 opacity-100 mt-2.5' : 'max-h-0 opacity-0'
                    }`}>
                      <p className="text-white/60 text-xs sm:text-sm font-light leading-relaxed">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Absolute index number */}
                  <div className="absolute right-6 top-6 text-white/10 font-mono text-sm font-bold">
                    0{index + 1}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Premium Visual Showcase Board */}
          <div className="lg:col-span-7 flex flex-col items-center justify-center">
            <div className="relative w-full aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-md shadow-[0_50px_100px_rgba(0,0,0,0.65)] p-4 sm:p-6 flex items-center justify-center">
              
              {/* Subtle glass reflection overlay */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-20" />
              
              {/* Dynamic Interactive Showcases */}
              <AnimatePresence mode="wait">
                {activeStep === 0 && (
                  <motion.div
                    key="scan"
                    initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                    transition={{ duration: 0.6 }}
                    className="relative w-full h-full flex flex-col items-center justify-center bg-[#02100e] rounded-2xl overflow-hidden border border-white/5 p-6"
                  >
                    {/* Glowing scanning laser lines */}
                    <div className="absolute inset-x-0 h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_rgba(0,229,204,0.8)] animate-[scan_3s_ease-in-out_infinite]" />
                    
                    {/* Abstract room outline grid */}
                    <div className="w-full max-w-[280px] sm:max-w-[340px] aspect-[4/3] border border-white/10 rounded-lg relative flex items-center justify-center bg-black/30">
                      <div className="absolute inset-4 border border-dashed border-white/5 flex items-center justify-center">
                        <div className="absolute inset-4 border border-white/5 flex items-center justify-center">
                          <Eye className="w-8 h-8 text-primary/30 animate-pulse" />
                        </div>
                      </div>
                      
                      {/* Floating node pins */}
                      <span className="absolute top-[20%] left-[30%] w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(0,229,204,0.8)] animate-ping" />
                      <span className="absolute top-[60%] left-[75%] w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(0,229,204,0.8)] animate-pulse" />
                      <span className="absolute bottom-[20%] left-[15%] w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_8px_rgba(0,229,204,0.8)]" />
                    </div>

                    <div className="mt-5 flex items-center gap-2 text-primary font-mono text-[10px] uppercase tracking-widest bg-primary/10 px-3.5 py-1.5 rounded-full">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '3s' }} />
                      AI Mapping Active
                    </div>
                  </motion.div>
                )}

                {activeStep === 1 && (
                  <motion.div
                    key="visualize"
                    initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                    transition={{ duration: 0.6 }}
                    className="relative w-full h-full flex flex-col items-center justify-center bg-[#02100e] rounded-2xl overflow-hidden border border-white/5 p-6"
                  >
                    {/* Before/After Split Mockup */}
                    <div className="w-full max-w-[280px] sm:max-w-[340px] aspect-[4/3] rounded-lg relative overflow-hidden bg-black/40 border border-white/10">
                      
                      {/* Left side (Before) */}
                      <div className="absolute inset-0 bg-[#053b34]/15 flex items-center justify-center">
                        <span className="text-white/20 font-bold uppercase tracking-widest text-xs select-none">Raw Photo</span>
                      </div>

                      {/* Right side (After - slider reveal) */}
                      <div className="absolute top-0 bottom-0 right-0 bg-[#082a25] flex items-center justify-center border-l-2 border-primary overflow-hidden animate-[splitReveal_4s_ease-in-out_infinite]">
                        <div className="w-[340px] h-full flex items-center justify-center shrink-0 pr-8">
                          <span className="text-primary font-bold uppercase tracking-[0.2em] text-xs">Decor Render</span>
                        </div>
                      </div>
                      
                      {/* Vertical line tracker */}
                      <div className="absolute top-0 bottom-0 w-[2px] bg-primary shadow-[0_0_10px_rgba(0,229,204,0.8)] animate-[sliderMove_4s_ease-in-out_infinite]" />
                    </div>

                    <div className="mt-5 flex items-center gap-2 text-primary font-mono text-[10px] uppercase tracking-widest bg-primary/10 px-3.5 py-1.5 rounded-full">
                      <Sliders className="w-3.5 h-3.5 animate-bounce" />
                      Dynamic Theme Swap
                    </div>
                  </motion.div>
                )}

                {activeStep === 2 && (
                  <motion.div
                    key="ai"
                    initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                    transition={{ duration: 0.6 }}
                    className="relative w-full h-full flex flex-col items-center justify-center bg-[#02100e] rounded-2xl overflow-hidden border border-white/5 p-6"
                  >
                    {/* Simulated Mantha Chat Suggestions UI */}
                    <div className="w-full max-w-[320px] space-y-4">
                      
                      {/* Mantha Avatar & Bubble */}
                      <div className="flex items-start gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-[#011411] font-bold text-xs shrink-0 shadow-lg">
                          M
                        </div>
                        <div className="bg-white/[0.04] border border-white/10 p-3.5 rounded-2xl rounded-tl-none text-left">
                          <p className="text-white/80 text-[11px] sm:text-xs leading-relaxed">
                            "I suggest pairing a **Deep Olive Armchair** to match your room's walnut floor. Here is a custom palette:"
                          </p>
                        </div>
                      </div>

                      {/* Color Palette swatches */}
                      <div className="flex items-center gap-3 pl-11">
                        <span className="w-6 h-6 rounded-full bg-[#053b34] border border-white/10 shadow-lg" />
                        <span className="w-6 h-6 rounded-full bg-[#a27b5c] border border-white/10 shadow-lg" />
                        <span className="w-6 h-6 rounded-full bg-[#dcd7c9] border border-white/10 shadow-lg" />
                        <span className="w-6 h-6 rounded-full bg-[#2c3e50] border border-white/10 shadow-lg" />
                      </div>
                    </div>

                    <div className="mt-8 flex items-center gap-2 text-primary font-mono text-[10px] uppercase tracking-widest bg-primary/10 px-3.5 py-1.5 rounded-full">
                      <MessageSquare className="w-3.5 h-3.5" />
                      Mantha Design Engine
                    </div>
                  </motion.div>
                )}

                {activeStep === 3 && (
                  <motion.div
                    key="checkout"
                    initial={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                    animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
                    exit={{ opacity: 0, scale: 0.95, filter: 'blur(10px)' }}
                    transition={{ duration: 0.6 }}
                    className="relative w-full h-full flex flex-col items-center justify-center bg-[#02100e] rounded-2xl overflow-hidden border border-white/5 p-6"
                  >
                    {/* Simulated purchase checkout checklist */}
                    <div className="w-full max-w-[280px] space-y-3.5 bg-black/30 border border-white/5 rounded-xl p-5 text-left">
                      <div className="flex items-center gap-3 text-xs text-white/80">
                        <div className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">✓</div>
                        Room proportions matched
                      </div>
                      <div className="flex items-center gap-3 text-xs text-white/80">
                        <div className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">✓</div>
                        Wall color palette verified
                      </div>
                      <div className="flex items-center gap-3 text-xs text-white/80">
                        <div className="w-4 h-4 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold">✓</div>
                        Selected pieces fit budget
                      </div>
                      
                      <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                        <span className="text-[10px] text-white/40 font-bold uppercase tracking-wider">Spatial Assurance</span>
                        <span className="text-[10px] text-primary font-bold uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded">100% Risk Free</span>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center gap-2 text-primary font-mono text-[10px] uppercase tracking-widest bg-primary/10 px-3.5 py-1.5 rounded-full">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Spatial Fit Verified
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
