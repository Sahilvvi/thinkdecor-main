import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { Shield, FileText } from 'lucide-react';

const sections = [
  {
    title: 'Information We Collect',
    content: [
      'Personal information such as your name, email address, and phone number when you register or contact us.',
      'Room photos and visual content that you upload to use our AI visualisation features.',
      'Usage data including how you interact with the platform, features used, and session duration.',
      'Device and browser information to ensure compatibility and improve performance.',
    ],
  },
  {
    title: 'How We Use Your Information',
    content: [
      'To provide and improve our AI-powered decor visualisation services.',
      'To personalise your experience and recommend relevant products.',
      'To communicate with you about updates, support, and marketing (with your consent).',
      'To analyse usage patterns and improve platform performance and security.',
    ],
  },
  {
    title: 'Data Sharing and Disclosure',
    content: [
      'We do not sell your personal information to third parties.',
      'We may share data with trusted service providers who assist in operating our platform.',
      'We may disclose information if required by law or to protect our legal rights.',
      'Brand partners may receive aggregated, anonymised insights — never individual user data.',
    ],
  },
  {
    title: 'Data Security',
    content: [
      'We use industry-standard encryption for data in transit and at rest.',
      'Access to personal data is restricted to authorised personnel only.',
      'Regular security audits and vulnerability assessments are conducted.',
      'We promptly investigate and respond to any suspected security incidents.',
    ],
  },
  {
    title: 'Your Rights',
    content: [
      'You can access, update, or delete your personal information at any time.',
      'You can request a copy of the data we hold about you.',
      'You can opt out of marketing communications whenever you choose.',
      'You can delete your account, which removes your data from our active systems.',
    ],
  },
  {
    title: 'Cookies and Tracking',
    content: [
      'We use cookies to maintain sessions and remember preferences.',
      'Analytics cookies help us understand how visitors use the platform.',
      'You can control cookie preferences through your browser settings.',
      'Third-party analytics tools are used with privacy-preserving configurations.',
    ],
  },
  {
    title: 'Contact Us',
    content: [
      'If you have any questions about this Privacy Policy, please contact us at info@thinkdecor.app.',
      'We are committed to resolving any privacy concerns promptly and transparently.',
    ],
  },
];

export default function Privacy() {
  const { ref: heroRef, isVisible: heroVisible } = useScrollAnimation();
  const { ref: contentRef, isVisible: contentVisible } = useScrollAnimation();

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
              <Shield className="h-4 w-4" />
              Privacy Policy
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-6 leading-tight">
              Your data, <span className="text-gradient-primary">your control.</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We are committed to protecting your privacy and being transparent about how we handle your information.
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              Last updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="pb-20 lg:pb-28 relative overflow-hidden">
          <div className="absolute inset-0 bg-card/30" />
          <div className="absolute inset-0 bg-grid opacity-[0.03]" />

          <div
            ref={contentRef}
            className={`container relative z-10 mx-auto px-4 sm:px-6 max-w-3xl transition-all duration-700 ${
              contentVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
          >
            <div className="space-y-8">
              {sections.map((section, i) => (
                <div
                  key={section.title}
                  className="p-6 sm:p-8 rounded-2xl bg-card/50 border border-border/30 hover:border-primary/20 transition-all duration-500"
                  style={{ transitionDelay: `${i * 100}ms` }}
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <h2 className="text-xl font-bold text-foreground">{section.title}</h2>
                  </div>
                  <ul className="space-y-3">
                    {section.content.map((item, j) => (
                      <li key={j} className="text-muted-foreground leading-relaxed flex items-start gap-3">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary/60 mt-2 flex-shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
