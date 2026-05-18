import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 20 }
  },
};

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-32 pb-20 bg-[#000504]">
      
      {/* Background Video (Seamlessly Blended Backdrop) */}
      <div className="absolute inset-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <video 
          src="/mp_.mp4" 
          autoPlay 
          loop 
          muted 
          playsInline 
          className="w-full h-full object-cover opacity-60 sm:opacity-75 scale-105 filter saturate-[1.0]"
        />
        
        {/* Color Overlay to match ThinkDecor's dark green/teal brand colors */}
        <div className="absolute inset-0 bg-[#000504]/25 mix-blend-multiply" />

        {/* Radial vignette mask to dissolve video boundaries into the website canvas */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,#000504_90%)]" />

        {/* Bottom feather mask to smoothly merge into the next sections */}
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-[#000504] via-[#000504]/80 to-transparent" />
        
        {/* Top feather mask to blend into the sticky Navbar header */}
        <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-[#000504] to-transparent" />
      </div>

      {/* Main Text Content Overlaid on the Video Backdrop */}
      <div className="container relative z-10 px-4 sm:px-6 flex flex-col items-center justify-center h-full">
        
        <motion.div 
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="w-full text-center z-30 flex flex-col items-center max-w-5xl mx-auto"
        >
          {/* Small Tagline */}
          <motion.div variants={itemVariants} className="mb-6">
            <p className="text-xs sm:text-sm font-semibold text-white/50 mb-1.5 uppercase tracking-[0.2em]">
              ThinkDecor Exclusive
            </p>
            <p className="text-primary font-bold text-lg sm:text-2xl tracking-wider">
              AI-powered decor intelligence
            </p>
          </motion.div>

          {/* Huge Main Headline with custom text drop shadows */}
          <motion.h1 
            variants={itemVariants} 
            className="text-5xl sm:text-7xl md:text-8xl lg:text-[7rem] font-bold tracking-tight text-white mb-10 leading-[1.05]"
            style={{ textShadow: '0 4px 24px rgba(0, 0, 0, 0.65)' }}
          >
            Decor that thinks
            <br />
            before you buy.
          </motion.h1>

          {/* Subtitle / Value Prop */}
          <motion.p 
            variants={itemVariants} 
            className="text-base sm:text-lg md:text-xl text-white/70 max-w-2xl mx-auto mb-10 font-light"
            style={{ textShadow: '0 2px 10px rgba(0, 0, 0, 0.5)' }}
          >
            See exactly how furniture, colors, and textures blend in your actual rooms before purchasing. Pure AI magic.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/demo">
              <Button size="xl" className="text-base sm:text-lg px-10 sm:px-14 py-6 sm:py-8 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full transition-all hover:scale-105 active:scale-95 shadow-xl shadow-primary/30 font-bold tracking-wide">
                <span className="flex items-center gap-2">
                  Get Started
                  <ArrowRight className="h-5 w-5" />
                </span>
              </Button>
            </Link>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
}