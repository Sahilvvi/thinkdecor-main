import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SEO } from '@/components/shared/SEO';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Briefcase, MapPin, Clock, ArrowRight, Users, Zap, Heart, Globe, Shield, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const openRoles = [
  {
    title: 'Senior Full-Stack Engineer',
    team: 'Engineering',
    location: 'Northampton, UK (Hybrid)',
    type: 'Full-time',
    desc: 'Build and scale the core platform powering our AI visualisation engine. Strong React and Node.js experience preferred.',
  },
  {
    title: 'AI / ML Engineer',
    team: 'AI Research',
    location: 'Northampton, UK (Hybrid)',
    type: 'Full-time',
    desc: 'Research and implement state-of-the-art computer vision models for room segmentation and photorealistic product rendering.',
  },
  {
    title: 'Product Designer',
    team: 'Design',
    location: 'Northampton, UK (Remote-friendly)',
    type: 'Full-time',
    desc: 'Shape the end-to-end experience for millions of homeowners and brands. You care deeply about clarity, simplicity, and beauty.',
  },
  {
    title: 'Brand Partnerships Manager',
    team: 'Sales',
    location: 'Northampton, UK (Hybrid)',
    type: 'Full-time',
    desc: 'Own and grow relationships with our furniture and decor brand partners across the UK and Europe.',
  },
  {
    title: 'Content & SEO Strategist',
    team: 'Marketing',
    location: 'Remote (UK-based)',
    type: 'Full-time',
    desc: 'Drive organic growth through high-quality content, keyword strategy, and editorial planning for our blog and landing pages.',
  },
  {
    title: 'Customer Success Manager',
    team: 'Operations',
    location: 'Northampton, UK (Hybrid)',
    type: 'Full-time',
    desc: 'Be the face of Think Decor for our enterprise brand partners — onboarding, support, and long-term account growth.',
  },
];

const perks = [
  { icon: Globe, label: 'Remote-friendly culture', desc: 'Work from anywhere in the UK with hybrid options in Northampton.' },
  { icon: Zap, label: 'Cutting-edge tech', desc: 'Work with the latest in AI, AR, and computer vision every day.' },
  { icon: Heart, label: 'Healthcare & wellness', desc: 'Private health insurance and a monthly wellness allowance.' },
  { icon: Users, label: 'Small & mighty team', desc: 'Your work ships fast and has real, visible impact from day one.' },
  { icon: Rocket, label: 'Equity & growth', desc: 'Meaningful equity, clear career progression, and a generous L&D budget.' },
  { icon: Shield, label: 'Pension scheme', desc: 'UK workplace pension with employer contributions above minimum.' },
];

const values = [
  { title: 'Honesty over hype', body: 'We say what we mean. We ship what we promise. Trust is our most valuable asset.' },
  { title: 'Clarity drives quality', body: 'Complex problems deserve clear thinking. We simplify before we build.' },
  { title: 'People first', body: 'Great teams build great products. We invest in people before processes.' },
];

