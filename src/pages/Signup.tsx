import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/brand/Logo';
import { SEO } from '@/components/shared/SEO';
import { Captcha } from '@/components/auth/Captcha';
import { useAuthStore } from '@/stores/authStore';
import { safeReturnPath } from '@/lib/returnPath';
import { CAPTCHA_ENABLED } from '@/lib/captcha';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Check, MailCheck } from 'lucide-react';
import { FREE_SIGNUP_CREDITS } from '@/lib/generation';

const benefits = [
  `${FREE_SIGNUP_CREDITS} free redesigns to start`,
  'Any phone photo — no special hardware',
  'Room templates for every style',
  'Every design saved to your library',
];

export default function Signup() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  /** Set when Supabase wants the email confirmed before the first sign-in. */
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [resending, setResending] = useState(false);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);
  const { signUp, resendConfirmation } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const captchaMissing = CAPTCHA_ENABLED && !captchaToken;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error, needsConfirmation } = await signUp(
      email.trim(),
      password,
      name.trim(),
      phone,
      captchaToken ?? undefined,
    );

    if (error) {
      toast.error(error.message || 'Failed to create account');
      setCaptchaKey((k) => k + 1); // tokens are single-use
      setIsLoading(false);
    } else if (needsConfirmation) {
      setPendingEmail(email.trim());
      setIsLoading(false);
    } else {
      toast.success('Account created — welcome to ThinkDecor');
      navigate(safeReturnPath(location.state), { replace: true });
    }
  };

  const handleResend = async () => {
    if (!pendingEmail) return;
    setResending(true);
    const { error } = await resendConfirmation(pendingEmail, captchaToken ?? undefined);
    setResending(false);
    setCaptchaKey((k) => k + 1);
    if (error) toast.error(error.message || "Couldn't resend the email");
    else toast.success('Confirmation email sent again');
  };

  return (
    <div className="flex min-h-screen bg-background">
      <SEO
        title="Create your account | ThinkDecor"
        description="Create a ThinkDecor account and redesign your first room with Mantha AI."
      />

      {/* Left panel — the pitch */}
      <div className="relative hidden flex-1 items-center justify-center overflow-hidden bg-primary lg:flex">
        <div className="pointer-events-none absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/[0.09] blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -right-16 h-80 w-80 rounded-full bg-[hsl(160_84%_45%)]/20 blur-3xl" />

        <div className="relative z-10 max-w-md p-12">
          <h2 className="text-[clamp(2rem,3.4vw,2.8rem)] font-bold leading-[1.1] tracking-[-0.03em] text-primary-foreground">
            See it redesigned.
          </h2>
          <p className="mt-5 text-[15.5px] leading-relaxed text-primary-foreground/70">
            Upload a photo of any room and Mantha AI restyles it in seconds — in the
            style you pick, keeping the space you already have.
          </p>

          <ul className="mt-9 space-y-4">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/15">
                  <Check className="h-3.5 w-3.5 text-primary-foreground" />
                </span>
                <span className="text-[14.5px] text-primary-foreground/90">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Right panel — the form */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-8 md:px-16 lg:px-24">
        <div className="mx-auto w-full max-w-md">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>

          <div className="mb-8">
            <Logo size="lg" />
          </div>

          {pendingEmail ? (
            <div>
              <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
                <MailCheck className="h-6 w-6 text-primary" />
              </span>
              <h1 className="mt-5 text-3xl font-bold tracking-[-0.02em]">Check your inbox</h1>
              <p className="mt-3 text-[15px] leading-relaxed text-muted-foreground">
                We sent a confirmation link to <span className="font-semibold text-foreground">{pendingEmail}</span>.
                Click it to finish creating your account — your {FREE_SIGNUP_CREDITS} free redesigns are waiting.
              </p>
              <div className="mt-6">
                <Captcha onToken={setCaptchaToken} resetKey={captchaKey} />
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button onClick={handleResend} variant="outline" disabled={resending || captchaMissing}>
                  {resending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                  Resend email
                </Button>
                <Button asChild variant="hero">
                  <Link to="/login" state={location.state}>Go to sign in</Link>
                </Button>
              </div>
              <p className="mt-6 text-[13px] text-muted-foreground">
                Wrong address?{' '}
                <button type="button" onClick={() => setPendingEmail(null)} className="font-medium text-primary hover:underline">
                  Start again
                </button>
              </p>
            </div>
          ) : (
            <>
              <div className="mb-8">
                <h1 className="mb-2 text-3xl font-bold tracking-[-0.02em]">Create your account</h1>
                <p className="text-muted-foreground">
                  Your first {FREE_SIGNUP_CREDITS} redesigns are free — no card needed.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Alex Morgan"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    autoComplete="tel"
                    placeholder="+44 7700 900000"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <p className="text-xs text-muted-foreground">Must be at least 6 characters</p>
                </div>

                <Captcha onToken={setCaptchaToken} resetKey={captchaKey} />

                <Button type="submit" variant="hero" className="w-full" size="lg" disabled={isLoading || captchaMissing}>
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Creating account...
                    </>
                  ) : (
                    'Create account'
                  )}
                </Button>
              </form>

              <p className="mt-8 text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <Link to="/login" state={location.state} className="font-medium text-primary hover:underline">
                  Sign in
                </Link>
              </p>

              <p className="mt-6 text-center text-xs text-muted-foreground">
                By creating an account, you agree to our{' '}
                <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
