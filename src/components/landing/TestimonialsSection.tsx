import { Star, Quote } from 'lucide-react';
import { motion } from 'framer-motion';

const testimonialsRow1 = [
  {
    name: 'Sarah Mitchell',
    role: 'Interior Designer',
    company: 'Mitchell Design Co.',
    image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    content: "ThinkDecor has completely transformed how I present design concepts to clients. What used to take hours in Photoshop now takes seconds. My clients love seeing their spaces transformed in real-time.",
    rating: 5,
  },
  {
    name: 'James Rodriguez',
    role: 'Homeowner',
    company: 'Austin, TX',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    content: "I was renovating my living room and couldn't decide on paint colors. ThinkDecor let me visualize 20 different options in my actual space. Saved me from making an expensive mistake!",
    rating: 5,
  },
  {
    name: 'Emily Chen',
    role: 'Real Estate Agent',
    company: 'Sotheby\'s',
    image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    content: "Virtual staging is a game-changer for selling properties. I use ThinkDecor to show buyers the potential of empty spaces. It's helped me close deals faster and at better prices.",
    rating: 5,
  },
];

const testimonialsRow2 = [
  {
    name: 'Michael Park',
    role: 'Furniture Retailer',
    company: 'Modern Living',
    image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face',
    content: "Our return rate dropped by 40% after we started letting customers visualize furniture in their homes before buying. ThinkDecor pays for itself many times over.",
    rating: 5,
  },
  {
    name: 'Lisa Thompson',
    role: 'Architect',
    company: 'Thompson & Associates',
    image: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face',
    content: "For quick concept iterations with clients, nothing beats ThinkDecor. It's become an essential part of our design workflow for residential projects.",
    rating: 5,
  },
  {
    name: 'David Kim',
    role: 'Home Renovator',
    company: 'DIY Enthusiast',
    image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&h=100&fit=crop&crop=face',
    content: "As someone who loves DIY projects, being able to see how different materials and colors look before buying has saved me so much time and money. Absolutely recommend!",
    rating: 5,
  },
];

// Combine arrays to ensure perfect seamless loops (double each item)
const row1Items = [...testimonialsRow1, ...testimonialsRow1];
const row2Items = [...testimonialsRow2, ...testimonialsRow2];

function TestimonialCard({ testimonial }: { testimonial: typeof testimonialsRow1[0] }) {
  return (
    <div className="w-[340px] sm:w-[380px] shrink-0 p-6 rounded-2xl bg-gradient-to-b from-white/[0.03] to-transparent border border-white/5 hover:border-primary/30 hover:bg-white/[0.04] transition-all duration-500 shadow-2xl flex flex-col justify-between relative overflow-hidden group select-none mr-6">
      
      {/* Background Soft Accent Glow */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 rounded-full bg-primary/0 group-hover:bg-primary/5 blur-xl transition-all duration-700 pointer-events-none" />
      
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between mb-4">
          {/* Author info */}
          <div className="flex items-center gap-3">
            <img
              src={testimonial.image}
              alt={testimonial.name}
              className="w-10 h-10 sm:w-11 sm:h-11 rounded-full object-cover border border-white/10 group-hover:border-primary/45 transition-colors duration-500"
            />
            <div className="text-left">
              <div className="font-semibold text-white text-sm sm:text-base tracking-tight">{testimonial.name}</div>
              <div className="text-[11px] sm:text-xs text-white/45">
                {testimonial.role} · {testimonial.company}
              </div>
            </div>
          </div>
          {/* Quote Mark */}
          <Quote className="h-6 w-6 text-primary/10 group-hover:text-primary/30 transition-colors duration-500" />
        </div>

        {/* Testimonial rating stars */}
        <div className="flex gap-0.5 mb-3.5">
          {Array.from({ length: testimonial.rating }).map((_, i) => (
            <Star key={i} className="h-3 w-3 sm:h-3.5 sm:w-3.5 fill-primary text-primary shadow-[0_0_8px_rgba(0,229,204,0.3)]" />
          ))}
        </div>

        {/* Content text */}
        <p className="text-white/70 text-xs sm:text-sm leading-relaxed font-light text-left">
          "{testimonial.content}"
        </p>
      </div>
    </div>
  );
}

export function TestimonialsSection() {
  return (
    <section className="py-24 sm:py-32 bg-transparent relative overflow-hidden">
      {/* Dynamic atmospheric radial backdrop */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-primary/[0.035] blur-[160px]" />
      </div>

      <div className="relative z-10 w-full">
        {/* Section Header */}
        <div className="container mx-auto px-4 sm:px-6 mb-16 sm:mb-20 text-center">
          <motion.p 
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-primary text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase mb-3"
          >
            Real Customer Impact
          </motion.p>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-white mb-6"
          >
            Loved by <span className="text-gradient-primary">Designers & Homeowners</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-base sm:text-lg text-white/50 max-w-2xl mx-auto font-light"
          >
            Join thousands of satisfied space designers and homeowners who have elevated their living environments with ThinkDecor.
          </motion.p>
        </div>

        {/* Master Scrolling Marquee Container (Borderless & Full-width) */}
        <div className="flex flex-col gap-6 w-full py-4 relative overflow-hidden select-none">
          {/* Edge vignettes fadeout */}
          <div className="absolute inset-y-0 left-0 w-16 sm:w-32 bg-gradient-to-r from-[#000504] to-transparent z-20 pointer-events-none" />
          <div className="absolute inset-y-0 right-0 w-16 sm:w-32 bg-gradient-to-l from-[#000504] to-transparent z-20 pointer-events-none" />

          {/* Row 1: Scrolling Left */}
          <div className="w-full overflow-hidden flex">
            <div className="animate-marquee-left flex py-1">
              {row1Items.map((testimonial, idx) => (
                <TestimonialCard key={`row1-${idx}`} testimonial={testimonial} />
              ))}
            </div>
          </div>

          {/* Row 2: Scrolling Right */}
          <div className="w-full overflow-hidden flex">
            <div className="animate-marquee-right flex py-1">
              {row2Items.map((testimonial, idx) => (
                <TestimonialCard key={`row2-${idx}`} testimonial={testimonial} />
              ))}
            </div>
          </div>
        </div>

        {/* Metric Stats Cards (Apple Bento Style) */}
        <div className="container mx-auto px-4 sm:px-6 mt-20 sm:mt-24">
          <div className="max-w-4xl mx-auto rounded-3xl border border-white/5 bg-black/45 backdrop-blur-md p-8 sm:p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute -inset-x-20 -inset-y-20 bg-primary/[0.01] blur-3xl rounded-full pointer-events-none" />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 relative z-10">
              {[
                { value: '10,000+', label: 'Happy Users' },
                { value: '50,000+', label: 'Rooms Designed' },
                { value: '4.9 / 5', label: 'Average Rating' },
                { value: '98%', label: 'Satisfaction Rate' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="text-center flex flex-col items-center justify-center"
                >
                  <div className="text-3xl sm:text-4xl font-black text-gradient-primary drop-shadow-[0_0_12px_rgba(0,229,204,0.25)] tracking-tight">
                    {stat.value}
                  </div>
                  <div className="text-[10px] sm:text-xs text-white/40 font-semibold uppercase tracking-wider mt-2.5">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}