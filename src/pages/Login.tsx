import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Logo } from '@/components/brand/Logo';
import { SEO } from '@/components/shared/SEO';
import { Captcha } from '@/components/auth/Captcha';
import { Reveal, Stagger, staggerItem } from '@/components/premium/Motion';
import { useAuthStore } from '@/stores/authStore';
import { safeReturnPath } from '@/lib/returnPath';
import { CAPTCHA_ENABLED } from '@/lib/captcha';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, Check, Eye, EyeOff } from 'lucide-react';

// Mirrors the "Your rooms are waiting" checklist from the design prototype —
// restated from this page's own copy rather than invented from scratch.
const benefits = [
  'Upload a photo, pick a style',
  'Mantha AI does the rest',
  'Every design saved to your library',
];

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<'google' | 'apple' | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [captchaKey, setCaptchaKey] = useState(0);
  const { signIn, signInWithOAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  // ProtectedRoute (and the pricing page) pass where the visitor was headed —
  // send them back there instead of always dumping them on the overview.
  const destination = safeReturnPath(location.state);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(email, password, captchaToken ?? undefined);

    if (error) {
      toast.error(error.message || 'Failed to sign in');
      setCaptchaKey((k) => k + 1); // tokens are single-use
      setIsLoading(false);
    } else {
      toast.success('Welcome back!');
      navigate(destination, { replace: true });
    }
  };

  const handleOAuth = async (provider: 'google' | 'apple') => {
    setOauthLoading(provider);
    const { error } = await signInWithOAuth(provider);
    if (error) {
      toast.error(error.message || `Couldn't sign in with ${provider === 'google' ? 'Google' : 'Apple'}`);
      setOauthLoading(null);
    }
    // On success Supabase redirects the browser away — nothing left to reset.
  };

  return (
    <div className="flex min-h-screen bg-background">
      <SEO title="Sign in | ThinkDecor" description="Sign in to your ThinkDecor account." />

      {/* Left panel — the form */}
      <div
        className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-8 md:px-16 lg:px-24"
        style={{
          background:
            'radial-gradient(70% 50% at 100% 0%, rgba(0,160,140,.16), transparent 60%), linear-gradient(180deg, #FFFFFF, #EEF7F5)',
        }}
      >
        <div className="mx-auto w-full max-w-md">
          <Reveal>
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

            <div className="mb-8">
              <h1 className="mb-2 font-display text-[clamp(1.9rem,3.2vw,2.6rem)] font-normal tracking-[-0.01em] text-[hsl(var(--primary))]">
                Sign in
              </h1>
              <p className="text-muted-foreground">Pick up where you left off.</p>
            </div>
          </Reveal>

          <Stagger className="space-y-5">
            <motion.div variants={staggerItem} className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => handleOAuth('google')}
                disabled={oauthLoading !== null || isLoading}
                className="flex items-center justify-center gap-2.5 rounded-2xl border border-border bg-white px-4 py-3.5 font-label text-sm font-bold text-foreground shadow-sm transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50"
              >
                {oauthLoading === 'google' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-secondary font-label text-xs font-extrabold text-primary">
                    G
                  </span>
                )}
                Google
              </button>
              <button
                type="button"
                onClick={() => handleOAuth('apple')}
                disabled={oauthLoading !== null || isLoading}
                className="flex items-center justify-center gap-2.5 rounded-2xl border border-border bg-white px-4 py-3.5 font-label text-sm font-bold text-foreground shadow-sm transition-transform hover:-translate-y-0.5 disabled:pointer-events-none disabled:opacity-50"
              >
                {oauthLoading === 'apple' ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-secondary font-label text-xs font-extrabold text-primary">
                    A
                  </span>
                )}
                Apple
              </button>
            </motion.div>

            <motion.div
              variants={staggerItem}
              className="flex items-center gap-3 font-label text-xs font-bold uppercase tracking-[0.14em] text-muted-foreground"
            >
              <span className="h-px flex-1 bg-border" />
              or with email
              <span className="h-px flex-1 bg-border" />
            </motion.div>

            <motion.form onSubmit={handleSubmit} variants={staggerItem} className="space-y-5">
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
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
                <label className="flex cursor-pointer items-center gap-2 text-muted-foreground">
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-border accent-primary" />
                  Remember me
                </label>
                <Link to="/forgot-password" className="font-medium text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>

              <Captcha onToken={setCaptchaToken} resetKey={captchaKey} />

              <Button
                type="submit"
                variant="hero"
                className="w-full"
                size="lg"
                disabled={isLoading || (CAPTCHA_ENABLED && !captchaToken)}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            </motion.form>

            <motion.p variants={staggerItem} className="text-center text-sm text-muted-foreground">
              Don't have an account?{' '}
              <Link to="/signup" state={location.state} className="font-medium text-primary hover:underline">
                Create one free
              </Link>
            </motion.p>
          </Stagger>
        </div>
      </div>

      {/* Right panel — the art */}
      <div className="relative hidden flex-1 items-end overflow-hidden lg:flex">
        <img
          src="/assets/samples/styled_room.png"
          alt="A living room redesigned with ThinkDecor"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(180deg, rgba(0,51,44,.15), rgba(0,51,44,.35) 40%, rgba(0,51,44,.93)), radial-gradient(60% 50% at 0% 100%, rgba(0,160,140,.5), transparent 70%)',
          }}
        />

        <Reveal className="relative z-10 max-w-md p-12 pb-16">
          <span className="font-label text-xs font-bold uppercase tracking-[0.16em] text-[#8FE3D4]">
            Welcome back
          </span>
          <h2 className="mt-3 font-display text-[clamp(2.2rem,4vw,3.4rem)] font-normal leading-[0.95] text-white">
            Your rooms, <em className="italic text-[#8FE3D4]">redesigned.</em>
          </h2>

          <ul className="mt-8 grid gap-2.5">
            {benefits.map((benefit) => (
              <li key={benefit} className="flex items-center gap-3">
                <span className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-white/[0.18] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.35)]">
                  <Check className="h-3.5 w-3.5 text-white" />
                </span>
                <span className="text-[15px] text-white/90">{benefit}</span>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </div>
  );
}
