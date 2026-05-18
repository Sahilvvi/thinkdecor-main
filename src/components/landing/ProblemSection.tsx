import { motion } from 'framer-motion';
import { useState, useRef } from 'react';
import { Eye, Home, CircleDollarSign, Compass, MessageSquare, AlertTriangle } from 'lucide-react';

const doubts = [
  {
    icon: Eye,
    title: "Visual Fit",
    text: "Will this actually look good in my room?",
    description: "Hard to visualize scales and matching colors before buying."
  },
  {
    icon: Home,
    title: "Atmosphere",
    text: "What if it feels different at home?",
    description: "Lighting and room dimensions change everything."
  },
  {
    icon: CircleDollarSign,
    title: "Value Check",
    text: "Is this really worth the money?",
    description: "Avoid expensive returns and buyer regret."
  },
  {
    icon: Compass,
    title: "Decision Confidence",
    text: "How confident am I about this choice?",
    description: "Shop with absolute clarity and peace of mind."
  }
];

export function ProblemSection() {
  const [sliderPosition, setSliderPosition] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);

  const handleMove = (clientX: number) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const percentage = Math.max(0, Math.min(100, (x / rect.width) * 100));
    setSliderPosition(percentage);
  };

  const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
    isDragging.current = true;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    handleMove(clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    handleMove(e.clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || e.touches.length === 0) return;
    handleMove(e.touches[0].clientX);
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <section className="relative py-24 sm:py-32 bg-transparent overflow-hidden">
      {/* Background spotlights & grid */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-primary/[0.04] blur-[150px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] rounded-full bg-primary/[0.04] blur-[150px]" />
        <div className="absolute inset-0 bg-grid opacity-[0.012]" />
      </div>

      <div className="container relative z-10 px-4 sm:px-6 mx-auto">
        <div className="max-w-6xl mx-auto flex flex-col items-center">
          
          {/* Top Brand Tag (Premium Apple-style pill) */}
          <motion.div 
            initial={{ opacity: 0, y: -15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col items-center mb-6 text-center"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold uppercase tracking-[0.2em] mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              ThinkDecor AI
            </div>
            <p className="text-white/60 text-xs sm:text-sm tracking-wider font-light max-w-md">
              Precision Spatial Visualizer &bull; Live spatial engine
            </p>
          </motion.div>

          {/* Section Heading Label */}
          <motion.h2 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-white/40 text-sm font-semibold uppercase tracking-[0.15em] mb-2 text-center"
          >
            Solve the home styling doubt loop
          </motion.h2>

          {/* Massive Watermark Backdrop & Overlaid Main Headline Container */}
          <div className="relative w-full flex items-center justify-center mb-16 py-4">
            {/* Giant Glowing Question Mark Watermark (Apple outline styling) */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[14rem] sm:text-[18rem] md:text-[22rem] font-bold text-primary/[0.03] select-none pointer-events-none font-sans leading-none blur-[1px] tracking-tighter">
              ?
            </div>

            {/* Main Headline Overlaid with a stunning top-to-bottom white-to-gray gradient */}
            <motion.h1 
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-center max-w-4xl leading-[1.08] z-10 bg-gradient-to-b from-white via-white to-white/70 bg-clip-text text-transparent"
            >
              Decor decisions shouldn't
              <br />
              feel this uncertain.
            </motion.h1>
          </div>

          {/* Bento Column Layout (Phone Mockup + Vertical Cards) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center w-full z-10">
            
            {/* Left Column: Phone Mockup / Doubt Loop Tracker (5/12 width) */}
            <div className="lg:col-span-5 flex justify-center w-full relative px-4">
              
              {/* Phone Container Wrapper to support external side buttons */}
              <div className="relative w-full max-w-[320px] aspect-[9/18] group">
                
                {/* PHYSICAL SIDE BUTTONS (High-end Apple 3D detailing) */}
                {/* Ring/Silent Switch (Left) */}
                <div className="absolute -left-[6px] top-20 w-[6px] h-6 bg-gradient-to-b from-white/20 to-white/10 rounded-l-md border-l border-y border-white/10 shadow-[0_2px_4px_rgba(0,0,0,0.5)] z-0" />
                {/* Volume Up Button (Left) */}
                <div className="absolute -left-[6px] top-32 w-[6px] h-12 bg-gradient-to-b from-white/20 to-white/10 rounded-l-md border-l border-y border-white/10 shadow-[0_2px_4px_rgba(0,0,0,0.5)] z-0" />
                {/* Volume Down Button (Left) */}
                <div className="absolute -left-[6px] top-48 w-[6px] h-12 bg-gradient-to-b from-white/20 to-white/10 rounded-l-md border-l border-y border-white/10 shadow-[0_2px_4px_rgba(0,0,0,0.5)] z-0" />
                {/* Power/Side Button (Right) */}
                <div className="absolute -right-[6px] top-36 w-[6px] h-16 bg-gradient-to-b from-white/20 to-white/10 rounded-r-md border-r border-y border-white/10 shadow-[0_2px_4px_rgba(0,0,0,0.5)] z-0" />

                {/* Main Phone Body */}
                <motion.div 
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, type: 'spring', stiffness: 90, damping: 15 }}
                  className="relative w-full h-full rounded-[46px] border-[6px] border-white/10 bg-[#000504]/90 p-4 shadow-[0_0_60px_rgba(0,229,204,0.08)] overflow-hidden z-10 hover:border-primary/20 transition-colors duration-500"
                >
                  {/* Dynamic Island Notch */}
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-28 h-6 bg-black rounded-full border border-white/5 z-30 flex items-center justify-center gap-1.5 px-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    <span className="text-[7px] text-primary/80 font-bold uppercase tracking-widest">Spatial Active</span>
                  </div>
                  
                  {/* Screen background glow */}
                  <div className="absolute -top-20 -left-20 w-48 h-48 rounded-full bg-primary/[0.08] blur-3xl pointer-events-none" />
                  <div className="absolute -bottom-20 -right-20 w-48 h-48 rounded-full bg-cyan-500/[0.05] blur-3xl pointer-events-none" />
                  
                  {/* Phone Status Bar */}
                  <div className="flex justify-between items-center text-[9px] text-white/50 mb-4 pt-1 px-2 z-20 relative">
                    <span className="font-semibold">9:41</span>
                    <div className="flex gap-1.5 items-center">
                      <span className="w-2.5 h-1.5 rounded-sm bg-white/40" />
                      <span className="w-3.5 h-2 rounded-sm bg-white/40" />
                    </div>
                  </div>

                  {/* THINKDECOR APP BRANDING HEADER (Highly detailed mobile UI navbar) */}
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10 z-20 relative">
                    <div className="flex items-center gap-1.5">
                      <img src="/logo.png?v=3" alt="D" className="w-4 h-4 rounded" />
                      <div className="text-left">
                        <span className="text-[10px] font-bold text-white tracking-wide block leading-none">ThinkDecor</span>
                        <span className="text-[7px] text-primary font-medium tracking-wide uppercase leading-none block mt-0.5">Spatial Engine v2.0</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-[6px] text-primary uppercase font-bold tracking-wider">
                      <span className="w-1 h-1 rounded-full bg-primary animate-ping" />
                      Live
                    </div>
                  </div>

                  {/* App Main UI Screen Area */}
                  <div className="flex flex-col justify-between h-[82%] z-20 relative">
                    
                    {/* Simulated Mini Spatial Canvas / Before-After Slider Mockup */}
                    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-2 mb-2 relative overflow-hidden group/canvas">
                      <div 
                        ref={containerRef}
                        onMouseDown={handleMouseDown}
                        onMouseMove={handleMouseMove}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={handleMouseDown}
                        onTouchMove={handleTouchMove}
                        onTouchEnd={handleMouseUp}
                        className="aspect-[16/10] rounded-lg overflow-hidden relative bg-black/40 cursor-ew-resize select-none"
                      >
                        {/* Base Background Image: After (Styled Room) */}
                        <img 
                          src="/assets/samples/styled_room.png" 
                          alt="Styled room" 
                          className="w-full h-full object-cover pointer-events-none select-none" 
                          style={{ filter: 'brightness(0.7)' }}
                        />

                        {/* Top Clipped Image: Before (Empty Room) */}
                        <div 
                          className="absolute inset-0 pointer-events-none select-none"
                          style={{ clipPath: `inset(0 ${100 - sliderPosition}% 0 0)` }}
                        >
                          <img 
                            src="/assets/samples/empty_room.png" 
                            alt="Empty room" 
                            className="w-full h-full object-cover" 
                            style={{ filter: 'brightness(0.7)' }}
                          />
                        </div>

                        {/* Target reticle styling overlay */}
                        <div className="absolute inset-0 border border-primary/20 rounded-lg pointer-events-none" />
                        <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-primary pointer-events-none" />
                        <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-primary pointer-events-none" />
                        <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-primary pointer-events-none" />
                        <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-primary pointer-events-none" />
                        
                        {/* Mini slider divider indicator */}
                        <div 
                          className="absolute inset-y-0 w-0.5 bg-primary shadow-[0_0_10px_rgba(0,229,204,0.8)] z-10 pointer-events-none"
                          style={{ left: `${sliderPosition}%` }}
                        >
                          <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(0,229,204,0.6)]">
                            <span className="text-[6px] text-black font-bold font-mono select-none">&lt;&gt;</span>
                          </div>
                        </div>
                        <div className="absolute bottom-2 left-3 text-[7px] text-white/70 bg-black/60 px-1.5 py-0.5 rounded pointer-events-none select-none backdrop-blur-sm">Before</div>
                        <div className="absolute bottom-2 right-3 text-[7px] text-primary bg-black/60 px-1.5 py-0.5 rounded pointer-events-none select-none backdrop-blur-sm">After</div>
                      </div>
                      <div className="flex justify-between items-center mt-2 px-1 text-[8px] text-white/50">
                        <span>Project: LivingRoom_Edit_1</span>
                        <span className="text-primary font-bold">94% Confidence</span>
                      </div>
                    </div>

                    {/* Staggered, Bouncy Chat Bubbles representing doubts */}
                    <div className="space-y-3 flex-1 flex flex-col justify-end pb-3">
                      
                      <motion.div 
                        initial={{ opacity: 0, y: 15, scale: 0.9 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2, type: 'spring', stiffness: 120, damping: 10 }}
                        className="p-2.5 rounded-2xl rounded-tl-none bg-white/[0.02] border border-white/5 text-[9px] text-left"
                      >
                        <p className="text-white/50 text-[7px] mb-0.5 font-bold uppercase tracking-wider flex items-center gap-1"><MessageSquare className="w-2.5 h-2.5 text-primary" /> Visual fit</p>
                        <span className="text-white/90 font-medium">💭 "Will this green sofa match my walls?"</span>
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 15, scale: 0.9 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.4, type: 'spring', stiffness: 120, damping: 10 }}
                        className="p-2.5 rounded-2xl rounded-tl-none bg-white/[0.02] border border-white/5 text-[9px] text-left"
                      >
                        <p className="text-white/50 text-[7px] mb-0.5 font-bold uppercase tracking-wider flex items-center gap-1"><MessageSquare className="w-2.5 h-2.5 text-cyan-400" /> Lighting shift</p>
                        <span className="text-white/90 font-medium">💭 "What if night lighting changes the look entirely?"</span>
                      </motion.div>

                      <motion.div 
                        initial={{ opacity: 0, y: 15, scale: 0.9 }}
                        whileInView={{ opacity: 1, y: 0, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.6, type: 'spring', stiffness: 120, damping: 10 }}
                        className="p-2.5 rounded-2xl rounded-tl-none bg-white/[0.02] border border-white/5 text-[9px] text-left"
                      >
                        <p className="text-white/50 text-[7px] mb-0.5 font-bold uppercase tracking-wider flex items-center gap-1"><MessageSquare className="w-2.5 h-2.5 text-emerald-400" /> Buyer regret</p>
                        <span className="text-white/90 font-medium">💭 "Returns cost hundreds... Is it really worth it?"</span>
                      </motion.div>

                      {/* Doubt Loop Indicator (Styled perfectly to match ThinkDecor app error alerts) */}
                      <motion.div 
                        initial={{ scale: 0.9, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.8, type: 'spring', stiffness: 140, damping: 12 }}
                        className="p-2 rounded-xl bg-red-500/10 border border-red-500/20 text-center"
                      >
                        <div className="flex items-center justify-center gap-1 text-[8px] font-bold text-red-400 uppercase tracking-widest">
                          <AlertTriangle className="w-3 h-3 animate-pulse" />
                          Doubt Loop Active
                        </div>
                      </motion.div>

                    </div>
                  </div>
                </motion.div>

              </div>
            </div>

            {/* Right Column: Premium Vertical Cards (7/12 width) */}
            <div className="lg:col-span-7 flex flex-col gap-5 w-full">
              {doubts.map((doubt, index) => {
                const IconComp = doubt.icon;
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    className="group relative rounded-2xl border border-white/10 bg-white/[0.01] p-5 sm:p-6 flex gap-5 items-center text-left overflow-hidden transition-all duration-500 hover:border-primary/30 hover:bg-white/[0.03] hover:-translate-y-1 shadow-[0_8px_30px_rgb(0,0,0,0.12)] hover:shadow-[0_20px_50px_rgba(0,229,204,0.04)]"
                  >
                    {/* Ambient spotlight glow inside each card */}
                    <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-primary/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    
                    {/* Premium Icon Box */}
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-white/10 to-white/[0.02] border border-white/10 flex items-center justify-center text-primary flex-shrink-0 group-hover:scale-105 group-hover:border-primary/40 group-hover:bg-primary/10 transition-all duration-500 shadow-lg">
                      <IconComp className="w-5 h-5 transition-transform duration-500 group-hover:rotate-6" />
                    </div>
                    
                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex flex-wrap items-baseline justify-between mb-1.5">
                        <h3 className="text-white font-semibold text-base tracking-tight group-hover:text-primary transition-colors duration-300">
                          {doubt.title}
                        </h3>
                        <span className="text-[9px] uppercase font-bold tracking-widest text-white/30 group-hover:text-primary/50 transition-colors">Pillar 0{index + 1}</span>
                      </div>
                      <p className="text-white/90 text-sm font-medium leading-relaxed mb-1">
                        {doubt.text}
                      </p>
                      <p className="text-white/50 text-xs font-light leading-relaxed group-hover:text-white/70 transition-colors duration-300">
                        {doubt.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
