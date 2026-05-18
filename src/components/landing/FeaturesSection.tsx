import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface FeatureBlockProps {
  title: string;
  description: string;
  imageUrl: string;
  imageAlt: string;
  reverse?: boolean;
  badge?: string;
  index: number;
}

function FeatureBlock({ title, description, imageUrl, imageAlt, reverse, badge, index }: FeatureBlockProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.7, delay: index * 0.1, type: "spring", stiffness: 50 }}
      className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${reverse ? 'lg:grid-flow-dense' : ''}`}
    >
      {/* Text Content */}
      <div className={`space-y-6 ${reverse ? 'lg:col-start-2' : ''}`}>
        {badge && (
          <motion.span 
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 + 0.3 }}
            className="inline-block px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20"
          >
            {badge}
          </motion.span>
        )}
        <h3 className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight">
          {title}
        </h3>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
      
      {/* Image */}
      <motion.div 
        whileHover={{ scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`relative ${reverse ? 'lg:col-start-1' : ''}`}
      >
        <div className="relative rounded-2xl overflow-hidden border border-border/30 shadow-xl group cursor-pointer">
          <img 
            src={imageUrl}
            alt={imageAlt}
            className="w-full aspect-[4/3] object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </div>
        {/* Decorative elements */}
        <div className="hidden sm:block absolute -z-10 -bottom-4 -right-4 w-full h-full rounded-2xl bg-primary/5 border border-primary/10" />
      </motion.div>
    </motion.div>
  );
}

export function FeaturesSection() {
  const features = [
    {
      title: "Bring Your Showroom to Your Customers' Homes",
      description: "Let customers visualize your furniture in their actual living spaces. Upload a room photo, and our AI instantly places your products in context - increasing purchase confidence and reducing returns.",
      imageUrl: "https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=800&h=600&fit=crop",
      imageAlt: "Furniture in living room",
      badge: "For Retailers",
    },
    {
      title: "Creative Redesign for Interiors and Exteriors",
      description: "Transform any space with a click. Change wall colors, swap flooring materials, update furniture styles, and experiment with different design aesthetics - all without lifting a paintbrush.",
      imageUrl: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?w=800&h=600&fit=crop",
      imageAlt: "Modern interior design",
      reverse: true,
    },
  ];

  return (
    <section className="py-24 lg:py-32 relative">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-20"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-6">
            Everything You Need to
            <span className="text-gradient-primary"> Transform Any Space</span>
          </h2>
          <p className="text-lg text-muted-foreground">
            Professional interior visualization tools that were once available only to designers - now accessible to everyone.
          </p>
        </motion.div>

        {/* Feature Blocks */}
        <div className="space-y-24 lg:space-y-32">
          {features.map((feature, index) => (
            <FeatureBlock key={index} {...feature} index={index} />
          ))}
        </div>

        {/* CTA after features */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-24 text-center"
        >
          <Link to="/demo">
            <Button variant="hero" size="xl" className="text-lg px-10 group relative overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-lg hover:shadow-primary/25">
              <span className="relative z-10 flex items-center gap-2">
                Try It Now - It's Free
                <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
}