export default function Careers() {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { ref: valuesRef, isVisible: valuesVisible } = useScrollAnimation();
  const { ref: perksRef, isVisible: perksVisible } = useScrollAnimation();
  const { ref: rolesRef, isVisible: rolesVisible } = useScrollAnimation();
  const { ref: ctaRef, isVisible: ctaVisible } = useScrollAnimation();

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Careers at ThinkDecor | Join Our AI Interior Design Team"
        description="Join ThinkDecor and help build the future of AI-powered interior design. We're hiring engineers, designers, and more — based in Northampton, UK with remote options."
        canonical="https://thinkdecor.app/careers"
      />
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
            className={`container relative z-10 mx-auto px-4 sm:px-6 max-w-4xl text-center transition-all duration-700 ${
              heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 mb-6">
              <Briefcase className="h-4 w-4" />
              Careers at Think Decor
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Build the future of{' '}
              <span className="text-gradient-primary">intelligent decor.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              We're a small, ambitious team based in Northampton, UK, on a mission to make 
              decor decisions smarter, easier, and more confident for everyone.
              Come build with us.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="#open-roles">
                <Button variant="hero" size="xl">
                  See Open Roles
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </a>
              <Link to="/about">
                <Button variant="hero-outline" size="xl">
                  Learn About Us
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Values */}
        <section className="py-16 lg:py-24 relative overflow-hidden">
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
              <p className="text-muted-foreground max-w-xl mx-auto">
                Our values aren't on a wall — they live in how we hire, build, and ship.
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-6">
              {values.map((v, i) => (
                <div
                  key={v.title}
                  className={`p-6 sm:p-8 rounded-2xl bg-card/50 border border-border/30 hover:border-primary/30 transition-all duration-500 hover:shadow-[0_0_25px_hsl(var(--primary)/0.06)] ${
                    valuesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                    <span className="text-primary font-bold text-lg">{i + 1}</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2">{v.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{v.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Perks */}
        <section className="py-16 lg:py-24 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[150px]" />

          <div
            ref={perksRef}
            className={`container relative z-10 mx-auto px-4 sm:px-6 max-w-5xl transition-all duration-700 ${
              perksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Why join <span className="text-gradient-primary">Think Decor?</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                We offer a competitive package with benefits designed for people, not just employees.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {perks.map((perk, i) => {
                const Icon = perk.icon;
                return (
                  <div
                    key={perk.label}
                    className={`p-6 rounded-2xl bg-card/50 border border-border/30 hover:border-primary/30 transition-all duration-500 group ${
                      perksVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                    style={{ transitionDelay: `${i * 80}ms` }}
                  >
                    <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary transition-colors duration-300">
                      <Icon className="h-5 w-5 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                    </div>
                    <h3 className="font-bold text-foreground mb-1">{perk.label}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{perk.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Open Roles */}
        <section id="open-roles" className="py-16 lg:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-card/30" />
          <div className="absolute inset-0 bg-grid opacity-[0.03]" />

          <div
            ref={rolesRef}
            className={`container relative z-10 mx-auto px-4 sm:px-6 max-w-4xl transition-all duration-700 ${
              rolesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Open <span className="text-gradient-primary">roles</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                All positions are based in Northampton with hybrid or remote-friendly options.
              </p>
            </div>

            <div className="space-y-4">
              {openRoles.map((role, i) => (
                <div
                  key={role.title}
                  className={`p-6 sm:p-7 rounded-2xl bg-card/50 border border-border/30 hover:border-primary/30 transition-all duration-500 hover:shadow-[0_0_25px_hsl(var(--primary)/0.06)] group cursor-pointer ${
                    rolesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${i * 80}ms` }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className="px-2.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
                          {role.team}
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-card text-muted-foreground text-xs font-medium border border-border/50 flex items-center gap-1">
                          <Clock className="h-3 w-3" /> {role.type}
                        </span>
                        <span className="px-2.5 py-1 rounded-full bg-card text-muted-foreground text-xs font-medium border border-border/50 flex items-center gap-1">
                          <MapPin className="h-3 w-3" /> {role.location}
                        </span>
                      </div>
                      <h3 className="text-lg font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                        {role.title}
                      </h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{role.desc}</p>
                    </div>
                    <div className="flex-shrink-0 flex items-center gap-2 text-primary text-sm font-semibold group-hover:gap-3 transition-all duration-300 mt-1">
                      Apply <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20 lg:py-28 relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[150px]" />

          <div
            ref={ctaRef}
            className={`container relative z-10 mx-auto px-4 sm:px-6 max-w-3xl text-center transition-all duration-700 ${
              ctaVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="p-8 sm:p-12 md:p-16 rounded-3xl border border-border/30 bg-card/40 relative overflow-hidden">
              <div className="absolute inset-0 bg-grid opacity-[0.02] z-0" />
              <div className="relative z-10">
                <h2 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">
                  Don't see the right <span className="text-gradient-primary">role?</span>
                </h2>
                <p className="text-muted-foreground mb-8 max-w-lg mx-auto leading-relaxed">
                  We're always interested in hearing from exceptional people. 
                  Send us your CV and a note about what you'd love to work on.
                </p>
                <Link to="/contact">
                  <Button variant="hero" size="xl">
                    Get in Touch
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
                <p className="text-xs text-muted-foreground mt-6">
                  Think Decor Ltd is an equal opportunity employer. We celebrate diversity and are committed to creating an inclusive environment for all employees.
                </p>
              </div>
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </div>
  );
}
