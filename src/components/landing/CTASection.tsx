import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

export function CTASection() {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-card/50 to-background" />
      <motion.div 
        initial={{ opacity: 0, scale: 0.8 }}
        whileInView={{ opacity: 0.5, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-gradient-glow" 
      />
      
      {/* Decorative grid */}
      <div className="absolute inset-0 bg-grid opacity-10" />
      
      <div className="container relative z-10 mx-auto px-4 sm:px-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6, staggerChildren: 0.1 }}
          className="max-w-4xl mx-auto text-center"
        >
          {/* Badge */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full glass mb-8"
          >
            <Zap className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">
              Decor that thinks before you buy
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 sm:mb-8"
          >
            Ready to see your space
            <br />
            <span className="text-gradient-primary">with clarity?</span>
          </motion.h2>

          {/* Description */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            Join homeowners and brands who make confident decor decisions with Think Decor. 
            From guesswork to clarity, in seconds.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-8"
          >
            <Link to="/demo">
              <Button variant="hero" size="xl" className="text-base sm:text-lg px-8 sm:px-12 py-6 sm:py-7 group relative overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-primary/25">
                <span className="relative z-10 flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Try Demo Free
                  <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="hero-outline" size="xl" className="text-base sm:text-lg px-8 sm:px-12 py-6 sm:py-7 hover:bg-primary/5 hover:scale-105 active:scale-95 transition-all">
                Schedule a Demo
              </Button>
            </Link>
          </motion.div>

          {/* Trust text */}
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5 }}
            className="text-sm text-muted-foreground"
          >
            No credit card required • Free to explore • For homes and brands
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}