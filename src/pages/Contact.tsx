import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useState } from 'react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import {
  Mail, Phone, MapPin, Clock, ArrowRight, MessageCircle,
  Building2, Globe, Shield, Zap, Users, CheckCircle2,
  Send, Headphones, BookOpen, HelpCircle
} from 'lucide-react';

const companySizes = ['1-10', '11-50', '51-200', '201-500', '500+'];
const industries = ['Furniture', 'Home Decor', 'Flooring', 'Wallpaper', 'Interior Design', 'Real Estate', 'Architecture', 'Other'];
const regions = ['North America', 'Europe', 'Asia Pacific', 'Middle East', 'Africa', 'Latin America', 'India'];

const contactMethods = [
  { icon: Mail, label: "Email Us", value: "info@thinkdecor.app", detail: "We respond within 24 hours" },
  { icon: Phone, label: "Call Us", value: "+91 98765 43210", detail: "Mon–Fri, 9 AM – 6 PM IST" },
  { icon: MapPin, label: "Visit Us", value: "Bangalore, India", detail: "Schedule a visit first" },
  { icon: Clock, label: "Office Hours", value: "9 AM – 6 PM IST", detail: "Monday through Friday" },
];

const reasons = [
  { icon: Building2, label: "Brand Partnership", desc: "Integrate Think Decor with your product line" },
  { icon: Headphones, label: "Product Support", desc: "Get help with your existing account" },
  { icon: BookOpen, label: "Media & Press", desc: "Press kits, interviews, and collaborations" },
  { icon: HelpCircle, label: "General Inquiry", desc: "Any other questions or feedback" },
];

const faqs = [
  { q: "How quickly can we integrate Think Decor?", a: "Most brands are live within 2-4 weeks. Our team handles the heavy lifting so your team can focus on what matters." },
  { q: "Is there a free trial available?", a: "Yes! We offer a 14-day free trial for brands to explore the platform with their own product catalogue." },
  { q: "Do you support custom branding?", a: "Absolutely. The visualisation experience can be fully white-labelled to match your brand identity." },
  { q: "What kind of support do you offer?", a: "We provide dedicated onboarding, priority email support, and a shared Slack channel for enterprise partners." },
];

const trustPoints = [
  { icon: Shield, text: "Your data is secure and private" },
  { icon: Zap, text: "Response within 24 hours" },
  { icon: Users, text: "Dedicated account manager" },
  { icon: Globe, text: "Supporting brands globally" },
];

