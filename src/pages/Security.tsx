import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { ShieldCheck, Lock, Server, Eye, KeyRound, Bell } from 'lucide-react';

const pillars = [
  {
    icon: Lock,
    title: 'Encryption',
    desc: 'All data in transit is protected with TLS 1.3. Sensitive data at rest uses AES-256 encryption.',
  },
  {
    icon: Server,
    title: 'Infrastructure',
    desc: 'Our platform runs on cloud infrastructure with SOC 2 Type II certified data centres.',
  },
  {
    icon: Eye,
    title: 'Access Control',
    desc: 'Role-based access control ensures employees only access the data they need for their role.',
  },
  {
    icon: KeyRound,
    title: 'Authentication',
    desc: 'We support strong password policies and offer multi-factor authentication for all accounts.',
  },
  {
    icon: Bell,
    title: 'Monitoring',
    desc: '24/7 automated monitoring detects and alerts on suspicious activity in real time.',
  },
  {
    icon: ShieldCheck,
    title: 'Compliance',
    desc: 'We follow industry best practices and are committed to GDPR and data protection standards.',
  },
];

const practices = [
  {
    title: 'Secure Development',
    points: [
      'All code changes undergo peer review before deployment.',
      'Dependencies are regularly scanned for known vulnerabilities.',
      'Security testing is integrated into our CI/CD pipeline.',
    ],
  },
  {
    title: 'Incident Response',
    points: [
      'A dedicated security team is on call for incident response.',
      'We have a documented breach notification process.',
      'Regular tabletop exercises ensure readiness.',
    ],
  },
  {
    title: 'Data Protection',
    points: [
      'User data is isolated and never commingled between accounts.',
      'Backups are encrypted and stored in geographically separate locations.',
      'Data retention follows strict policies with automatic deletion timelines.',
    ],
  },
  {
    title: 'Third-Party Security',
    points: [
      'Vendors are vetted for security practices before integration.',
      'We only share data with processors under binding confidentiality agreements.',
      'Regular audits of third-party services are conducted.',
    ],
  },
];

export default function Security() {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { ref: pillarsRef, isVisible: pillarsVisible } = useScrollAnimation();
  const { ref: practicesRef, isVisible: practicesVisible } = useScrollAnimation();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="pt-24">
        {/* Hero */}
        <section className="py-16 lg:py-24 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[150px]" />
          </div>
          <div className="absolute inset-0 bg-grid opacity-[0.03]" />

          <div
            ref={heroRef}
            className={`container relative z-10 mx-auto px-4 sm:px-6 max-w-4xl text-center transition-all duration-700 ${
              heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium border border-primary/20 mb-6">
              <ShieldCheck className="h-4 w-4" />
              Security
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
              Built with <span className="text-gradient-primary">security in mind.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We take the protection of your data seriously. Our security program is designed to safeguard your information at every layer.
            </p>
          </div>
        </section>

        {/* Pillars */}
        <section className="py-16 lg:py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-card/30" />
          <div className="absolute inset-0 bg-grid opacity-[0.03]" />

          <div
            ref={pillarsRef}
            className={`container relative z-10 mx-auto px-4 sm:px-6 max-w-6xl transition-all duration-700 ${
              pillarsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Our Security <span className="text-gradient-primary">Pillars</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                A layered approach to protecting your data, your account, and your trust.
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pillars.map((pillar, i) => {
                const Icon = pillar.icon;
                return (
                  <div
                    key={pillar.title}
                    className={`p-6 rounded-2xl bg-card/50 border border-border/30 hover:border-primary/30 hover:shadow-[0_0_25px_hsl(var(--primary)/0.06)] transition-all duration-500 group ${
                      pillarsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                    }`}
                    style={{ transitionDelay: `${i * 100}ms` }}
                  >
                    <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary transition-colors duration-300">
                      <Icon className="h-6 w-6 text-primary group-hover:text-primary-foreground transition-colors duration-300" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground mb-2">{pillar.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{pillar.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Practices */}
        <section className="pb-20 lg:pb-28 relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-primary/5 blur-[150px]" />
          </div>

          <div
            ref={practicesRef}
            className={`container relative z-10 mx-auto px-4 sm:px-6 max-w-4xl transition-all duration-700 ${
              practicesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="text-center mb-14">
              <h2 className="text-3xl sm:text-4xl font-bold mb-4">
                Security <span className="text-gradient-primary">Practices</span>
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                The operational measures we follow every day to keep the platform secure.
              </p>
            </div>

            <div className="space-y-6">
              {practices.map((practice, i) => (
                <div
                  key={practice.title}
                  className={`p-6 sm:p-8 rounded-2xl bg-card/50 border border-border/30 hover:border-primary/20 transition-all duration-500 ${
                    practicesVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
                  }`}
                  style={{ transitionDelay: `${i * 150}ms` }}
                >
                  <h3 className="text-xl font-bold text-foreground mb-4">{practice.title}</h3>
                  <ul className="space-y-3">
                    {practice.points.map((point, j) => (
                      <li key={j} className="text-muted-foreground leading-relaxed flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 flex-shrink-0" />
                        {point}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-muted-foreground">
                Have a security concern or want to report a vulnerability? Contact us at{' '}
                <a href="mailto:info@thinkdecor.app" className="text-primary hover:underline">
                  info@thinkdecor.app
                </a>
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