export default function Contact() {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { ref: methodsRef, isVisible: methodsVisible } = useScrollAnimation();
  const { ref: formRef, isVisible: formVisible } = useScrollAnimation();
  const { ref: faqRef, isVisible: faqVisible } = useScrollAnimation();
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollAnimation();

  const [loading, setLoading] = useState(false);
  const [selectedReason, setSelectedReason] = useState<number | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [methodHover, setMethodHover] = useState<number | null>(null);
  const [companySize, setCompanySize] = useState('');
  const [industry, setIndustry] = useState('');
  const [region, setRegion] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const submission = {
      name: (formData.get('name') as string)?.trim(),
      email: (formData.get('email') as string)?.trim(),
      phone: (formData.get('phone') as string)?.trim() || null,
      company: (formData.get('company') as string)?.trim() || null,
      company_size: companySize || null,
      industry: industry || null,
      region: region || null,
      reason: selectedReason !== null ? reasons[selectedReason].label : null,
      message: (formData.get('message') as string)?.trim(),
    };

    try {
      const { error } = await supabase.from('contact_submissions').insert(submission);
      if (error) throw error;
      toast.success("Message sent! We'll be in touch soon.");
      form.reset();
      setSelectedReason(null);
      setCompanySize('');
      setIndustry('');
      setRegion('');
    } catch (err) {
      console.error('Contact form error:', err);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24">

        {/* Hero */}
        <section className="py-20 lg:py-32 relative overflow-hidden bg-transparent">
          {/* Ambient spotlights */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/[0.04] blur-[160px]" />
            <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-cyan-500/[0.03] blur-[120px]" />
          </div>
          <div className="absolute inset-0 bg-grid opacity-[0.012]" />

          <div
            ref={heroRef}
            className={`container relative z-10 mx-auto px-4 sm:px-6 transition-all duration-700 ${
              heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="max-w-4xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs font-semibold uppercase tracking-[0.2em] mb-6">
                <MessageCircle className="h-4 w-4" />
                Get in Touch
              </div>
              <h1 className="text-4xl sm:text-6xl font-bold mb-6 leading-[1.1] tracking-tight bg-gradient-to-b from-white via-white to-white/70 bg-clip-text text-transparent">
                Let's start a{' '}
                <span className="text-gradient-primary">conversation.</span>
              </h1>
              <p className="text-lg text-white/60 max-w-2xl mx-auto mb-10 font-light leading-relaxed">
                Whether you're a brand exploring better ways to showcase products, or just curious about what we do, we'd love to hear from you.
              </p>

              {/* Trust strip */}
              <div className="flex flex-wrap justify-center gap-6">
                {trustPoints.map((tp, i) => {
                  const Icon = tp.icon;
                  return (
                    <div
                      key={tp.text}
                      className={`flex items-center gap-2 text-sm text-white/50 transition-all duration-500 ${
                        heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                      }`}
                      style={{ transitionDelay: `${600 + i * 100}ms` }}
                    >
                      <Icon className="h-4 w-4 text-primary" />
                      <span>{tp.text}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* Contact Methods */}
        <section className="py-16 lg:py-24 relative overflow-hidden bg-transparent">
          {/* Ambient background blur */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.025] blur-[150px]" />
          </div>
          <div className="absolute inset-0 bg-grid opacity-[0.012]" />

          <div
            ref={methodsRef}
            className={`container relative z-10 mx-auto px-4 sm:px-6 max-w-5xl transition-all duration-700 ${
              methodsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Ways to <span className="text-gradient-primary">reach us</span>
              </h2>
              <p className="text-white/50 max-w-xl mx-auto text-sm font-light">Choose the method that works best for you.</p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {contactMethods.map((method, i) => {
                const Icon = method.icon;
                const isHovered = methodHover === i;
                return (
                  <div
                    key={method.label}
                    onMouseEnter={() => setMethodHover(i)}
                    onMouseLeave={() => setMethodHover(null)}
                    className={`relative p-6 rounded-2xl border transition-all duration-500 cursor-default group overflow-hidden ${
                      isHovered
                        ? 'bg-primary/5 border-primary/30 shadow-[0_20px_50px_rgba(0,229,204,0.06)] -translate-y-1'
                        : 'bg-white/[0.01] border-white/10 hover:border-white/20'
                    } ${methodsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                    style={{ transitionDelay: `${i * 100}ms` }}
                  >
                    <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-primary/10 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-all duration-500 ${
                      isHovered ? 'bg-primary text-primary-foreground scale-105 shadow-md' : 'bg-white/5 text-primary border border-white/5'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{method.label}</h3>
                    <p className="text-sm font-medium text-white/95 mb-1">{method.value}</p>
                    <p className="text-xs text-muted-foreground">{method.detail}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Reason selector + Form */}
        <section className="py-16 lg:py-28 relative overflow-hidden bg-transparent">
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.02] blur-[150px]" />
          </div>

          <div
            ref={formRef}
            className={`container relative z-10 mx-auto px-4 sm:px-6 max-w-6xl transition-all duration-700 ${
              formVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                How can we <span className="text-gradient-primary">help you?</span>
              </h2>
              <p className="text-white/50 max-w-xl mx-auto text-sm font-light">Select a reason and fill in the details. We'll get back to you promptly.</p>
            </div>

            {/* Reason cards */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
              {reasons.map((reason, i) => {
                const Icon = reason.icon;
                const isActive = selectedReason === i;
                return (
                  <button
                    key={reason.label}
                    onClick={() => setSelectedReason(isActive ? null : i)}
                    className={`text-left p-5 rounded-xl border transition-all duration-500 relative overflow-hidden group ${
                      isActive
                        ? 'bg-primary/5 border-primary/30 shadow-[0_15px_30px_rgba(0,229,204,0.04)]'
                        : 'bg-white/[0.01] border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-primary/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-3 transition-all duration-500 ${
                      isActive ? 'bg-primary text-primary-foreground shadow-md' : 'bg-white/5 text-primary border border-white/5'
                    }`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className={`font-semibold mb-1 transition-colors ${isActive ? 'text-primary' : 'text-foreground'}`}>
                      {reason.label}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">{reason.desc}</p>
                  </button>
                );
              })}
            </div>

            {/* Form */}
            <div className="max-w-3xl mx-auto">
              <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6 p-5 sm:p-8 md:p-10 rounded-2xl bg-white/[0.01] border border-white/10 backdrop-blur-xl shadow-[0_30px_80px_rgba(0,0,0,0.3)]">
                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2 text-left">
                    <Label htmlFor="name" className="text-white/70 text-xs font-semibold uppercase tracking-wider pl-1">Full Name</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      placeholder="Your name" 
                      required 
                      className="bg-white/[0.02] border-white/10 focus-visible:ring-primary/20 focus-visible:border-primary/40 placeholder:text-white/20" 
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <Label htmlFor="email" className="text-white/70 text-xs font-semibold uppercase tracking-wider pl-1">Email Address</Label>
                    <Input 
                      id="email" 
                      name="email" 
                      type="email" 
                      placeholder="you@company.com" 
                      required 
                      className="bg-white/[0.02] border-white/10 focus-visible:ring-primary/20 focus-visible:border-primary/40 placeholder:text-white/20" 
                    />
                  </div>
                </div>

                <div className="grid sm:grid-cols-2 gap-5">
                  <div className="space-y-2 text-left">
                    <Label htmlFor="phone" className="text-white/70 text-xs font-semibold uppercase tracking-wider pl-1">Phone Number</Label>
                    <Input 
                      id="phone" 
                      name="phone" 
                      type="tel" 
                      placeholder="+1 (555) 000-0000" 
                      className="bg-white/[0.02] border-white/10 focus-visible:ring-primary/20 focus-visible:border-primary/40 placeholder:text-white/20" 
                    />
                  </div>
                  <div className="space-y-2 text-left">
                    <Label htmlFor="company" className="text-white/70 text-xs font-semibold uppercase tracking-wider pl-1">Company</Label>
                    <Input 
                      id="company" 
                      name="company" 
                      placeholder="Company name" 
                      className="bg-white/[0.02] border-white/10 focus-visible:ring-primary/20 focus-visible:border-primary/40 placeholder:text-white/20" 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <div className="space-y-2 text-left">
                    <Label className="text-white/70 text-xs font-semibold uppercase tracking-wider pl-1">Company Size</Label>
                    <Select value={companySize} onValueChange={setCompanySize}>
                      <SelectTrigger className="bg-white/[0.02] border-white/10 focus:ring-primary/20 focus:border-primary/40">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#000504] border-white/10">
                        {companySizes.map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 text-left">
                    <Label className="text-white/70 text-xs font-semibold uppercase tracking-wider pl-1">Industry</Label>
                    <Select value={industry} onValueChange={setIndustry}>
                      <SelectTrigger className="bg-white/[0.02] border-white/10 focus:ring-primary/20 focus:border-primary/40">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#000504] border-white/10">
                        {industries.map((ind) => (
                          <SelectItem key={ind} value={ind}>{ind}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 text-left">
                    <Label className="text-white/70 text-xs font-semibold uppercase tracking-wider pl-1">Region</Label>
                    <Select value={region} onValueChange={setRegion}>
                      <SelectTrigger className="bg-white/[0.02] border-white/10 focus:ring-primary/20 focus:border-primary/40">
                        <SelectValue placeholder="Select" />
                      </SelectTrigger>
                      <SelectContent className="bg-[#000504] border-white/10">
                        {regions.map((r) => (
                          <SelectItem key={r} value={r}>{r}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2 text-left">
                  <Label htmlFor="message" className="text-white/70 text-xs font-semibold uppercase tracking-wider pl-1">Message</Label>
                  <Textarea
                    id="message"
                    name="message"
                    placeholder="Tell us about your needs, goals, or any questions you have..."
                    rows={5}
                    required
                    className="bg-white/[0.02] border-white/10 focus-visible:ring-primary/20 focus-visible:border-primary/40 placeholder:text-white/20 resize-none"
                  />
                </div>

                <Button type="submit" variant="hero" size="xl" className="w-full" disabled={loading}>
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Send className="h-5 w-5" />
                      Send Message
                    </span>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground mt-4">
                  By submitting, you agree to our privacy policy. We'll never share your information.
                </p>
              </form>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-16 lg:py-28 relative overflow-hidden bg-transparent">
          {/* Ambient background glow */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.025] blur-[150px]" />
          </div>
          <div className="absolute inset-0 bg-grid opacity-[0.012]" />

          <div
            ref={faqRef}
            className={`container relative z-10 mx-auto px-4 sm:px-6 max-w-3xl transition-all duration-700 ${
              faqVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Frequently asked <span className="text-gradient-primary">questions</span>
              </h2>
              <p className="text-white/50 text-sm font-light">Quick answers to common questions.</p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, i) => {
                const isOpen = activeFaq === i;
                return (
                  <button
                    key={i}
                    onClick={() => setActiveFaq(isOpen ? null : i)}
                    className={`w-full text-left p-5 rounded-xl border transition-all duration-500 relative overflow-hidden group ${
                      isOpen
                        ? 'bg-primary/5 border-primary/30 shadow-[0_10px_35px_rgba(0,229,204,0.03)]'
                        : 'bg-white/[0.01] border-white/10 hover:border-white/20'
                    } ${faqVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                    style={{ transitionDelay: `${i * 80}ms` }}
                  >
                    <div className="absolute -top-12 -right-12 w-28 h-28 rounded-full bg-primary/5 blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                    <div className="flex items-center justify-between gap-4">
                      <h3 className="font-semibold text-foreground text-sm sm:text-base group-hover:text-primary transition-colors">{faq.q}</h3>
                      <div className={`w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center border transition-all duration-300 ${
                        isOpen ? 'bg-primary border-primary rotate-45' : 'border-white/15'
                      }`}>
                        <span className={`text-xs font-bold transition-colors ${isOpen ? 'text-primary-foreground' : 'text-muted-foreground'}`}>+</span>
                      </div>
                    </div>
                    <div className={`overflow-hidden transition-all duration-500 ${isOpen ? 'max-h-40 opacity-100 mt-3' : 'max-h-0 opacity-0'}`}>
                      <p className="text-sm text-white/50 leading-relaxed font-light">{faq.a}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 lg:py-28 relative overflow-hidden bg-transparent">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/[0.03] blur-[150px]" />

          <div
            ref={ctaRef}
            className={`container relative z-10 mx-auto px-4 sm:px-6 max-w-3xl text-center transition-all duration-700 ${
              ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="p-8 sm:p-12 md:p-16 rounded-3xl border border-white/10 bg-gradient-to-tr from-white/[0.01] via-white/[0.02] to-white/[0.01] backdrop-blur-xl shadow-[0_30px_80px_rgba(0,0,0,0.3)] relative overflow-hidden">
              <div className="absolute inset-0 bg-grid opacity-[0.012] z-0" />
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">
                  Ready to see Think Decor <span className="text-gradient-primary">in action?</span>
                </h2>
                <p className="text-white/60 mb-8 max-w-lg mx-auto font-light leading-relaxed">
                  Book a personalised demo and discover how Think Decor can transform your customers' buying experience.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/book-demo">
                    <Button variant="hero" size="xl">
                      Book a Demo
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/pricing">
                    <Button variant="hero-outline" size="xl">
                      View Pricing
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
